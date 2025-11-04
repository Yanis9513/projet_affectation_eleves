from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    min_students: int = 1
    max_students: int = 5
    required_language_level: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(db: Session = Depends(get_db)):
    """Get all projects"""
    # TODO: Implement get all projects from database
    return []

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project by ID"""
    # TODO: Implement get project by ID
    raise HTTPException(status_code=404, detail="Project not found")

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project"""
    # TODO: Implement create project
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, project: ProjectBase, db: Session = Depends(get_db)):
    """Update a project"""
    # TODO: Implement update project
    raise HTTPException(status_code=404, detail="Project not found")

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project"""
    # TODO: Implement delete project
    pass

@router.post("/{project_id}/preferences/{student_id}")
async def add_student_preference(
    project_id: int, 
    student_id: int, 
    preference_order: int,
    db: Session = Depends(get_db)
):
    """Add a student's preference for a project"""
    # TODO: Implement add preference
    return {"message": "Preference added successfully"}
