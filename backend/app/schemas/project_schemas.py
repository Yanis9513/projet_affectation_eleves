from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import date, datetime
from enum import Enum

class ProjectTypeEnum(str, Enum):
    GROUP_PROJECT = "group_project"
    ENGLISH_LEVELING = "english_leveling"
    EXCHANGE_PROGRAM = "exchange_program"

class ProjectBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    project_type: ProjectTypeEnum = ProjectTypeEnum.GROUP_PROJECT
    group_size: Optional[int] = Field(default=3, ge=1)
    partner_preference_enabled: bool = True
    required_english_level: Optional[str] = None
    target_filiere: Optional[str] = None
    deadline: Optional[date] = None
    is_active: bool = True
    is_open_for_preferences: bool = True

class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    project_type: ProjectTypeEnum = ProjectTypeEnum.GROUP_PROJECT
    group_size: Optional[int] = Field(default=3, ge=1)
    partner_preference_enabled: bool = True
    required_english_level: Optional[str] = None
    target_filiere: Optional[str] = None
    deadline: Optional[date] = None
    students: Optional[List['StudentInProjectCreate']] = None
    destinations: Optional[List['DestinationInProjectCreate']] = None

class StudentInProjectCreate(BaseModel):
    name: str
    email: str
    filiere: Optional[str] = None
    rank: Optional[int] = None
    grade: Optional[float] = None

class DestinationInProjectCreate(BaseModel):
    """Simplified destination schema for project creation"""
    university_name: str
    country: str
    city: str
    total_places: int
    mobility_type: str = "ECHANGE_ACADEMIQUE"
    accepted_filieres: str = "ALL"
    min_english_level: Optional[str] = None
    min_toeic_score: Optional[int] = None
    min_gpa: Optional[float] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    project_type: Optional[ProjectTypeEnum] = None
    group_size: Optional[int] = Field(None, ge=1)
    partner_preference_enabled: Optional[bool] = None
    required_english_level: Optional[str] = None
    target_filiere: Optional[str] = None
    deadline: Optional[date] = None
    is_active: Optional[bool] = None
    is_open_for_preferences: Optional[bool] = None

class StudentInProject(BaseModel):
    id: int
    name: str
    email: str
    filiere: Optional[str] = None
    english_level: Optional[str] = None
    rank: Optional[int] = None
    grade: Optional[float] = None

class ProjectResponse(BaseModel):
    id: int
    teacher_id: int
    title: str
    description: Optional[str] = None
    project_type: str
    group_size: Optional[int] = None
    partner_preference_enabled: bool
    required_english_level: Optional[str] = None
    target_filiere: Optional[str] = None
    deadline: Optional[str] = None
    is_active: bool
    is_open_for_preferences: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True

class ProjectWithStudents(ProjectResponse):
    students: List[StudentInProject] = []
    
    class Config:
        from_attributes = True

class StudentUploadRequest(BaseModel):
    students: List[StudentInProjectCreate]

class StudentUploadResponse(BaseModel):
    success: bool
    message: str
    created_count: int
    existing_count: int
    students: List[StudentInProject]

# Forward reference resolution
ProjectCreate.update_forward_refs()
