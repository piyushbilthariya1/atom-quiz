import bcrypt
import os
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt

ALGORITHM = "HS256"
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Prevent 72-byte limit crashes on verification
        pwd_bytes = plain_password.encode('utf-8')
        if len(pwd_bytes) > 71:
            pwd_bytes = pwd_bytes[:71]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    # Safely encode and truncate to 71 bytes to prevent bcrypt ValueError
    pwd_bytes = password.encode('utf-8')
    if len(pwd_bytes) > 71:
        pwd_bytes = pwd_bytes[:71]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')
