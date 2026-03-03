from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
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
from app.services.email_service import email_service
from app.config import settings
from datetime import datetime, timedelta
import secrets

router = APIRouter()

# Initialize limiter - will be configured in main.py
limiter = Limiter(key_func=get_remote_address)

# Authorization helpers
def require_teacher(current_user: User = Depends(get_current_user)):
    """Require that the current user is a teacher"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This operation requires teacher permissions"
        )
    return current_user


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
@limiter.limit("10/minute")
async def register(request: Request, user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'email est déjà enregistré"
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
@limiter.limit("5/minute")
async def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
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
    
    # Build user response with profile IDs
    user_response = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role.value
    }
    
    # Include student_id or teacher_id if applicable
    if user.student_profile:
        user_response["student_id"] = user.student_profile.id
    if user.teacher_profile:
        user_response["teacher_id"] = user.teacher_profile.id
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user
class UserUpdate(BaseModel):
    first_name: str = None
    last_name: str = None
    
    class Config:
        from_attributes = True

class SignupRequest(BaseModel):
    email: EmailStr
    
    @validator('email')
    def validate_esiee_email(cls, v):
        if not v.endswith('@edu.esiee.fr'):
            raise ValueError('Email must be an ESIEE address (@edu.esiee.fr)')
        return v

class CompletePassword(BaseModel):
    token: str
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class CompleteSignupSimple(BaseModel):
    token: str
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

@router.put("/me", response_model=UserResponse)
async def update_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update current user profile"""
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/signup-request", status_code=status.HTTP_200_OK)
async def signup_request(request: SignupRequest, db: Session = Depends(get_db)):
    """Request signup with ESIEE email - sends confirmation link via email"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'email est déjà enregistré"
        )
    
    # Generate token (valid for 24 hours)
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    # Create user record with token (password will be set later)
    new_user = User(
        email=request.email,
        username=request.email.split('@')[0],
        hashed_password="",  # Placeholder, will be set on completion
        role=UserRole.STUDENT,
        is_active=False,  # Not active until signup is completed
        password_reset_token=token,
        password_reset_expires=expires_at
    )
    
    db.add(new_user)
    db.commit()
    
    # Send email with signup link
    signup_url = f"{settings.FRONTEND_URL}/complete-password?token={token}"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h1 style="color: #1e40af; text-align: center;">Bienvenue à ESIEE Paris</h1>
                
                <p>Bonjour,</p>
                
                <p>Vous avez demandé la création d'un compte sur le système d'affectation d'étudiants ESIEE.</p>
                
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{signup_url}" style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Créer mon mot de passe
                    </a>
                </p>
                
                <p>Ou copiez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; background-color: #f0f9ff; padding: 10px; border-radius: 4px;">
                    {signup_url}
                </p>
                
                <p><strong>Ce lien expire dans 24 heures.</strong></p>
                
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                    <small>
                        Cet email a été envoyé automatiquement par le système d'affectation d'étudiants ESIEE.<br>
                        Si vous n'avez pas demandé cette inscription, ignorez cet email.
                    </small>
                </p>
            </div>
        </body>
    </html>
    """
    
    email_service.send_email_sync(request.email, "Complétez votre inscription ESIEE", html_content)
    
    return {
        "message": "Check your email for the signup link",
        "email": request.email
    }


@router.post("/complete-password", response_model=Token, status_code=status.HTTP_201_CREATED)
async def complete_password(data: CompleteSignupSimple, db: Session = Depends(get_db)):
    """Complete signup with only password (simplified version)"""
    # Find user with valid token
    user = db.query(User).filter(
        User.password_reset_token == data.token,
        User.password_reset_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    
    # Extract name from email (before @)
    email_part = user.email.split('@')[0]
    # Try to split by common patterns, otherwise use email as is
    name_parts = email_part.replace('.', ' ').replace('_', ' ').split()
    first_name = name_parts[0].capitalize() if name_parts else email_part
    last_name = name_parts[1].capitalize() if len(name_parts) > 1 else ""
    
    # Default role is student
    role = UserRole.STUDENT
    
    # Set password and update user
    user.hashed_password = hash_password(data.password)
    user.first_name = first_name
    user.last_name = last_name
    user.role = role
    user.is_active = True
    user.password_reset_token = None
    user.password_reset_expires = None
    
    db.flush()
    
    # Create student profile only if one doesn't already exist
    existing_profile = db.query(Student).filter(Student.user_id == user.id).first()
    if not existing_profile:
        student_profile = Student(
            user_id=user.id,
            student_number=f"STU{user.id:06d}",
            filiere=Filiere.INFORMATIQUE,
            english_level=EnglishLevel.B1
        )
        db.add(student_profile)
    db.commit()
    
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


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
async def forgot_password(request: Request, data: SignupRequest, db: Session = Depends(get_db)):
    """Request password reset - verify user exists and send reset link via email"""
    # Find user by email — always return success to prevent user enumeration
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        # Return generic success to prevent email enumeration attacks
        return {
            "message": "If an account with this email exists, a reset link has been sent",
            "email": data.email
        }
    
    # Generate token (valid for 24 hours)
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    # Store token in user
    user.password_reset_token = token
    user.password_reset_expires = expires_at
    db.commit()
    
    # Send email with reset link
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h1 style="color: #1e40af; text-align: center;">Réinitialiser votre mot de passe</h1>
                
                <p>Bonjour,</p>
                
                <p>Vous avez demandé la réinitialisation de votre mot de passe pour le système d'affectation d'étudiants ESIEE.</p>
                
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Réinitialiser mon mot de passe
                    </a>
                </p>
                
                <p>Ou copiez ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; background-color: #f0f9ff; padding: 10px; border-radius: 4px;">
                    {reset_url}
                </p>
                
                <p><strong>Ce lien expire dans 24 heures.</strong></p>
                
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                    <small>
                        Cet email a été envoyé automatiquement par le système d'affectation d'étudiants ESIEE.<br>
                        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                    </small>
                </p>
            </div>
        </body>
    </html>
    """
    
    email_service.send_email_sync(data.email, "Réinitialiser votre mot de passe ESIEE", html_content)
    
    return {
        "message": "Check your email for the password reset link",
        "email": data.email
    }


@router.post("/reset-password", response_model=Token, status_code=status.HTTP_200_OK)
async def reset_password(data: CompleteSignupSimple, db: Session = Depends(get_db)):
    """Reset password with valid token"""
    # Find user with valid token
    user = db.query(User).filter(
        User.password_reset_token == data.token,
        User.password_reset_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    
    # Update password
    user.hashed_password = hash_password(data.password)
    user.password_reset_token = None
    user.password_reset_expires = None
    
    db.commit()
    
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