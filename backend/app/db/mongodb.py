from motor.motor_asyncio import AsyncIOMotorClient
from ..core.config import settings

class Database:
    client: AsyncIOMotorClient = None

db = Database()

from fastapi import HTTPException

async def get_database():
    if db.client is None:
        raise HTTPException(status_code=503, detail="Database connection is not available. Please start MongoDB.")
    return db.client[settings.DATABASE_NAME]

import certifi

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGODB_URL, tlsCAFile=certifi.where())
    print("Connected to MongoDB")

async def close_mongo_connection():
    db.client.close()
    print("Closed MongoDB connection")
