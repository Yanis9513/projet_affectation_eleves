from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from pydantic import BaseModel, EmailStr

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # TODO: Implement user registration logic
    # 1. Check if user already exists
    # 2. Hash the password
    # 3. Create user in database
    return {
        "message": "User registered successfully",
        "email": user_data.email
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    # TODO: Implement login logic
    # 1. Verify email and password
    # 2. Generate JWT token
    # 3. Return token and user info
    return {
        "access_token": "dummy_token",
        "token_type": "bearer",
        "user": {
            "email": credentials.email,
            "role": "student"
        }
    }

@router.get("/me")
async def get_current_user():
    """Get current authenticated user"""
    # TODO: Implement get current user from JWT token
    return {
        "email": "user@example.com",
        "full_name": "John Doe",
        "role": "student"
    }
