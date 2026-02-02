from pydantic import BaseModel, Field, validator
from typing import Optional, List
from app.models.destination import MobilityType

class DestinationBase(BaseModel):
    university_name: str = Field(..., min_length=1, max_length=255)
    country: str = Field(..., min_length=1, max_length=100)
    city: Optional[str] = Field(None, max_length=100)  # Optional - some destinations may not have city
    total_places: int = Field(..., gt=0)
    mobility_type: MobilityType
    accepted_filieres: str = Field(..., description="Comma-separated list of accepted filieres")
    min_english_level: Optional[str] = Field(None, max_length=10)
    min_toeic_score: Optional[int] = Field(None, ge=0, le=990)
    min_gpa: Optional[float] = Field(None, ge=0, le=20)

class DestinationCreate(DestinationBase):
    pass

class DestinationUpdate(BaseModel):
    university_name: Optional[str] = Field(None, min_length=1, max_length=255)
    country: Optional[str] = Field(None, min_length=1, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    total_places: Optional[int] = Field(None, gt=0)
    mobility_type: Optional[MobilityType] = None
    accepted_filieres: Optional[str] = None
    min_english_level: Optional[str] = Field(None, max_length=10)
    min_toeic_score: Optional[int] = Field(None, ge=0, le=990)
    min_gpa: Optional[float] = Field(None, ge=0, le=20)

class DestinationResponse(DestinationBase):
    id: int
    project_id: int
    available_places: int
    created_at: Optional[str] = None
    
    class Config:
        from_attributes = True

class DestinationPreferenceCreate(BaseModel):
    destination_id: int
    grade: str = Field(..., description="Grade from A (most preferred) to F (least preferred)")
    
    @validator('grade')
    def validate_grade(cls, v):
        v = v.upper()
        if v not in ['A', 'B', 'C', 'D', 'E', 'F']:
            raise ValueError("Grade must be one of: A, B, C, D, E, F")
        return v

class DestinationPreferenceResponse(BaseModel):
    id: int
    student_id: int
    destination_id: int
    project_id: int
    grade: str
    destination: Optional[DestinationResponse] = None
    
    class Config:
        from_attributes = True

class DestinationPreferencesSubmit(BaseModel):
    """Model for submitting all destination preferences with grades A-F at once"""
    project_id: int
    preferences: List[DestinationPreferenceCreate] = Field(...)
    
    @validator('preferences')
    def validate_preferences_count(cls, v):
        if len(v) < 1 or len(v) > 6:
            raise ValueError("You must submit between 1 and 6 preferences")
        return v
    
    @validator('preferences')
    def validate_unique_grades(cls, v):
        grades = [p.grade.upper() for p in v]
        if len(grades) != len(set(grades)):
            raise ValueError("Each grade must be unique - you cannot assign the same grade to multiple destinations")
        return v
