"""
Seed test users for development
Run: python backend/seed_test_users.py
"""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.student import Student, Filiere, EnglishLevel
from app.models.teacher import Teacher
from app.auth_utils import hash_password


def seed_test_users():
    """Create test users for all roles"""
    db = SessionLocal()
    
    print("[*] Seeding test users...")
    
    try:
        # Check if users already exist
        existing_users = db.query(User).filter(
            User.email.in_([
                "admin@edu.esiee.fr",
                "prof@edu.esiee.fr",
                "etudiant@edu.esiee.fr"
            ])
        ).all()
        
        if existing_users:
            print(f"[!] Found {len(existing_users)} existing test users.")
            print("[!] Delete them first or use a fresh database.")
            print("[!] Skipping seed...")
            return
        
        # 1. Admin Account
        admin_user = User(
            email="admin@edu.esiee.fr",
            username="admin",
            hashed_password=hash_password("admin123"),
            first_name="Admin",
            last_name="ESIEE",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.flush()
        print("[+] Created admin account")
        
        # 2. Teacher Account
        teacher_user = User(
            email="prof@edu.esiee.fr",
            username="prof",
            hashed_password=hash_password("teacher123"),
            first_name="Marie",
            last_name="Dupont",
            role=UserRole.TEACHER,
            is_active=True
        )
        db.add(teacher_user)
        db.flush()
        
        teacher_profile = Teacher(
            user_id=teacher_user.id,
            department="Informatique",
            office="E203",
            phone="+33 1 45 92 65 00",
            bio="Professeure d'informatique spécialisée en génie logiciel"
        )
        db.add(teacher_profile)
        print("[+] Created teacher account")
        
        # 3. Student Accounts
        students_data = [
            {
                "email": "etudiant@edu.esiee.fr",
                "username": "etudiant",
                "first_name": "Jean",
                "last_name": "Martin",
                "student_number": "STU001",
                "filiere": Filiere.INFORMATIQUE,
                "english_level": EnglishLevel.B2,
                "general_rank": 15,
                "gpa": 14.5,
                "promotion": "2025"
            },
            {
                "email": "marie.dubois@edu.esiee.fr",
                "username": "marie.dubois",
                "first_name": "Marie",
                "last_name": "Dubois",
                "student_number": "STU002",
                "filiere": Filiere.INFORMATIQUE,
                "english_level": EnglishLevel.C1,
                "general_rank": 8,
                "gpa": 15.2,
                "promotion": "2025"
            },
            {
                "email": "paul.bernard@edu.esiee.fr",
                "username": "paul.bernard",
                "first_name": "Paul",
                "last_name": "Bernard",
                "student_number": "STU003",
                "filiere": Filiere.ELECTRONIQUE,
                "english_level": EnglishLevel.B1,
                "general_rank": 22,
                "gpa": 13.8,
                "promotion": "2025"
            }
        ]
        
        for student_data in students_data:
            # Create user
            student_user = User(
                email=student_data["email"],
                username=student_data["username"],
                hashed_password=hash_password("student123"),
                first_name=student_data["first_name"],
                last_name=student_data["last_name"],
                role=UserRole.STUDENT,
                is_active=True
            )
            db.add(student_user)
            db.flush()
            
            # Create student profile
            student_profile = Student(
                user_id=student_user.id,
                student_number=student_data["student_number"],
                filiere=student_data["filiere"],
                english_level=student_data["english_level"],
                general_rank=student_data["general_rank"],
                gpa=student_data["gpa"],
                promotion=student_data["promotion"]
            )
            db.add(student_profile)
        
        print(f"[+] Created {len(students_data)} student accounts")
        
        # Commit all changes
        db.commit()
        
        print("\n" + "="*70)
        print("[SUCCESS] Test users created successfully!")
        print("="*70)
        print("\nTest Credentials:")
        print("\nAdmin:")
        print("   Email: admin@edu.esiee.fr")
        print("   Password: admin123")
        print("\nTeacher:")
        print("   Email: prof@edu.esiee.fr")
        print("   Password: teacher123")
        print("\nStudents (all use password: student123):")
        print("   - etudiant@edu.esiee.fr")
        print("   - marie.dubois@edu.esiee.fr")
        print("   - paul.bernard@edu.esiee.fr")
        print("\n" + "="*70)
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_test_users()
