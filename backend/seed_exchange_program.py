"""
Script pour peupler la base de données avec des données de test
pour le programme d'échange (exchange_program)
"""

from app.database import SessionLocal
from app.models import (
    User, UserRole, Student, Teacher, Project, ProjectType,
    Destination, MobilityType, DestinationPreference
)
from app.auth_utils import hash_password
from datetime import datetime, timedelta
import random

def seed_exchange_program():
    """Créer des données de test pour un projet d'échange"""
    db = SessionLocal()
    
    try:
        print("=== CRÉATION DES DONNÉES DE TEST POUR EXCHANGE PROGRAM ===\n")
        
        # 1. Créer un professeur
        print("1. Création du professeur...")
        teacher_user = User(
            email="prof.exchange@school.fr",
            username="prof.exchange",
            first_name="Marie",
            last_name="DUBOIS",
            role=UserRole.TEACHER,
            hashed_password=hash_password("teacher123"),
            is_active=True
        )
        db.add(teacher_user)
        db.flush()
        
        teacher = Teacher(
            user_id=teacher_user.id,
            department="Relations Internationales"
        )
        db.add(teacher)
        db.flush()
        print(f"   OK Professeur cree: {teacher_user.email}")
        
        # 2. Créer le projet d'échange
        print("\n2. Création du projet d'échange...")
        project = Project(
            title="Programme d'échange 2024-2025",
            description="Mobilité internationale - Semestre ou année complète",
            project_type=ProjectType.EXCHANGE_PROGRAM,
            teacher_id=teacher.id,
            deadline=datetime.now() + timedelta(days=30),
            is_active=True,
            is_open_for_preferences=True
        )
        db.add(project)
        db.flush()
        print(f"   OK Projet cree: {project.title} (ID: {project.id})")
        
        # 3. Créer des destinations (universités partenaires)
        print("\n3. Création des destinations...")
        destinations_data = [
            {
                "university_name": "University of Edinburgh",
                "country": "UK",
                "city": "Edinburgh",
                    "total_places": 8,
                    "mobility_type": MobilityType.SEMESTRE_RECHERCHE,
                "accepted_filieres": "Informatique,Mathématiques,Physique",
                "min_english_level": "B2",
                "min_toeic_score": 750,
                "min_gpa": 12.0
            },
            {
                "university_name": "MIT",
                "country": "USA",
                "city": "Cambridge",
                    "total_places": 3,
                    "mobility_type": MobilityType.SEMESTRE_RECHERCHE,
                "accepted_filieres": "Informatique,Mathématiques",
                "min_english_level": "C1",
                "min_toeic_score": 850,
                "min_gpa": 14.0
            },
            {
                "university_name": "TU Munich",
                "country": "Germany",
                "city": "Munich",
                    "total_places": 10,
                    "mobility_type": MobilityType.DOUBLE_DIPLOME,
                "accepted_filieres": "Informatique,Ingénierie,Mathématiques",
                "min_english_level": "B2",
                "min_toeic_score": 700,
                "min_gpa": 11.0
            },
            {
                "university_name": "University of Toronto",
                "country": "Canada",
                "city": "Toronto",
                    "total_places": 6,
                    "mobility_type": MobilityType.SEMESTRE_RECHERCHE,
                "accepted_filieres": "Informatique,Commerce,Mathématiques",
                "min_english_level": "B2",
                "min_toeic_score": 780,
                "min_gpa": 12.5
            },
            {
                "university_name": "National University of Singapore",
                "country": "Singapore",
                "city": "Singapore",
                    "total_places": 5,
                    "mobility_type": MobilityType.SEMESTRE_RECHERCHE,
                "accepted_filieres": "Informatique,Électronique,Mathématiques",
                "min_english_level": "B2",
                "min_toeic_score": 800,
                "min_gpa": 13.0
            },
            {
                "university_name": "KTH Royal Institute of Technology",
                "country": "Sweden",
                "city": "Stockholm",
                    "total_places": 7,
                    "mobility_type": MobilityType.DOUBLE_DIPLOME,
                "accepted_filieres": "Informatique,Ingénierie,Design",
                "min_english_level": "B2",
                "min_toeic_score": 720,
                "min_gpa": 11.5
            },
            {
                "university_name": "Politecnico di Milano",
                "country": "Italy",
                "city": "Milan",
                    "total_places": 9,
                    "mobility_type": MobilityType.SEMESTRE_RECHERCHE,
                "accepted_filieres": "Informatique,Design,Architecture",
                "min_english_level": "B1",
                "min_toeic_score": 650,
                "min_gpa": 10.5
            },
            {
                "university_name": "University of Tokyo",
                "country": "Japan",
                "city": "Tokyo",
                    "total_places": 4,
                    "mobility_type": MobilityType.SEMESTRE_RECHERCHE,
                "accepted_filieres": "Informatique,Robotique,Mathématiques",
                "min_english_level": "B2",
                "min_toeic_score": 750,
                "min_gpa": 12.5
            }
        ]
        
        destinations = []
        for dest_data in destinations_data:
            # Ensure available_places is set (DB requires it NOT NULL)
            if 'available_places' not in dest_data:
                dest_data['available_places'] = dest_data.get('total_places', 0)
            dest = Destination(
                project_id=project.id,
                **dest_data
            )
            db.add(dest)
            destinations.append(dest)
        
        db.flush()
        print(f"   OK {len(destinations)} destinations creees")
        for dest in destinations:
            print(f"     - {dest.university_name} ({dest.country}) - {dest.total_places} places")
        
        # 4. Créer des étudiants
        print("\n4. Création des étudiants...")
        students_data = [
            {"first_name": "Alice", "last_name": "MARTIN", "filiere": "Informatique", "toeic": 880, "classement": "C1", "gpa": 15.2},
            {"first_name": "Bob", "last_name": "BERNARD", "filiere": "Informatique", "toeic": 850, "classement": "C1", "gpa": 14.8},
            {"first_name": "Charlie", "last_name": "DUBOIS", "filiere": "Mathématiques", "toeic": 820, "classement": "C1", "gpa": 14.5},
            {"first_name": "David", "last_name": "THOMAS", "filiere": "Informatique", "toeic": 790, "classement": "C2", "gpa": 13.8},
            {"first_name": "Emma", "last_name": "ROBERT", "filiere": "Informatique", "toeic": 780, "classement": "C2", "gpa": 13.5},
            {"first_name": "Felix", "last_name": "RICHARD", "filiere": "Physique", "toeic": 760, "classement": "C2", "gpa": 13.2},
            {"first_name": "Grace", "last_name": "PETIT", "filiere": "Mathématiques", "toeic": 750, "classement": "C2", "gpa": 13.0},
            {"first_name": "Hugo", "last_name": "DURAND", "filiere": "Informatique", "toeic": 740, "classement": "C2", "gpa": 12.8},
            {"first_name": "Iris", "last_name": "LEROY", "filiere": "Informatique", "toeic": 720, "classement": "C3", "gpa": 12.5},
            {"first_name": "Jack", "last_name": "MOREAU", "filiere": "Commerce", "toeic": 710, "classement": "C3", "gpa": 12.2},
            {"first_name": "Kate", "last_name": "SIMON", "filiere": "Informatique", "toeic": 700, "classement": "C3", "gpa": 12.0},
            {"first_name": "Leo", "last_name": "LAURENT", "filiere": "Ingénierie", "toeic": 690, "classement": "C3", "gpa": 11.8},
            {"first_name": "Mia", "last_name": "LEFEBVRE", "filiere": "Informatique", "toeic": 680, "classement": "C3", "gpa": 11.5},
            {"first_name": "Noah", "last_name": "ROUX", "filiere": "Mathématiques", "toeic": 670, "classement": "C3", "gpa": 11.2},
            {"first_name": "Olivia", "last_name": "VINCENT", "filiere": "Design", "toeic": 660, "classement": "C3", "gpa": 11.0},
        ]
        
        students = []
        for i, student_data in enumerate(students_data):
            user = User(
                email=f"{student_data['first_name'].lower()}.{student_data['last_name'].lower()}@student.fr",
                username=f"{student_data['first_name'].lower()}.{student_data['last_name'].lower()}",
                first_name=student_data['first_name'],
                last_name=student_data['last_name'],
                role=UserRole.STUDENT,
                hashed_password=hash_password("student123"),
                is_active=True
            )
            db.add(user)
            db.flush()
            
            student = Student(
                user_id=user.id,
                student_number=f"ETU{2024000 + i + 1}",
                filiere=student_data['filiere'],
                toeic_score=student_data['toeic'],
                classement=student_data['classement'],
                mobility_type="SEMESTER",
                gpa=student_data['gpa']
            )
            db.add(student)
            students.append(student)
        
        db.flush()
        print(f"   OK {len(students)} etudiants crees")
        
        # 5. Créer des préférences aléatoires pour chaque étudiant
        print("\n5. Création des préférences des étudiants...")
        for student in students:
            # Chaque étudiant choisit 6 destinations aléatoires
            selected_dests = random.sample(destinations, min(6, len(destinations)))
            
            for rank, dest in enumerate(selected_dests, start=1):
                pref = DestinationPreference(
                    student_id=student.id,
                    destination_id=dest.id,
                    project_id=project.id,
                    rank=rank
                )
                db.add(pref)
        
        db.commit()
        print(f"   OK Preferences creees pour {len(students)} etudiants")
        
        print("\n" + "="*60)
        print("OK DONNEES DE TEST CREEES AVEC SUCCES!")
        print("="*60)
        print(f"\nConnexion Professeur:")
        print(f"  Email: prof.exchange@school.fr")
        print(f"  Password: teacher123")
        print(f"\nConnexion Étudiants (exemples):")
        print(f"  Email: alice.martin@student.fr")
        print(f"  Password: student123")
        print(f"  (et ainsi de suite pour les autres étudiants)")
        print(f"\nProjet ID: {project.id}")
        print(f"Destinations: {len(destinations)}")
        print(f"Étudiants: {len(students)}")
        print(f"\nPour exécuter l'algorithme:")
        print(f"  POST /api/assignments/run-algorithm")
        print(f"  {{'project_id': {project.id}}}")
        print("="*60)
        
    except Exception as e:
        db.rollback()
        print(f"\nERREUR: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_exchange_program()
