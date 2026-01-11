import redis.asyncio as redis
from ..core.config import settings

class RedisClient:
    client: redis.Redis = None

redis_client = RedisClient()

async def connect_to_redis():
    redis_client.client = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
    print("Connected to Redis")

async def close_redis_connection():
    await redis_client.client.close()
    print("Closed Redis connection")
