import asyncio
from app.db.mongodb import connect_to_mongo, get_database, close_mongo_connection
from app.models.user import UserDB

async def test():
    await connect_to_mongo()
    db = await get_database()
    
    user_obj = UserDB(
        email="test@quizpulse.xyz",
        username="test",
        full_name="Test",
        role="admin",
        hashed_password="hash",
        organization_ids=[]
    )
    
    try:
        user_dict = user_obj.dict(by_alias=True, exclude={"id"})
        print("Dict:", user_dict)
        res = await db["users"].insert_one(user_dict)
        print("Inserted:", res.inserted_id)
    except Exception as e:
        import traceback
        traceback.print_exc()

    await close_mongo_connection()

asyncio.run(test())
