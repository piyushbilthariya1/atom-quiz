from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from .organization import PyObjectId

class Option(BaseModel):
    text: str
    is_correct: bool

class Question(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    text: str
    options: List[Option]
    time_limit: int = 30  # seconds
    points: int = 100
    category: Optional[str] = None
    difficulty: str = "medium" # easy, medium, hard

class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    topic: str
    difficulty_level: str = "mixed"

class QuizCreate(QuizBase):
    organization_id: str
    created_by: str # User ID
    questions: List[Question] = []

class QuizDB(QuizBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    organization_id: str
    created_by: str
    questions: List[Question] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
