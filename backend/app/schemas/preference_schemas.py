from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PreferenceCreate(BaseModel):
    """Schema for creating/updating a preference with partner preference"""
    project_id: int
    rank: int = Field(..., ge=1, description="Rank of preference (1 = highest priority)")
    preferred_partner_id: Optional[int] = Field(None, description="ID of preferred partner student")
    university_ranking: Optional[int] = Field(None, ge=1, le=6, description="Ranking of destination choices (1-6)")

class PreferenceResponse(BaseModel):
    """Schema for preference response"""
    id: int
    student_id: int
    project_id: int
    rank: int
    preferred_partner_id: Optional[int] = None
    university_ranking: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    """Simple message response"""
    message: str
    success: bool = True
