"""
English Leveling Service for Grouping Students by English Proficiency

This service groups students based on their English level (A1, A2, B1, B2, C1, C2)
for English leveling projects. It ensures students are grouped with peers of similar
English proficiency to facilitate effective learning.
"""

from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from collections import defaultdict

from app.models.student import Student
from app.models.project import Project
from app.models.assignment import Assignment
from app.models.student import EnglishLevel


class EnglishLevelingService:
    """
    Service to group students by English proficiency level
    """
    
    def __init__(self, db: Session, project_id: int):
        self.db = db
        self.project_id = project_id
        self.students: List[Student] = []
        self.project: Optional[Project] = None
        
    def load_data(self):
        """Load project and students data from database"""
        # Load project
        self.project = self.db.query(Project).filter(
            Project.id == self.project_id
        ).first()
        
        if not self.project:
            raise ValueError(f"Project {self.project_id} not found")
        
        # Load students participating in this project
        # Students are linked to projects via project_students association
        self.students = self.db.query(Student).filter(
            Student.projects.any(id=self.project_id)
        ).all()
        
        if not self.students:
            raise ValueError("No students found for this project")
    
    def group_by_english_level(
        self, 
        allow_adjacent_levels: bool = False,
        max_group_size: Optional[int] = None
    ) -> Tuple[List[List[int]], Dict]:
        """
        Group students by their English proficiency level
        
        Args:
            allow_adjacent_levels: If True, allow mixing adjacent levels (e.g., B1+B2)
            max_group_size: Maximum students per group (defaults to project.group_size or 10)
            
        Returns:
            Tuple of (groups, stats) where:
                - groups: List of groups (each group is a list of student IDs)
                - stats: Dictionary with grouping statistics
        """
        if not self.students:
            raise ValueError("No students loaded. Call load_data() first.")
        
        # Use project group size or default to 10
        group_size = max_group_size or self.project.group_size or 10
        
        # Group students by English level
        level_groups: Dict[EnglishLevel, List[Student]] = defaultdict(list)
        
        for student in self.students:
            if student.english_level:
                level_groups[student.english_level].append(student)
            else:
                # Students without English level go to a special group
                level_groups[EnglishLevel.UNKNOWN].append(student)
        
        # Sort levels from lowest to highest
        level_order = [
            EnglishLevel.A1,
            EnglishLevel.A2, 
            EnglishLevel.B1,
            EnglishLevel.B2,
            EnglishLevel.C1,
            EnglishLevel.C2
        ]
        
        final_groups: List[List[int]] = []
        
        if allow_adjacent_levels:
            # Strategy: Merge adjacent levels if they have small numbers
            final_groups = self._group_with_adjacent_mixing(
                level_groups, level_order, group_size
            )
        else:
            # Strategy: Strict separation by level
            final_groups = self._group_strict_by_level(
                level_groups, level_order, group_size
            )
        
        # Calculate statistics
        stats = self._calculate_stats(final_groups, level_groups)
        
        return final_groups, stats
    
    def _group_strict_by_level(
        self,
        level_groups: Dict[EnglishLevel, List[Student]],
        level_order: List[EnglishLevel],
        group_size: int
    ) -> List[List[int]]:
        """Group students strictly by their English level"""
        final_groups: List[List[int]] = []
        
        for level in level_order:
            students = level_groups.get(level, [])
            if not students:
                continue
            
            # Sort students by name for consistent grouping
            students.sort(key=lambda s: f"{s.last_name or ''} {s.first_name or ''}")
            
            # Create groups of specified size
            for i in range(0, len(students), group_size):
                group = students[i:i + group_size]
                final_groups.append([s.id for s in group])
        
        # Handle students with unknown level
        unknown_students = level_groups.get(EnglishLevel.UNKNOWN, [])
        if unknown_students:
            unknown_students.sort(key=lambda s: f"{s.last_name or ''} {s.first_name or ''}")
            for i in range(0, len(unknown_students), group_size):
                group = unknown_students[i:i + group_size]
                final_groups.append([s.id for s in group])
        
        return final_groups
    
    def _group_with_adjacent_mixing(
        self,
        level_groups: Dict[EnglishLevel, List[Student]],
        level_order: List[EnglishLevel],
        group_size: int
    ) -> List[List[int]]:
        """
        Group students by level, but allow mixing adjacent levels
        if a level has too few students to form complete groups
        """
        final_groups: List[List[int]] = []
        remaining_students: List[Student] = []
        
        for level in level_order:
            students = level_groups.get(level, [])
            if not students:
                continue
            
            # Add any remaining students from previous level
            if remaining_students:
                students = remaining_students + students
                remaining_students = []
            
            # Sort students
            students.sort(key=lambda s: f"{s.last_name or ''} {s.first_name or ''}")
            
            # Create full groups
            num_full_groups = len(students) // group_size
            for i in range(num_full_groups):
                start = i * group_size
                group = students[start:start + group_size]
                final_groups.append([s.id for s in group])
            
            # Keep remaining students for next level
            remaining_students = students[num_full_groups * group_size:]
        
        # Handle remaining students from last level
        if remaining_students:
            # If we have a partial group, add it
            if len(remaining_students) >= group_size // 2:
                final_groups.append([s.id for s in remaining_students])
            else:
                # Too few students, merge with last group if possible
                if final_groups:
                    final_groups[-1].extend([s.id for s in remaining_students])
                else:
                    final_groups.append([s.id for s in remaining_students])
        
        # Handle unknown level students - put them in separate groups
        unknown_students = level_groups.get(EnglishLevel.UNKNOWN, [])
        if unknown_students:
            unknown_students.sort(key=lambda s: f"{s.last_name or ''} {s.first_name or ''}")
            for i in range(0, len(unknown_students), group_size):
                group = unknown_students[i:i + group_size]
                final_groups.append([s.id for s in group])
        
        return final_groups
    
    def _calculate_stats(
        self, 
        groups: List[List[int]], 
        level_groups: Dict[EnglishLevel, List[Student]]
    ) -> Dict:
        """Calculate statistics about the grouping"""
        total_students = sum(len(group) for group in groups)
        
        # Count students per level
        level_counts = {}
        for level, students in level_groups.items():
            if students:
                level_counts[level.value] = len(students)
        
        # Calculate average group size
        avg_group_size = total_students / len(groups) if groups else 0
        
        # Find largest and smallest groups
        group_sizes = [len(g) for g in groups]
        max_group_size = max(group_sizes) if group_sizes else 0
        min_group_size = min(group_sizes) if group_sizes else 0
        
        return {
            "total_students": total_students,
            "total_groups": len(groups),
            "average_group_size": round(avg_group_size, 1),
            "max_group_size": max_group_size,
            "min_group_size": min_group_size,
            "students_per_level": level_counts,
            "grouping_strategy": "strict" if not groups else "mixed"
        }
    
    def save_assignments(self, groups: List[List[int]]) -> List[Dict]:
        """
        Save the group assignments to the database
        
        Args:
            groups: List of groups (each group is a list of student IDs)
            
        Returns:
            List of created assignment records
        """
        # Delete existing assignments for this project
        self.db.query(Assignment).filter(
            Assignment.project_id == self.project_id
        ).delete()
        
        from datetime import datetime
        import uuid
        
        assignments_created = []
        algorithm_run_id = str(uuid.uuid4())
        
        for group_num, student_ids in enumerate(groups, start=1):
            for student_id in student_ids:
                # Get student to determine their English level
                student = next((s for s in self.students if s.id == student_id), None)
                english_level = student.english_level.value if student and student.english_level else "UNKNOWN"
                
                assignment = Assignment(
                    student_id=student_id,
                    project_id=self.project_id,
                    group_number=group_num,
                    preference_rank=None,  # Not applicable for English leveling
                    satisfaction_score=10.0,  # Everyone is "satisfied" in leveling
                    algorithm_score=10.0,
                    algorithm_run_id=algorithm_run_id,
                    assigned_at=datetime.utcnow()
                )
                
                self.db.add(assignment)
                assignments_created.append({
                    "student_id": student_id,
                    "group_number": group_num,
                    "english_level": english_level
                })
        
        self.db.commit()
        return assignments_created
    
    def execute(
        self, 
        allow_adjacent_levels: bool = False,
        max_group_size: Optional[int] = None
    ) -> Dict:
        """
        Execute the English leveling algorithm
        
        Args:
            allow_adjacent_levels: Allow mixing adjacent English levels
            max_group_size: Maximum students per group
            
        Returns:
            Dictionary with results and statistics
        """
        try:
            # 1. Load data
            self.load_data()
            
            # 2. Group students
            groups, stats = self.group_by_english_level(
                allow_adjacent_levels=allow_adjacent_levels,
                max_group_size=max_group_size
            )
            
            # 3. Save assignments
            assignments = self.save_assignments(groups)
            
            return {
                "success": True,
                "total_students": stats["total_students"],
                "groups_created": len(groups),
                "students_per_level": stats["students_per_level"],
                "average_group_size": stats["average_group_size"],
                "assignments": assignments,
                "stats": stats
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


def assign_students_by_english_level(
    db: Session,
    project_id: int,
    allow_adjacent_levels: bool = False,
    max_group_size: Optional[int] = None
) -> Tuple[List[List[int]], Dict]:
    """
    Convenience function to run the English leveling algorithm
    
    Args:
        db: Database session
        project_id: ID of the project
        allow_adjacent_levels: Allow mixing adjacent English levels
        max_group_size: Maximum students per group
        
    Returns:
        Tuple of (groups, result_dict)
    """
    service = EnglishLevelingService(db, project_id)
    result = service.execute(
        allow_adjacent_levels=allow_adjacent_levels,
        max_group_size=max_group_size
    )
    
    if not result["success"]:
        raise ValueError(result["error"])
    
    # Reconstruct groups from assignments
    assignments = result["assignments"]
    groups_dict: Dict[int, List[int]] = defaultdict(list)
    
    for assignment in assignments:
        groups_dict[assignment["group_number"]].append(assignment["student_id"])
    
    groups = [groups_dict[i] for i in sorted(groups_dict.keys())]
    
    return groups, result
