from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student, Filiere, EnglishLevel
from app.models.teacher import Teacher
from app.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "student"
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v
    
    @validator('role')
    def validate_role(cls, v):
        valid_roles = ['student', 'teacher', 'admin']
        if v.lower() not in valid_roles:
            raise ValueError(f'Role must be one of: {", ".join(valid_roles)}')
        return v.lower()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Parse name
    name_parts = user_data.full_name.strip().split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    
    # Hash password
    hashed = hash_password(user_data.password)
    
    # Create user
    new_user = User(
        email=user_data.email,
        username=user_data.email.split('@')[0],
        hashed_password=hashed,
        first_name=first_name,
        last_name=last_name,
        role=UserRole[user_data.role.upper()],
        is_active=True
    )
    
    db.add(new_user)
    db.flush()
    
    # Create role-specific profile
    if user_data.role.lower() == "student":
        student_profile = Student(
            user_id=new_user.id,
            student_number=f"STU{new_user.id:06d}",
            filiere=Filiere.INFORMATIQUE,  # Default
            english_level=EnglishLevel.B1  # Default
        )
        db.add(student_profile)
    elif user_data.role.lower() == "teacher":
        teacher_profile = Teacher(
            user_id=new_user.id
        )
        db.add(teacher_profile)
    
    db.commit()
    
    return {
        "message": "User registered successfully",
        "email": new_user.email,
        "role": new_user.role.value
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(
        data={
            "user_id": user.id,
            "email": user.email,
            "role": user.role.value
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role.value
        }
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user
