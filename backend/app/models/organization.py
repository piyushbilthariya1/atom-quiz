from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from pydantic_core import core_schema

class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: Any
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.no_info_plain_validator_function(cls.validate),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    slug: str = Field(..., min_length=3, max_length=20, pattern="^[a-z0-9-]+$") # Ensure URL safe
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationDB(OrganizationBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    owner_id: str
    members: List[str] = [] # List of User IDs

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
