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

    async def broadcast(self, room_code: str, message: dict, exclude_player: str = None):
        if room_code in self.active_connections:
            # Game Logic Interception
            msg_type = message.get("type")
            state = self.room_states.get(room_code, {})
            
            if msg_type == "start_game":
                state["status"] = "countdown"
                message["type"] = "game_start" # Uniform type for clients
                
            elif msg_type == "next_question":
                # Advance question index
                current_q = state.get("current_question", -1)
                questions = state.get("questions", [])
                
                next_idx = current_q + 1
                
                if next_idx < len(questions):
                    state["current_question"] = next_idx
                    state["status"] = "question"
                    
                    # Send new question payload
                    question = questions[next_idx]
                    # ensure id is string if needed, or pydantic handles it
                    
                    # Convert to client-safe question (hide correct answer if needed, but for now sending full)
                    # Ideally we should strip is_correct from options for participants
                    
                    message = {
                        "type": "new_question",
                        "payload": {
                            "question": question,
                            "timeLimit": question.get("time_limit", 30),
                            "index": next_idx,
                            "total": len(questions)
                        }
                    }
                else:
                    # End of Quiz
                    state["status"] = "leaderboard" # or directly game over?
                    # Let's say we go to leaderboard after last question, then host clicks End Game
                    # But if we want to auto-end:
                    # message = {"type": "game_over"}
                    # state["status"] = "game_over"
                    
                    # For now, let's just cycle to Leaderboard as per HostView logic
                    state["status"] = "leaderboard"
                    message = {"type": "leaderboard_update", "payload": state.get("leaderboard", [])}

            elif msg_type == "game_over":
                 state["status"] = "game_over"

            # Update state persistence
            self.room_states[room_code] = state

            for player_id, connection in self.active_connections[room_code].items():
                if player_id != exclude_player:
                    try:
                        await connection.send_json(message)
                    except Exception as e:
                         logger.error(f"Error broadcasting to {player_id}: {e}")
                        # Potential optimization: mark for disconnect

    async def get_room_count(self, room_code: str) -> int:
        return len(self.active_connections.get(room_code, {}))

manager = ConnectionManager()
