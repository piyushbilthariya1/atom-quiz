from typing import Dict, List
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # active_connections: {room_code: {player_id: WebSocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        
        # In-memory minimal state for quick sync (backup to Redis)
        # room_state: {room_code: {status: str, current_question: int}}
        self.room_states: Dict[str, dict] = {}

    async def connect(self, room_code: str, player_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = {}
            self.room_states[room_code] = {"status": "lobby", "current_question": -1}
        
        if "participants" not in self.room_states[room_code]:
             self.room_states[room_code]["participants"] = []

        # Check if user already in list to avoid duplicates on reconnect
        existing_user = next((p for p in self.room_states[room_code]["participants"] if p["id"] == player_id), None)
        
        if not existing_user:
             # Since client_id passed in URL IS the nickname based on frontend logic
             new_participant = {"id": player_id, "nickname": player_id, "score": 0}
             self.room_states[room_code]["participants"].append(new_participant)

        self.active_connections[room_code][player_id] = websocket
        logger.info(f"Player {player_id} connected to room {room_code}")
        
        # Send current state to only the new player (State Recovery)
        await self.send_personal_message(
            {
                "type": "state_sync", 
                "payload": self.room_states.get(room_code, {})
            }, 
            websocket
        )

        # Broadcast participant list update to EVERYONE (including host)
        await self.broadcast(
            room_code, 
            {
                "type": "participant_update", 
                "payload": self.room_states[room_code]["participants"]
            }
        )


    def disconnect(self, room_code: str, player_id: str):
        if room_code in self.active_connections:
            if player_id in self.active_connections[room_code]:
                del self.active_connections[room_code][player_id]
                logger.info(f"Player {player_id} disconnected from room {room_code}")
            
            # Clean up empty rooms
            if not self.active_connections[room_code]:
                del self.active_connections[room_code]
                if room_code in self.room_states:
                    del self.room_states[room_code]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")

    async def handle_command(self, room_code: str, player_id: str, message: dict):
        if room_code not in self.room_states:
            return

        cmd_type = message.get("type")
        payload = message.get("payload", {})
        state = self.room_states[room_code]

        if cmd_type == "start_game":
            # Only host should call this? We assume host logic is handled by frontend access or basic separate endpoint, 
            # but usually websockets are open. For MVP, we trust the command.
            state["status"] = "countdown"
            state["current_question"] = -1
            self.room_states[room_code] = state # Persist
            
            # Broadcast start
            await self.broadcast(room_code, {"type": "game_start"})
            
            # Start first question after delay? Or host triggers next?
            # HostView logic implies manual "Start" then maybe manual "Next"?
            # Let's assume Host triggers "Next Question" manually after splash.

        elif cmd_type == "next_question":
            current_q = state.get("current_question", -1)
            questions = state.get("questions", [])
            next_idx = current_q + 1

            if next_idx < len(questions):
                state["current_question"] = next_idx
                state["status"] = "question"
                self.room_states[room_code] = state

                question = questions[next_idx]
                
                # Broadcast new question
                await self.broadcast(room_code, {
                    "type": "new_question",
                    "payload": {
                        "question": {
                            "text": question.get("text"),
                            "options": [{"text": o.get("text")} for o in question.get("options", [])],
                            "id": str(next_idx) # Simple ID
                        },
                        "timeLimit": question.get("time_limit", 30),
                        "index": next_idx,
                        "total": len(questions)
                    }
                })
            else:
                # End of Game
                state["status"] = "leaderboard"
                self.room_states[room_code] = state
                
                # Sort leaderboard
                sorted_participants = sorted(state.get("participants", []), key=lambda x: x["score"], reverse=True)
                
                await self.broadcast(room_code, {
                    "type": "leaderboard_update", 
                    "payload": sorted_participants
                })

        elif cmd_type == "submit_answer":
            if state.get("status") != "question":
                return # Ignore late answers
            
            q_idx = state.get("current_question")
            if q_idx == -1: return

            questions = state.get("questions", [])
            if q_idx >= len(questions): return

            question = questions[q_idx]
            option_idx = payload.get("optionIdx")
            
            # Validation
            if option_idx is None or not isinstance(option_idx, int): return
            
            options = question.get("options", [])
            if 0 <= option_idx < len(options):
                is_correct = options[option_idx].get("is_correct", False)
                
                if is_correct:
                    # Find player and update score
                    for p in state.get("participants", []):
                        if p["id"] == player_id:
                            # Score logic: 100 points base + time bonus? For now fixed 100.
                            p["score"] = p.get("score", 0) + 100
                            break
                    
                    # Optional: Broadcast live score? Or wait for leaderboard.
                    # Host might want to see who answered?
                    pass
        
        elif cmd_type == "game_over":
             state["status"] = "game_over"
             self.room_states[room_code] = state
             await self.broadcast(room_code, {"type": "game_over"})

    async def broadcast(self, room_code: str, message: dict, exclude_player: str = None):
        if room_code in self.active_connections:
            for player_id, connection in self.active_connections[room_code].items():
                if player_id != exclude_player:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                         # logger.error(f"Error broadcasting to {player_id}: {e}")
                         pass

    async def get_room_count(self, room_code: str) -> int:
        return len(self.active_connections.get(room_code, {}))

manager = ConnectionManager()
