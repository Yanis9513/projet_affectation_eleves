"""
Script pour initialiser la base de données
Crée toutes les tables selon les modèles définis
"""

from app.database import engine, Base
from app.models import (
    User, Student, Teacher, Project, Assignment,
    StudentPreference, FormQuestion, StudentResponse
)

def init_db():
    """Créer toutes les tables dans la base de données"""
    print("Creation des tables de la base de donnees...")
    
    # Créer toutes les tables
    Base.metadata.create_all(bind=engine)
    
    print("Base de donnees initialisee avec succes!")
    print("\nTables creees:")
    print("  - users (utilisateurs: admin, professeurs, eleves)")
    print("  - teachers (profils professeurs)")
    print("  - students (profils eleves)")
    print("  - projects (projets d'affectation)")
    print("  - project_students (association projets-etudiants)")
    print("  - form_questions (questions de formulaire)")
    print("  - student_responses (reponses des eleves)")
    print("  - student_preferences (preferences des eleves)")
    print("  - assignments (affectations finales)")

if __name__ == "__main__":
    init_db()
