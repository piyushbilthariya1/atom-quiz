from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from bson import ObjectId
from .organization import PyObjectId

class Participant(BaseModel):
    user_id: Optional[str] = None # Optional if guest
    nickname: str
    score: int = 0
    streak: int = 0
    connected: bool = True

class GameState(BaseModel):
    status: str = "lobby"  # lobby, countdown, question_active, processing_results, leaderboard, finished
    current_question_index: int = -1
    question_start_time: Optional[datetime] = None
    responses: Dict[str, str] = {} # {participant_id: option_id}

class GameSessionDB(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    quiz_id: str
    host_id: str
    room_code: str # 6-digit code
    participants: Dict[str, Participant] = {} # {participant_id: Participant}
    state: GameState = GameState()
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
