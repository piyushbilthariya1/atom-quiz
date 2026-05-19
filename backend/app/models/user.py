from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId
from .organization import PyObjectId

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: str = "participant" # admin, participant
    is_active: bool = True
    is_superuser: bool = False

class UserCreate(UserBase):
    password: str

class UserDB(UserBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    hashed_password: str
    organization_ids: List[str] = [] # List of Org IDs this user belongs to
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
