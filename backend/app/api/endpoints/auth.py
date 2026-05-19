from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core.security import create_access_token, verify_password, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
from app.db.mongodb import get_database
from app.models.user import UserCreate, UserDB
from app.models.organization import OrganizationCreate, OrganizationDB
from bson import ObjectId
import os

router = APIRouter()

# Simple invite codes for "Secure & Private" SaaS
# In a real app, these would be in the DB or .env
ADMIN_INVITE_CODE = os.getenv("ADMIN_INVITE_CODE", "vexite")
PARTICIPANT_INVITE_CODE = os.getenv("PARTICIPANT_INVITE_CODE", "vexite")

@router.post("/register/admin")
async def register_admin(user_in: UserCreate, org_name: str, invite_code: str):
    if invite_code != ADMIN_INVITE_CODE:
        raise HTTPException(status_code=403, detail="Invalid admin invite code")
        
    db = await get_database()
    
    if await db["users"].find_one({"email": user_in.email}):
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create Admin User first to get their ID
    user_obj = UserDB(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        role="admin",
        hashed_password=get_password_hash(user_in.password),
        organization_ids=[]
    )
    user_res = await db["users"].insert_one(user_obj.model_dump(by_alias=True, exclude={"id"}))
    user_id = str(user_res.inserted_id)

    # Create Organization with owner_id
    org_obj = OrganizationDB(
        name=org_name,
        slug=org_name.lower().replace(" ", "-"),
        owner_id=user_id
    )
    org_res = await db["organizations"].insert_one(org_obj.model_dump(by_alias=True, exclude={"id"}))
    org_id = str(org_res.inserted_id)
    
    # Update User with org_id
    await db["users"].update_one({"_id": user_res.inserted_id}, {"$push": {"organization_ids": org_id}})
    
    return {"message": "Admin registered successfully", "user_id": user_id}

@router.post("/register/participant")
async def register_participant(user_in: UserCreate, invite_code: str):
    if invite_code != PARTICIPANT_INVITE_CODE:
        raise HTTPException(status_code=403, detail="Invalid participant invite code")
        
    db = await get_database()
    
    if await db["users"].find_one({"email": user_in.email}):
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create Participant User
    user_obj = UserDB(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        role="participant",
        hashed_password=get_password_hash(user_in.password),
        organization_ids=[] # Participants don't own an org
    )
    user_res = await db["users"].insert_one(user_obj.model_dump(by_alias=True, exclude={"id"}))
    
    return {"message": "Participant registered successfully", "user_id": str(user_res.inserted_id)}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = await get_database()
    # Check by email OR username
    user = await db["users"].find_one({
        "$or": [{"email": form_data.username}, {"username": form_data.username}]
    })
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user["_id"]), expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user.get("role", "participant"),
        "username": user.get("username")
    }
