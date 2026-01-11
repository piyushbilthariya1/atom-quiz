from fastapi import APIRouter, Body, HTTPException, status
from fastapi.responses import JSONResponse
from typing import List, Optional
from app.models.quiz import QuizDB, QuizCreate
from app.db.mongodb import get_database
from bson import ObjectId
from datetime import datetime

router = APIRouter()

from fastapi.encoders import jsonable_encoder

@router.post("/", response_description="Add new quiz", response_model=QuizDB)
async def create_quiz(quiz: QuizCreate = Body(...)):
    db = await get_database()
    quiz_op = jsonable_encoder(quiz)
    # Assuming Pydantic v2 from context, but let's try standard way.
    # Actually context said pydantic-settings because of V2. So it is V2.
    # In V2 .dict() is deprecated for .model_dump(). I'll use jsonable_encoder or just dict() which usually still works.
    
    quiz_op["created_at"] = datetime.utcnow()
    quiz_op["updated_at"] = datetime.utcnow()
    
    new_quiz = await db["quizzes"].insert_one(quiz_op)
    created_quiz = await db["quizzes"].find_one({"_id": new_quiz.inserted_id})
    return created_quiz

@router.get("/", response_description="List all quizzes", response_model=List[QuizDB])
async def list_quizzes():
    db = await get_database()
    quizzes = await db["quizzes"].find().to_list(1000)
    return quizzes

@router.get("/{id}", response_description="Get a single quiz", response_model=QuizDB)
async def show_quiz(id: str):
    db = await get_database()
    if (quiz := await db["quizzes"].find_one({"_id": id})) is not None:
        return quiz
    # Try ObjectId if string lookup fail
    try:
        if (quiz := await db["quizzes"].find_one({"_id": ObjectId(id)})) is not None:
            return quiz
    except:
        pass
        
    raise HTTPException(status_code=404, detail=f"Quiz {id} not found")

@router.delete("/{id}", response_description="Delete a quiz")
async def delete_quiz(id: str):
    db = await get_database()
    
    # Try deleting by ObjectId first
    try:
        delete_result = await db["quizzes"].delete_one({"_id": ObjectId(id)})
        if delete_result.deleted_count == 1:
            return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)
    except Exception:
        pass # invalid objectid or not found

    # Fallback to string ID
    delete_result = await db["quizzes"].delete_one({"_id": id})
    if delete_result.deleted_count == 1:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail=f"Quiz {id} not found")
