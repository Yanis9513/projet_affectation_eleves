from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.assignment import Assignment
from app.models.project import Project, ProjectType
from app.models.preference import StudentPreference
from app.services.group_algorithm import assign_students_to_groups
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter()

class AssignmentResponse(BaseModel):
    id: int
    student_id: int
    project_id: int
    group_number: Optional[int] = None
    preference_rank: Optional[int] = None
    satisfaction_score: Optional[float] = None
    
    class Config:
        from_attributes = True

class AssignmentStats(BaseModel):
    total_assignments: int
    satisfaction_rate: float
    total_groups: int
    average_group_size: float
    mutual_matches: int

class RunAlgorithmRequest(BaseModel):
    project_id: int

class RunAlgorithmResponse(BaseModel):
    status: str
    message: str
    assignments_created: int
    groups_created: int
    stats: dict

@router.get("/", response_model=List[AssignmentResponse])
async def get_assignments(project_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all assignments, optionally filtered by project"""
    query = db.query(Assignment)
    
    if project_id:
        query = query.filter(Assignment.project_id == project_id)
    
    assignments = query.all()
    return assignments

@router.post("/run-algorithm", response_model=RunAlgorithmResponse)
async def run_assignment_algorithm(request: RunAlgorithmRequest, db: Session = Depends(get_db)):
    """
    Run the group formation algorithm for a specific project
    
    Steps:
    1. Get project and validate it's a GROUP_PROJECT
    2. Get all student preferences for this project
    3. Run algorithm to form groups
    4. Create Assignment records
    5. Return statistics
    """
    # Get project
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only support GROUP_PROJECT for now
    if project.project_type != ProjectType.GROUP_PROJECT:
        raise HTTPException(
            status_code=400, 
            detail="Algorithm only supports GROUP_PROJECT type currently"
        )
    
    # Get all student preferences for this project
    preferences = db.query(StudentPreference).filter(
        StudentPreference.project_id == request.project_id
    ).all()
    
    if not preferences:
        raise HTTPException(
            status_code=400,
            detail="No student preferences found for this project"
        )
    
    # Build preference dict and get all student IDs
    student_ids = list(set([p.student_id for p in preferences]))
    preference_dict = {}
    
    for pref in preferences:
        preference_dict[pref.student_id] = pref.preferred_partner_id
    
    # Run algorithm
    groups, stats = assign_students_to_groups(
        student_ids=student_ids,
        preferences=preference_dict,
        group_size=project.group_size or 3
    )
    
    # Delete existing assignments for this project
    db.query(Assignment).filter(Assignment.project_id == request.project_id).delete()
    
    # Create Assignment records
    algorithm_run_id = str(uuid.uuid4())
    assignments_created = 0
    
    for group_num, group in enumerate(groups, start=1):
        for student_id in group:
            # Check if student got their preference
            preferred = preference_dict.get(student_id)
            got_preference = preferred and preferred in group
            
            assignment = Assignment(
                student_id=student_id,
                project_id=request.project_id,
                group_number=group_num,
                preference_rank=1 if got_preference else None,
                satisfaction_score=10.0 if got_preference else 5.0,
                algorithm_score=stats['satisfaction_rate'],
                algorithm_run_id=algorithm_run_id,
                assigned_at=datetime.utcnow()
            )
            db.add(assignment)
            assignments_created += 1
    
    db.commit()
    
    return RunAlgorithmResponse(
        status="success",
        message=f"Successfully created {len(groups)} groups for {assignments_created} students",
        assignments_created=assignments_created,
        groups_created=len(groups),
        stats=stats
    )

@router.get("/stats", response_model=AssignmentStats)
async def get_assignment_stats(project_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get statistics about assignments for a project"""
    query = db.query(Assignment)
    
    if project_id:
        query = query.filter(Assignment.project_id == project_id)
    
    assignments = query.all()
    
    if not assignments:
        return AssignmentStats(
            total_assignments=0,
            satisfaction_rate=0.0,
            total_groups=0,
            average_group_size=0.0,
            mutual_matches=0
        )
    
    # Calculate stats
    total = len(assignments)
    satisfied = sum(1 for a in assignments if a.satisfaction_score and a.satisfaction_score >= 8.0)
    groups = set(a.group_number for a in assignments if a.group_number)
    
    return AssignmentStats(
        total_assignments=total,
        satisfaction_rate=(satisfied / total * 100) if total > 0 else 0,
        total_groups=len(groups),
        average_group_size=total / len(groups) if groups else 0,
        mutual_matches=satisfied  # Simplified for now
    )

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_assignments(project_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Clear all assignments (useful for testing)"""
    query = db.query(Assignment)
    
    if project_id:
        query = query.filter(Assignment.project_id == project_id)
    
    query.delete()
    db.commit()
