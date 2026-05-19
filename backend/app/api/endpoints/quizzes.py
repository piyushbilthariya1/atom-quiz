from fastapi import APIRouter, Body, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
from app.models.quiz import QuizDB, QuizCreate
from app.db.mongodb import get_database
from app.models.user import UserDB
from app.api.deps import get_current_user
from bson import ObjectId
from datetime import datetime
from fastapi.encoders import jsonable_encoder

router = APIRouter()

@router.post("/", response_description="Add new quiz", response_model=QuizDB)
async def create_quiz(
    quiz: QuizCreate = Body(...),
    current_user: UserDB = Depends(get_current_user)
):
    db = await get_database()
    quiz_op = jsonable_encoder(quiz)
    
    # Associate with user's first organization for now
    org_id = current_user.organization_ids[0] if current_user.organization_ids else "default"
    
    quiz_op["organization_id"] = org_id
    quiz_op["created_by"] = str(current_user.id)
    quiz_op["created_at"] = datetime.utcnow()
    quiz_op["updated_at"] = datetime.utcnow()
    
    new_quiz = await db["quizzes"].insert_one(quiz_op)
    created_quiz = await db["quizzes"].find_one({"_id": new_quiz.inserted_id})
    return created_quiz

@router.get("/", response_description="List all quizzes", response_model=List[QuizDB])
async def list_quizzes(current_user: UserDB = Depends(get_current_user)):
    db = await get_database()
    
    # Filter by user's organization
    org_id = current_user.organization_ids[0] if current_user.organization_ids else "default"
    
    quizzes = await db["quizzes"].find({"organization_id": org_id}).to_list(1000)
    return quizzes

@router.get("/{id}", response_description="Get a single quiz", response_model=QuizDB)
async def show_quiz(id: str, current_user: UserDB = Depends(get_current_user)):
    db = await get_database()
    
    query = {"_id": id}
    try:
        if ObjectId.is_valid(id):
            query = {"_id": ObjectId(id)}
    except:
        pass

    if (quiz := await db["quizzes"].find_one(query)) is not None:
        return quiz
        
    raise HTTPException(status_code=404, detail=f"Quiz {id} not found")

@router.delete("/{id}", response_description="Delete a quiz")
async def delete_quiz(id: str, current_user: UserDB = Depends(get_current_user)):
    db = await get_database()
    
    query = {"_id": id}
    try:
        if ObjectId.is_valid(id):
            query = {"_id": ObjectId(id)}
    except:
        pass

    delete_result = await db["quizzes"].delete_one(query)
    if delete_result.deleted_count == 1:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)

    raise HTTPException(status_code=404, detail=f"Quiz {id} not found")
