"""
Decorateurs d'autorisation pour les routes FastAPI.
Fournit des fonctions de securite reutilisables.
"""
from functools import wraps
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Callable

from app.database import get_db
from app.auth_utils import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.teacher import Teacher
from app.models.student import Student


class AuthError:
    """Messages d'erreur standardises pour l'authentification."""
    NOT_AUTHENTICATED = "Vous devez etre connecte pour acceder a cette ressource"
    NOT_TEACHER = "Seuls les enseignants peuvent effectuer cette action"
    NOT_STUDENT = "Seuls les etudiants peuvent effectuer cette action"
    NOT_PROJECT_OWNER = "Vous n'etes pas le proprietaire de ce projet"
    PROJECT_NOT_FOUND = "Projet non trouve"
    FORBIDDEN = "Acces refuse"


async def get_current_teacher(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Teacher:
    """
    Verifie que l'utilisateur actuel est un enseignant.
    Retourne l'objet Teacher correspondant.
    
    Usage:
        @router.get("/teachers-only")
        async def teachers_only(teacher: Teacher = Depends(get_current_teacher)):
            return {"teacher_id": teacher.id}
    """
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=AuthError.NOT_TEACHER
        )
    
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil enseignant non trouve"
        )
    
    return teacher


async def get_current_student(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Student:
    """
    Verifie que l'utilisateur actuel est un etudiant.
    Retourne l'objet Student correspondant.
    
    Usage:
        @router.get("/students-only")
        async def students_only(student: Student = Depends(get_current_student)):
            return {"student_id": student.id}
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=AuthError.NOT_STUDENT
        )
    
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil etudiant non trouve"
        )
    
    return student


def require_project_owner(project_id_param: str = "project_id"):
    """
    Decorator factory pour verifier que l'utilisateur est le proprietaire du projet.
    
    Args:
        project_id_param: Nom du parametre contenant l'ID du projet dans la route
    
    Usage:
        @router.put("/projects/{project_id}")
        @require_project_owner("project_id")
        async def update_project(project_id: int, ...):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extraire les dependances du kwargs
            db: Session = kwargs.get('db')
            current_user: User = kwargs.get('current_user')
            project_id = kwargs.get(project_id_param)
            
            if not all([db, current_user, project_id]):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Configuration incorrecte du decorateur"
                )
            
            # Verifier que c'est un enseignant
            if current_user.role != "teacher":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=AuthError.NOT_TEACHER
                )
            
            # Trouver le projet
            project = db.query(Project).filter(Project.id == project_id).first()
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=AuthError.PROJECT_NOT_FOUND
                )
            
            # Verifier la propriete
            teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
            if not teacher or project.teacher_id != teacher.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=AuthError.NOT_PROJECT_OWNER
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


async def verify_project_ownership(
    project_id: int,
    current_user: User,
    db: Session
) -> Project:
    """
    Fonction utilitaire pour verifier la propriete d'un projet.
    Plus flexible que le decorateur, peut etre utilisee directement dans les routes.
    
    Args:
        project_id: ID du projet a verifier
        current_user: Utilisateur actuel
        db: Session de base de donnees
    
    Returns:
        Project: Le projet si l'utilisateur en est le proprietaire
    
    Raises:
        HTTPException: Si non autorise
    
    Usage:
        @router.put("/projects/{project_id}")
        async def update_project(
            project_id: int,
            current_user: User = Depends(get_current_user),
            db: Session = Depends(get_db)
        ):
            project = await verify_project_ownership(project_id, current_user, db)
            # Maintenant vous pouvez modifier le projet en toute securite
    """
    # Verifier que c'est un enseignant
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=AuthError.NOT_TEACHER
        )
    
    # Trouver le projet
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=AuthError.PROJECT_NOT_FOUND
        )
    
    # Verifier la propriete
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher or project.teacher_id != teacher.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=AuthError.NOT_PROJECT_OWNER
        )
    
    return project


def require_role(*allowed_roles: str):
    """
    Dependency factory pour verifier le role de l'utilisateur.
    
    Usage:
        @router.get("/admin-or-teacher")
        async def admin_route(
            current_user: User = Depends(require_role("admin", "teacher"))
        ):
            ...
    """
    async def role_checker(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role requis: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return role_checker
