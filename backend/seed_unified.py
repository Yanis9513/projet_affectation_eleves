"""
Unified Seed Script for Student Assignment System
Creates all 3 project types with test data

Run: python backend/seed_unified.py
"""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, engine
from app.database import Base
from app.models.user import User, UserRole
from app.models.student import Student, Filiere, EnglishLevel
from app.models.teacher import Teacher
from app.models.project import Project, ProjectType
from app.models.destination import Destination, MobilityType
from app.models.destination_preference import DestinationPreference
from app.models.preference import StudentPreference
from app.auth_utils import hash_password
from datetime import datetime, timedelta
import random


def seed_unified():
    """Create comprehensive test data for all project types"""
    # First, create all tables
    print("[*] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("   [+] Tables created successfully")
    """Create comprehensive test data for all project types"""
    db = SessionLocal()
    
    print("="*70)
    print("[*] SEEDING DATABASE WITH COMPREHENSIVE TEST DATA")
    print("="*70)
    
    try:
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"[!] Database already contains {existing_users} users.")
            print("[!] Delete the database file first to re-seed.")
            return
        
        # ============================
        # 1. CREATE USERS
        # ============================
        print("\n[1/6] Creating Users...")
        
        # Admin
        admin_user = User(
            email="admin@esiee.fr",
            username="admin",
            hashed_password=hash_password("admin123"),
            first_name="Admin",
            last_name="ESIEE",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.flush()
        print(f"   [+] Admin: admin@esiee.fr / admin123")
        
        # Teachers (one for each project type)
        teachers_data = [
            {"email": "prof.exchange@esiee.fr", "first": "Marie", "last": "DUBOIS", "dept": "Relations Internationales"},
            {"email": "prof.group@esiee.fr", "first": "Jean", "last": "MARTIN", "dept": "Informatique"},
            {"email": "prof.english@esiee.fr", "first": "Pierre", "last": "BERNARD", "dept": "Langues"},
        ]
        
        teachers = []
        for i, t_data in enumerate(teachers_data):
            user = User(
                email=t_data["email"],
                username=f"teacher{i+1}",
                hashed_password=hash_password("teacher123"),
                first_name=t_data["first"],
                last_name=t_data["last"],
                role=UserRole.TEACHER,
                is_active=True
            )
            db.add(user)
            db.flush()
            
            teacher = Teacher(
                user_id=user.id,
                department=t_data["dept"],
                office=f"Bureau {301+i}"
            )
            db.add(teacher)
            teachers.append(teacher)
            print(f"   [+] Teacher {i+1}: {t_data['email']} / teacher123")
        
        # Students (20 students with various English levels)
        print("\n[2/6] Creating Students...")
        students_data = [
            {"fname": "Alice", "lname": "MARTIN", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.B2},
            {"fname": "Bob", "lname": "BERNARD", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.C1},
            {"fname": "Charlie", "lname": "DUBOIS", "filiere": Filiere.ELECTRONIQUE, "eng": EnglishLevel.B1},
            {"fname": "David", "lname": "THOMAS", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.B2},
            {"fname": "Emma", "lname": "ROBERT", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.C1},
            {"fname": "Felix", "lname": "RICHARD", "filiere": Filiere.SYSTEMES_EMBARQUES, "eng": EnglishLevel.A2},
            {"fname": "Grace", "lname": "PETIT", "filiere": Filiere.ELECTRONIQUE, "eng": EnglishLevel.B1},
            {"fname": "Hugo", "lname": "DURAND", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.B2},
            {"fname": "Iris", "lname": "LEROY", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.C1},
            {"fname": "Jack", "lname": "MOREAU", "filiere": Filiere.RESEAUX, "eng": EnglishLevel.B1},
            {"fname": "Kate", "lname": "SIMON", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.B2},
            {"fname": "Leo", "lname": "LAURENT", "filiere": Filiere.ENERGIE, "eng": EnglishLevel.A1},
            {"fname": "Mia", "lname": "LEFEBVRE", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.C2},
            {"fname": "Noah", "lname": "ROUX", "filiere": Filiere.BIOTECHNOLOGIE, "eng": EnglishLevel.B2},
            {"fname": "Olivia", "lname": "VINCENT", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.B1},
            {"fname": "Paul", "lname": "GARNIER", "filiere": Filiere.ELECTRONIQUE, "eng": EnglishLevel.B2},
            {"fname": "Quinn", "lname": "FAURE", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.C1},
            {"fname": "Rose", "lname": "BLANC", "filiere": Filiere.SYSTEMES_EMBARQUES, "eng": EnglishLevel.A2},
            {"fname": "Sam", "lname": "GUERIN", "filiere": Filiere.INFORMATIQUE, "eng": EnglishLevel.B2},
            {"fname": "Tina", "lname": "BOYER", "filiere": Filiere.RESEAUX, "eng": EnglishLevel.B1},
        ]
        
        students = []
        for i, s_data in enumerate(students_data):
            user = User(
                email=f"{s_data['fname'].lower()}.{s_data['lname'].lower()}@edu.esiee.fr",
                username=f"student{i+1:03d}",
                hashed_password=hash_password("student123"),
                first_name=s_data["fname"],
                last_name=s_data["lname"],
                role=UserRole.STUDENT,
                is_active=True
            )
            db.add(user)
            db.flush()
            
            student = Student(
                user_id=user.id,
                student_number=f"E2025{i+1:03d}",
                filiere=s_data["filiere"],
                english_level=s_data["eng"],
                general_rank=random.randint(1, 50),
                gpa=round(random.uniform(11.0, 17.0), 1),
                promotion="2025"
            )
            db.add(student)
            students.append(student)
        
        print(f"   [+] Created {len(students)} students")
        db.commit()
        
        # ============================
        # 2. EXCHANGE PROGRAM PROJECT
        # ============================
        print("\n[3/6] Creating Exchange Program Project...")
        
        exchange_project = Project(
            title="Programme d'Échange International 2024-2025",
            description="Mobilité internationale - Semestre ou année complète dans nos universités partenaires",
            project_type=ProjectType.EXCHANGE_PROGRAM,
            teacher_id=teachers[0].id,
            deadline=datetime.utcnow() + timedelta(days=30),
            is_active=True,
            is_open_for_preferences=True,
            min_students=1,
            max_students=50,
            group_size=1
        )
        db.add(exchange_project)
        db.flush()
        print(f"   [+] Exchange Project: '{exchange_project.title}' (ID: {exchange_project.id})")
        
        # Create destinations
        destinations_data = [
            {"name": "University of Edinburgh", "country": "UK", "city": "Edinburgh", "places": 8, "mobility": MobilityType.SEMESTRE_RECHERCHE, "min_eng": "B2", "gpa": 12.0},
            {"name": "MIT", "country": "USA", "city": "Cambridge", "places": 3, "mobility": MobilityType.SEMESTRE_RECHERCHE, "min_eng": "C1", "gpa": 14.0},
            {"name": "TU Munich", "country": "Germany", "city": "Munich", "places": 10, "mobility": MobilityType.DOUBLE_DIPLOME, "min_eng": "B2", "gpa": 11.0},
            {"name": "University of Toronto", "country": "Canada", "city": "Toronto", "places": 6, "mobility": MobilityType.SEMESTRE_RECHERCHE, "min_eng": "B2", "gpa": 12.5},
            {"name": "National University of Singapore", "country": "Singapore", "city": "Singapore", "places": 5, "mobility": MobilityType.SEMESTRE_RECHERCHE, "min_eng": "B2", "gpa": 13.0},
            {"name": "KTH Royal Institute", "country": "Sweden", "city": "Stockholm", "places": 7, "mobility": MobilityType.DOUBLE_DIPLOME, "min_eng": "B2", "gpa": 11.5},
            {"name": "Politecnico di Milano", "country": "Italy", "city": "Milan", "places": 9, "mobility": MobilityType.SEMESTRE_RECHERCHE, "min_eng": "B1", "gpa": 10.5},
            {"name": "University of Tokyo", "country": "Japan", "city": "Tokyo", "places": 4, "mobility": MobilityType.SEMESTRE_RECHERCHE, "min_eng": "B2", "gpa": 12.5},
        ]
        
        destinations = []
        for dest_data in destinations_data:
            dest = Destination(
                project_id=exchange_project.id,
                university_name=dest_data["name"],
                country=dest_data["country"],
                city=dest_data["city"],
                total_places=dest_data["places"],
                available_places=dest_data["places"],
                mobility_type=dest_data["mobility"],
                accepted_filieres="Informatique,Électronique,Mathématiques",
                min_english_level=dest_data["min_eng"],
                min_gpa=dest_data["gpa"]
            )
            db.add(dest)
            destinations.append(dest)
        
        db.flush()  # Get destination IDs
        print(f"   [+] Created {len(destinations)} destinations")
        
        # Enroll all students in exchange project
        for student in students:
            exchange_project.students.append(student)
        
        # Create preferences for some students (grades A-F)
        grades = ['A', 'B', 'C', 'D', 'E', 'F']
        for student in students[:10]:  # First 10 students submit preferences
            selected_dests = random.sample(destinations, min(6, len(destinations)))
            for i, dest in enumerate(selected_dests):
                pref = DestinationPreference(
                    student_id=student.id,
                    destination_id=dest.id,
                    project_id=exchange_project.id,
                    grade=grades[i]  # A for first choice, B for second, etc.
                )
                db.add(pref)
        
        print(f"   [+] Enrolled {len(students)} students, {10} submitted preferences")
        db.commit()
        
        # ============================
        # 3. GROUP PROJECT
        # ============================
        print("\n[4/6] Creating Group Project...")
        
        group_project = Project(
            title="Projet de Groupe - Développement Web",
            description="Développer une application web complète en équipe. Les étudiants peuvent choisir leurs partenaires.",
            project_type=ProjectType.GROUP_PROJECT,
            teacher_id=teachers[1].id,
            deadline=datetime.utcnow() + timedelta(days=45),
            is_active=True,
            is_open_for_preferences=True,
            min_students=3,
            max_students=5,
            group_size=4,
            partner_preference_enabled=True
        )
        db.add(group_project)
        db.flush()
        print(f"   [+] Group Project: '{group_project.title}' (ID: {group_project.id})")
        
        # Enroll first 15 students
        group_students = students[:15]
        for student in group_students:
            group_project.students.append(student)
        
        # Create some partner preferences (mutual and one-sided)
        # Alice (0) and Bob (1) choose each other (mutual)
        pref1 = StudentPreference(student_id=students[0].id, project_id=group_project.id, preferred_partner_id=students[1].id, rank=1)
        pref2 = StudentPreference(student_id=students[1].id, project_id=group_project.id, preferred_partner_id=students[0].id, rank=1)
        db.add(pref1)
        db.add(pref2)
        
        # Charlie (2) chooses David (3), but David doesn't choose back (one-sided)
        pref3 = StudentPreference(student_id=students[2].id, project_id=group_project.id, preferred_partner_id=students[3].id, rank=1)
        db.add(pref3)
        
        # Emma (4) and Felix (5) choose each other (mutual)
        pref4 = StudentPreference(student_id=students[4].id, project_id=group_project.id, preferred_partner_id=students[5].id, rank=1)
        pref5 = StudentPreference(student_id=students[5].id, project_id=group_project.id, preferred_partner_id=students[4].id, rank=1)
        db.add(pref4)
        db.add(pref5)
        
        print(f"   [+] Enrolled {len(group_students)} students, created {5} partner preferences (2 mutual pairs)")
        db.commit()
        
        # ============================
        # 4. ENGLISH LEVELING PROJECT
        # ============================
        print("\n[5/6] Creating English Leveling Project...")
        
        english_project = Project(
            title="b",
            description="g",
            project_type=ProjectType.ENGLISH_LEVELING,
            teacher_id=teachers[2].id,
            deadline=datetime.utcnow() + timedelta(days=20),
            is_active=True,
            is_open_for_preferences=True,
            min_students=2,
            max_students=30,
            group_size=5
        )
        db.add(english_project)
        db.flush()
        print(f"   [+] English Project: '{english_project.title}' (ID: {english_project.id})")
        
        # Enroll all students (20 students with various English levels)
        for student in students:
            english_project.students.append(student)
        
        print(f"   [+] Enrolled {len(students)} students with mixed English levels")
        print(f"       - A1: {sum(1 for s in students if s.english_level == EnglishLevel.A1)}")
        print(f"       - A2: {sum(1 for s in students if s.english_level == EnglishLevel.A2)}")
        print(f"       - B1: {sum(1 for s in students if s.english_level == EnglishLevel.B1)}")
        print(f"       - B2: {sum(1 for s in students if s.english_level == EnglishLevel.B2)}")
        print(f"       - C1: {sum(1 for s in students if s.english_level == EnglishLevel.C1)}")
        print(f"       - C2: {sum(1 for s in students if s.english_level == EnglishLevel.C2)}")
        db.commit()
        
        # ============================
        # SUMMARY
        # ============================
        print("\n" + "="*70)
        print("[6/6] SEEDING COMPLETED SUCCESSFULLY!")
        print("="*70)
        print("\n[STATS] SUMMARY:")
        print(f"   [USERS] 1 Admin, 3 Teachers, {len(students)} Students")
        print(f"   [PROJECTS]")
        print(f"      - Exchange Program (ID: {exchange_project.id}) - {len(destinations)} destinations")
        print(f"      - Group Project (ID: {group_project.id}) - Partner preferences enabled")
        print(f"      - English Leveling (ID: {english_project.id}) - Mixed levels")
        print(f"\n[LOGIN] TEST CREDENTIALS:")
        print(f"   Admin:    admin@esiee.fr / admin123")
        print(f"   Teacher:  prof.exchange@esiee.fr / teacher123")
        print(f"   Student:  alice.martin@edu.esiee.fr / student123")
        print(f"   (All students use password: student123)")
        print(f"\n[TEST] READY TO TEST:")
        print(f"   1. Login as teacher to run algorithms")
        print(f"   2. Login as student to see assignments")
        print(f"   3. Test all 3 project types!")
        print("="*70)
        
    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] {e}")
        import traceback
        print(traceback.format_exc())
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_unified()
