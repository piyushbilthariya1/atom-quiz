from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.db.redis import connect_to_redis, close_redis_connection
from app.services.websocket_manager import manager

from app.api.endpoints import quizzes

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(quizzes.router, tags=["Quizzes"], prefix="/api/quizzes")

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], # Allow all for dev
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.on_event("startup")
async def startup_event():
    try:
        await connect_to_mongo()
        await connect_to_redis()
    except Exception as e:
        print(f"Startup Warning: Could not connect to Database: {e}")
        # We don't raise here so the server still starts. 
        # API endpoints using DB will fail, but static/healthcheck will work.

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    await close_redis_connection()

@app.get("/")
async def root():
    return {"message": "Welcome to QuizPulse API"}

from app.db.mongodb import get_database
from bson import ObjectId

import random
import string
from pydantic import BaseModel

class CreateRoomRequest(BaseModel):
    quiz_id: str

@app.post("/api/create-room")
async def create_room_endpoint(request: CreateRoomRequest):
    room_code = ''.join(random.choices(string.digits, k=6))
    
    # Ensure uniqueness (simple check)
    while room_code in manager.active_connections:
        room_code = ''.join(random.choices(string.digits, k=6))

    try:
        db = await get_database()
        if ObjectId.is_valid(request.quiz_id):
             quiz = await db["quizzes"].find_one({"_id": ObjectId(request.quiz_id)})
             if quiz:
                 # Initialize room with quiz questions
                 # Note: We are setting state in the Single Manager Instance
                 manager.room_states[room_code] = {
                     "status": "lobby",
                     "current_question": -1,
                     "quiz_data": quiz, 
                     "questions": quiz.get("questions", []),
                     "participants": [],
                     "leaderboard": []
                 }
                 # Pre-populate active_connections dict so connection logic knows room exists
                 # (Optional, but good for validation)
                 manager.active_connections[room_code] = {}
                 
                 return {"room_code": room_code}
    except Exception as e:
        print(f"Error creating room: {e}")
        
    raise HTTPException(status_code=500, detail="Failed to create room")

@app.websocket("/ws/{room_code}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, client_id: str):
    # Only allow connection if room has been initialized via API
    # (Or if it's already active)
    
    # Note: manager.connect will handle the actual acceptance and tracking
    if room_code not in manager.room_states and room_code not in manager.active_connections:
         # Room doesn't exist. Reject.
         await websocket.close(code=4000) # Custom code for "Room Not Found"
         return

    await manager.connect(room_code, client_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo logic for now, enabling room broadcast
            await manager.broadcast(room_code, {"type": "chat", "user": client_id, "msg": data}, exclude_player=client_id)
    except WebSocketDisconnect:
        manager.disconnect(room_code, client_id)
        await manager.broadcast(room_code, {"type": "disconnect", "user": client_id})


