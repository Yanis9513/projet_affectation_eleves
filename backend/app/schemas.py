"""
Pydantic schemas for API request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class ProjectTypeEnum(str, Enum):
    GROUP_PROJECT = "group_project"
    ENGLISH_LEVELING = "english_leveling"
    EXCHANGE_PROGRAM = "exchange_program"

class EnglishLevelEnum(str, Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"

class FiliereEnum(str, Enum):
    INFORMATIQUE = "Informatique"
    ELECTRONIQUE = "Électronique"
    ENERGIE = "Énergie"
    BIOTECHNOLOGIE = "Biotechnologie"
    SYSTEMES_EMBARQUES = "Systèmes Embarqués"
    RESEAUX = "Réseaux et Télécommunications"
    AUTRE = "Autre"

# Student Schemas
class StudentCSVData(BaseModel):
    """Student data from CSV upload"""
    name: str
    email: EmailStr
    filiere: Optional[str] = None
    rank: Optional[int] = None
    grade: Optional[float] = None

class StudentInProject(BaseModel):
    """Student in a project (for frontend display)"""
    id: int
    name: str
    email: str
    filiere: Optional[str] = None
    rank: Optional[int] = None
    grade: Optional[float] = None
    
    class Config:
        from_attributes = True

# Project Schemas
class ProjectCreate(BaseModel):
    """Create a new project"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    project_type: ProjectTypeEnum
    group_size: Optional[int] = Field(default=3, ge=2, le=10)
    partner_preference_enabled: bool = True
    required_english_level: Optional[EnglishLevelEnum] = None
    target_filiere: Optional[FiliereEnum] = None
    deadline: Optional[datetime] = None
    students: List[StudentCSVData] = Field(default_factory=list)
    
    @validator('group_size')
    @classmethod
    def validate_group_size(cls, v, values):
        if values.get('project_type') == ProjectTypeEnum.ENGLISH_LEVELING:
            if v != 4:
                raise ValueError('English leveling projects must have group_size=4')
        return v

class ProjectUpdate(BaseModel):
    """Update project details"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    group_size: Optional[int] = Field(None, ge=2, le=10)
    partner_preference_enabled: Optional[bool] = None
    is_active: Optional[bool] = None
    is_open_for_preferences: Optional[bool] = None
    deadline: Optional[datetime] = None

class ProjectResponse(BaseModel):
    """Project response"""
    id: int
    teacher_id: int
    title: str
    description: Optional[str] = None
    project_type: str
    min_students: int = 1
    max_students: int = 5
    group_size: Optional[int] = None
    partner_preference_enabled: bool
    required_english_level: Optional[str] = None
    target_filiere: Optional[str] = None
    is_active: bool
    is_open_for_preferences: bool
    deadline: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProjectWithStudents(ProjectResponse):
    """Project with list of students"""
    students: List[StudentInProject] = []

# Preference Schemas
class PreferenceCreate(BaseModel):
    """Submit student preference"""
    project_id: int
    preferred_partner_id: Optional[int] = None
    university_ranking: Optional[str] = None  # For exchange programs (e.g., "A,B,C,D,F")
    rank: int = Field(default=1, ge=1, le=10)  # Project ranking (1=first choice)

class PreferenceResponse(BaseModel):
    """Preference response"""
    id: int
    student_id: int
    project_id: int
    preferred_partner_id: Optional[int] = None
    university_ranking: Optional[str] = None
    rank: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Upload Schemas
class StudentUploadRequest(BaseModel):
    """Upload students to a project"""
    students: List[StudentCSVData]

class StudentUploadResponse(BaseModel):
    """Response after uploading students"""
    success: bool
    message: str
    created_count: int
    existing_count: int
    students: List[StudentInProject]

# Generic Response
class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True
