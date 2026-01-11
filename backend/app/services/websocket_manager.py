from typing import Dict, List
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # active_connections: {room_code: {player_id: WebSocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        
        # room_state: {room_code: {status: str, quiz_data: dict, participants: list}}
        self.room_states: Dict[str, dict] = {}

    async def connect(self, room_code: str, player_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = {}
            # Initialize room state if not exists (usually created by API, but just in case)
            if room_code not in self.room_states:
                self.room_states[room_code] = {"status": "lobby", "participants": []}
        
        # Initialize participants list if missing
        if "participants" not in self.room_states[room_code]:
             self.room_states[room_code]["participants"] = []

        # Check if user already in list to avoid duplicates on reconnect
        existing_user = next((p for p in self.room_states[room_code]["participants"] if p["id"] == player_id), None)
        
        if not existing_user:
             # NTA-Style: Track answers map and completion status
             new_participant = {
                 "id": player_id, 
                 "nickname": player_id, 
                 "score": 0,
                 "answers": {}, # {"questionId": optionIdx}
                 "completed": False
             }
             self.room_states[room_code]["participants"].append(new_participant)

        self.active_connections[room_code][player_id] = websocket
        logger.info(f"Player {player_id} connected to room {room_code}")
        
        # State Recovery: Send current state covering everything the user needs
        start_payload = {}
        state = self.room_states.get(room_code, {})
        
        if state.get("status") in ["active", "countdown"]:
             # If game is running, send questions and their current answers
             questions_sanitized = self._get_sanitized_questions(state.get("quiz_data", {}))
             user_record = next((p for p in state["participants"] if p["id"] == player_id), {})
             start_payload = {
                 "questions": questions_sanitized,
                 "my_answers": user_record.get("answers", {}),
                 "status": state.get("status")
             }

        await self.send_personal_message(
            {
                "type": "state_sync", 
                "payload": {**state, **start_payload}
            }, 
            websocket
        )

        # Broadcast participant list update to EVERYONE
        await self.broadcast_participants(room_code)


    def disconnect(self, room_code: str, player_id: str):
        if room_code in self.active_connections:
            if player_id in self.active_connections[room_code]:
                del self.active_connections[room_code][player_id]
                logger.info(f"Player {player_id} disconnected from room {room_code}")
            
            if not self.active_connections[room_code]:
                del self.active_connections[room_code]
                # We KEEP room_state for a while in a real app, but here maybe clean up
                # if room_code in self.room_states: del self.room_states[room_code]

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
            # Host starts the test
            state["status"] = "active"
            self.room_states[room_code] = state
            
            # Broadcast FULL question set (sanitized) to all users
            # Assuming quiz_data is set at room creation
            questions = self._get_sanitized_questions(state.get("quiz_data", {}))
            
            await self.broadcast(room_code, {
                "type": "game_start", 
                "payload": { "questions": questions }
            })

        elif cmd_type == "submit_answer":
            # User submits an answer for a specific question
            # Payload: { "questionId": "0", "optionIdx": 1 }
            if state.get("status") != "active":
                return 

            q_id = str(payload.get("questionId"))
            opt_idx = payload.get("optionIdx")
            
            for p in state["participants"]:
                if p["id"] == player_id:
                    # Update their answer map
                    p["answers"][q_id] = opt_idx
                    break
            
            # Use 'state' update (no broadcast needed for every click, maybe just throttle stats)
            # Maybe broadcast progress update to Host?
            # Let's broadcast "participant_progress" only to Host? 
            # For simplicity, broadcast participants list again so Host War Room updates
            await self.broadcast_participants(room_code)

        elif cmd_type == "submit_test":
            # User manually finishes test
            for p in state["participants"]:
                if p["id"] == player_id:
                    p["completed"] = True
                    break
            await self.broadcast_participants(room_code)

        elif cmd_type == "force_submit":
            # Host ends the test for everyone. GRADING TIME.
            state["status"] = "leaderboard"
            
            quiz_data = state.get("quiz_data", {})
            questions = quiz_data.get("questions", [])
            
            # Grade everyone
            for p in state["participants"]:
                score = 0
                user_answers = p.get("answers", {})
                
                # Iterate all questions
                for i, q in enumerate(questions):
                    q_id = str(i) # Using index as ID for now
                    if q_id in user_answers:
                        user_opt_idx = user_answers[q_id]
                        options = q.get("options", [])
                        if 0 <= user_opt_idx < len(options) and options[user_opt_idx].get("is_correct"):
                            score += q.get("points", 100)
                
                p["score"] = score
                p["completed"] = True
            
            self.room_states[room_code] = state
            
            # Sort leaderboard
            sorted_participants = sorted(state.get("participants", []), key=lambda x: x["score"], reverse=True)
            
            await self.broadcast(room_code, {
                "type": "game_over", 
                "payload": { "leaderboard": sorted_participants }
            })

    async def broadcast(self, room_code: str, message: dict, exclude_player: str = None):
        if room_code in self.active_connections:
            for player_id, connection in self.active_connections[room_code].items():
                if player_id != exclude_player:
                    try:
                        await connection.send_json(message)
                    except Exception:
                         pass

    async def broadcast_participants(self, room_code: str):
        if room_code in self.room_states:
             await self.broadcast(
                room_code, 
                {
                    "type": "participant_update", 
                    "payload": self.room_states[room_code]["participants"]
                }
            )

    def _get_sanitized_questions(self, quiz_data: dict) -> list:
        # Helper to strip is_correct
        safe_questions = []
        raw_questions = quiz_data.get("questions", [])
        for idx, q in enumerate(raw_questions):
            safe_q = {
                "id": str(idx),
                "text": q.get("text"),
                "options": [{"text": o.get("text")} for o in q.get("options", [])],
                "timeLimit": q.get("time_limit", 30)
            }
            safe_questions.append(safe_q)
        return safe_questions

manager = ConnectionManager()
