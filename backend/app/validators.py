"""
Validateurs personnalises pour les donnees.
"""
import re
from typing import Optional, List
from pydantic import validator, field_validator
from fastapi import HTTPException, status


class Validators:
    """Collection de validateurs reutilisables."""
    
    # Regex patterns
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    PASSWORD_MIN_LENGTH = 8
    
    @staticmethod
    def validate_email(email: str) -> str:
        """Valide le format d'un email."""
        if not email:
            raise ValueError("L'email est requis")
        
        email = email.strip().lower()
        
        if not Validators.EMAIL_PATTERN.match(email):
            raise ValueError("Format d'email invalide")
        
        return email
    
    @staticmethod
    def validate_password(password: str) -> str:
        """Valide la force d'un mot de passe."""
        if not password:
            raise ValueError("Le mot de passe est requis")
        
        if len(password) < Validators.PASSWORD_MIN_LENGTH:
            raise ValueError(f"Le mot de passe doit faire au moins {Validators.PASSWORD_MIN_LENGTH} caracteres")
        
        # Verifier la presence de differents types de caracteres
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        
        if not (has_upper and has_lower and has_digit):
            raise ValueError("Le mot de passe doit contenir des majuscules, minuscules et chiffres")
        
        return password
    
    @staticmethod
    def validate_password_simple(password: str) -> str:
        """Valide un mot de passe (version simple, juste longueur)."""
        if not password:
            raise ValueError("Le mot de passe est requis")
        
        if len(password) < 4:
            raise ValueError("Le mot de passe doit faire au moins 4 caracteres")
        
        return password
    
    @staticmethod
    def validate_name(name: str, field_name: str = "nom") -> str:
        """Valide un nom (prenom ou nom de famille)."""
        if not name:
            raise ValueError(f"Le {field_name} est requis")
        
        name = name.strip()
        
        if len(name) < 2:
            raise ValueError(f"Le {field_name} doit faire au moins 2 caracteres")
        
        if len(name) > 100:
            raise ValueError(f"Le {field_name} ne peut pas depasser 100 caracteres")
        
        # Verifier qu'il n'y a pas de caracteres speciaux suspects
        if re.search(r'[<>{}[\]\\]', name):
            raise ValueError(f"Le {field_name} contient des caracteres invalides")
        
        return name
    
    @staticmethod
    def validate_title(title: str) -> str:
        """Valide un titre de projet."""
        if not title:
            raise ValueError("Le titre est requis")
        
        title = title.strip()
        
        if len(title) < 3:
            raise ValueError("Le titre doit faire au moins 3 caracteres")
        
        if len(title) > 200:
            raise ValueError("Le titre ne peut pas depasser 200 caracteres")
        
        return title
    
    @staticmethod
    def validate_description(description: Optional[str]) -> Optional[str]:
        """Valide une description optionnelle."""
        if not description:
            return None
        
        description = description.strip()
        
        if len(description) > 5000:
            raise ValueError("La description ne peut pas depasser 5000 caracteres")
        
        return description
    
    @staticmethod
    def validate_project_type(project_type: str) -> str:
        """Valide le type de projet."""
        valid_types = ['group_project', 'english_leveling', 'exchange_program']
        
        if project_type not in valid_types:
            raise ValueError(f"Type de projet invalide. Types valides: {', '.join(valid_types)}")
        
        return project_type
    
    @staticmethod
    def validate_english_level(level: str) -> str:
        """Valide un niveau d'anglais."""
        valid_levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        
        level = level.upper().strip()
        
        if level not in valid_levels:
            raise ValueError(f"Niveau d'anglais invalide. Niveaux valides: {', '.join(valid_levels)}")
        
        return level
    
    @staticmethod
    def validate_grade(grade: str) -> str:
        """Valide une note (A-F)."""
        valid_grades = ['A', 'B', 'C', 'D', 'E', 'F']
        
        grade = grade.upper().strip()
        
        if grade not in valid_grades:
            raise ValueError(f"Note invalide. Notes valides: {', '.join(valid_grades)}")
        
        return grade
    
    @staticmethod
    def validate_positive_int(value: int, field_name: str = "valeur") -> int:
        """Valide un entier positif."""
        if value < 0:
            raise ValueError(f"{field_name} doit etre positif")
        
        return value
    
    @staticmethod
    def validate_range(value: int, min_val: int, max_val: int, field_name: str = "valeur") -> int:
        """Valide un entier dans une plage."""
        if value < min_val or value > max_val:
            raise ValueError(f"{field_name} doit etre entre {min_val} et {max_val}")
        
        return value
    
    @staticmethod
    def validate_preferences(preferences: List[int], max_choices: int = 5) -> List[int]:
        """Valide une liste de preferences."""
        if not preferences:
            raise ValueError("Au moins une preference est requise")
        
        if len(preferences) > max_choices:
            raise ValueError(f"Maximum {max_choices} choix autorises")
        
        # Verifier les doublons
        if len(preferences) != len(set(preferences)):
            raise ValueError("Les preferences ne peuvent pas contenir de doublons")
        
        return preferences


def validate_request_id(id: int, entity_name: str = "element"):
    """Valide un ID de requete."""
    if id < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ID de {entity_name} invalide"
        )
    return id


def validate_pagination(page: int = 1, limit: int = 20, max_limit: int = 100):
    """Valide les parametres de pagination."""
    if page < 1:
        page = 1
    
    if limit < 1:
        limit = 1
    elif limit > max_limit:
        limit = max_limit
    
    return page, limit
