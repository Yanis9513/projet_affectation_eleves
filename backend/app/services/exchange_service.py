"""
Service pour la gestion des programmes d'échange et l'algorithme d'optimisation
"""

from typing import List, Dict, Tuple, Optional
from sqlalchemy.orm import Session
from collections import defaultdict
import random

from app.models import Project, Destination, DestinationPreference, Student, ProjectType

# Mapping des grades vers des scores numériques (A=6, B=5, C=4, D=3, E=2, F=1)
GRADE_TO_SCORE = {
    'A': 6,
    'B': 5,
    'C': 4,
    'D': 3,
    'E': 2,
    'F': 1
}


def get_all_project_destinations(db: Session, project_id: int) -> List[Destination]:
    """Récupérer toutes les destinations d'un projet"""
    return db.query(Destination).filter(Destination.project_id == project_id).all()


def get_student_preferences_for_project(db: Session, project_id: int) -> Dict[int, Dict[int, str]]:
    """
    Récupérer les préférences de tous les étudiants pour un projet
    Retourne: {student_id: {destination_id: grade}}
    """
    preferences = db.query(DestinationPreference).filter(
        DestinationPreference.project_id == project_id
    ).all()
    
    student_prefs = defaultdict(dict)
    for pref in preferences:
        student_prefs[pref.student_id][pref.destination_id] = pref.grade
    
    return dict(student_prefs)


def get_project_students(db: Session, project_id: int) -> List[Student]:
    """Récupérer tous les étudiants d'un projet"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        return project.students
    return []


def fill_missing_preferences_with_f(
    db: Session, 
    project_id: int, 
    dry_run: bool = False
) -> Tuple[int, List[Dict]]:
    """
    Remplit automatiquement les préférences manquantes avec des F pour tous les étudiants
    
    Args:
        db: Session SQLAlchemy
        project_id: ID du projet
        dry_run: Si True, ne modifie pas la BD, retourne juste ce qui serait fait
    
    Returns:
        Tuple (nombre d'étudiants modifiés, liste des modifications)
    """
    students = get_project_students(db, project_id)
    destinations = get_all_project_destinations(db, project_id)
    existing_prefs = get_student_preferences_for_project(db, project_id)
    
    modifications = []
    students_modified = 0
    
    for student in students:
        student_id = student.id
        student_dest_prefs = existing_prefs.get(student_id, {})
        
        # Trouver les destinations sans préférence
        missing_destinations = []
        for dest in destinations:
            if dest.id not in student_dest_prefs:
                missing_destinations.append(dest)
        
        if missing_destinations:
            students_modified += 1
            
            # Déterminer quels grades sont déjà utilisés
            used_grades = set(student_dest_prefs.values())
            available_grades = [g for g in ['A', 'B', 'C', 'D', 'E', 'F'] if g not in used_grades]
            
            mod_info = {
                'student_id': student_id,
                'student_name': f"{student.user.first_name} {student.user.last_name}" if student.user else f"Student {student_id}",
                'filled_count': len(student_dest_prefs),
                'missing_count': len(missing_destinations),
                'auto_filled': []
            }
            
            for i, dest in enumerate(missing_destinations):
                # Attribuer le grade le moins préféré disponible (F, puis E, etc.)
                grade = available_grades[-(i+1)] if i < len(available_grades) else 'F'
                
                if not dry_run:
                    new_pref = DestinationPreference(
                        student_id=student_id,
                        destination_id=dest.id,
                        project_id=project_id,
                        grade=grade
                    )
                    db.add(new_pref)
                
                mod_info['auto_filled'].append({
                    'destination_id': dest.id,
                    'destination_name': dest.university_name,
                    'grade': grade
                })
            
            modifications.append(mod_info)
    
    if not dry_run and modifications:
        db.commit()
    
    return students_modified, modifications


def calculate_preference_score(grade: str) -> int:
    """Convertit un grade A-F en score numérique"""
    return GRADE_TO_SCORE.get(grade.upper(), 1)


def check_destination_constraints(
    student: Student, 
    destination: Destination
) -> Tuple[bool, List[str]]:
    """
    Vérifie si un étudiant respecte les contraintes d'une destination
    
    Returns:
        Tuple (est_acceptable, liste_des_erreurs)
    """
    errors = []
    
    # Vérifier la filière
    if destination.accepted_filieres and student.filiere:
        accepted = [f.strip() for f in destination.accepted_filieres.split(',')]
        if student.filiere.value not in accepted:
            errors.append(f"Filière non acceptée: {student.filiere.value}")
    
    # Vérifier le niveau d'anglais
    if destination.min_english_level and student.english_level:
        english_levels = {'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6}
        student_level = english_levels.get(student.english_level.value, 0)
        required_level = english_levels.get(destination.min_english_level, 0)
        if student_level < required_level:
            errors.append(f"Niveau d'anglais insuffisant: {student.english_level.value} < {destination.min_english_level}")
    
    # Vérifier le GPA
    if destination.min_gpa and student.gpa:
        if student.gpa < destination.min_gpa:
            errors.append(f"GPA insuffisant: {student.gpa} < {destination.min_gpa}")
    
    # Vérifier le score TOEIC
    if destination.min_toeic_score and student.toeic_score:
        if student.toeic_score < destination.min_toeic_score:
            errors.append(f"Score TOEIC insuffisant: {student.toeic_score} < {destination.min_toeic_score}")
    
    return len(errors) == 0, errors


def run_exchange_optimization(
    db: Session,
    project_id: int,
    algorithm: str = "greedy",  # "greedy" ou "genetic"
    respect_constraints: bool = True
) -> Dict:
    """
    Algorithme d'optimisation pour assigner les étudiants aux destinations
    
    Args:
        db: Session SQLAlchemy
        project_id: ID du projet
        algorithm: Algorithme à utiliser ("greedy" ou "genetic")
        respect_constraints: Si True, vérifie les contraintes des destinations
    
    Returns:
        Dictionnaire avec les résultats de l'assignation
    """
    # Récupérer toutes les données nécessaires
    students = get_project_students(db, project_id)
    destinations = get_all_project_destinations(db, project_id)
    preferences = get_student_preferences_for_project(db, project_id)
    
    if not students:
        return {
            'success': False,
            'error': 'Aucun étudiant dans ce projet',
            'assignments': [],
            'statistics': {}
        }
    
    if not destinations:
        return {
            'success': False,
            'error': 'Aucune destination définie pour ce projet',
            'assignments': [],
            'statistics': {}
        }
    
    # Préparer les données pour l'algorithme
    student_list = list(students)
    dest_list = list(destinations)
    
    if algorithm == "genetic":
        assignments = _genetic_algorithm(student_list, dest_list, preferences, respect_constraints)
    else:
        assignments = _greedy_algorithm(student_list, dest_list, preferences, respect_constraints)
        
        # If no one got assigned with strict constraints, try without constraints as fallback
        assigned_count = sum(1 for a in assignments if a.get('destination_id'))
        if assigned_count == 0 and respect_constraints:
            print(f"[EXCHANGE] No assignments with strict constraints, trying without constraints...")
            assignments = _greedy_algorithm(student_list, dest_list, preferences, False)
    
    # SAUVEGARDER les affectations dans la base de données
    from app.models.assignment import Assignment
    from app.models.project import Project
    from datetime import datetime
    
    # Supprimer les anciennes affectations
    db.query(Assignment).filter(Assignment.project_id == project_id).delete()
    
    # Créer les nouvelles affectations (only for students with a destination)
    for assignment_data in assignments:
        # Skip unassigned students - don't create assignment without destination
        if not assignment_data.get('destination_id'):
            continue
            
        assignment = Assignment(
            student_id=assignment_data['student_id'],
            project_id=project_id,
            destination_id=assignment_data.get('destination_id'),
            preference_rank=assignment_data.get('choice_rank'),
            satisfaction_score=assignment_data.get('satisfaction', 0),
            assigned_at=datetime.utcnow()
        )
        db.add(assignment)
    
    # Update project to mark algorithm as ran
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        project.algorithm_ran = True
    
    db.commit()
    
    # Calculer les statistiques
    stats = _calculate_statistics(assignments, preferences)
    
    return {
        'success': True,
        'algorithm': algorithm,
        'assignments': assignments,
        'statistics': stats,
        'total_students': len(students),
        'total_destinations': len(destinations)
    }


def _greedy_algorithm(
    students: List[Student],
    destinations: List[Destination],
    preferences: Dict[int, Dict[int, str]],
    respect_constraints: bool
) -> List[Dict]:
    """
    Algorithme glouton pour assigner les étudiants aux destinations
    Priorité: Meilleures notes (A) d'abord, puis classement général
    """
    assignments = []
    
    # Créer une copie des places disponibles
    available_places = {dest.id: dest.total_places for dest in destinations}
    
    # Trier les étudiants par classement général (meilleur d'abord)
    sorted_students = sorted(students, key=lambda s: (s.general_rank or 999999, s.id))
    
    # Pour chaque grade de A à F
    for grade in ['A', 'B', 'C', 'D', 'E', 'F']:
        for student in sorted_students:
            student_id = student.id
            
            # Vérifier si l'étudiant est déjà assigné
            if any(a['student_id'] == student_id for a in assignments):
                continue
            
            # Trouver les destinations avec ce grade
            student_prefs = preferences.get(student_id, {})
            preferred_dest_ids = [
                dest_id for dest_id, student_grade in student_prefs.items() 
                if student_grade == grade
            ]
            
            # Essayer chaque destination préférée avec ce grade
            assigned = False
            for dest_id in preferred_dest_ids:
                destination = next((d for d in destinations if d.id == dest_id), None)
                if not destination:
                    continue
                
                # Vérifier s'il reste des places
                if available_places.get(dest_id, 0) <= 0:
                    continue
                
                # Vérifier les contraintes si nécessaire
                if respect_constraints:
                    is_valid, errors = check_destination_constraints(student, destination)
                    if not is_valid:
                        # Log why assignment failed for debugging
                        print(f"[GREEDY] Student {student_id} rejected for {destination.university_name}: {errors}")
                        continue
                
                # Assigner l'étudiant
                assignments.append({
                    'student_id': student_id,
                    'student_name': f"{student.user.first_name} {student.user.last_name}" if student.user else f"Student {student_id}",
                    'destination_id': dest_id,
                    'destination_name': destination.university_name,
                    'grade': grade,
                    'satisfied_preference': True
                })
                available_places[dest_id] -= 1
                assigned = True
                break
            
            # Si non assigné avec ce grade, passer au grade suivant
            if assigned:
                continue
    
    # Traiter les étudiants non assignés (les mettre dans une liste d'attente)
    unassigned_students = [s for s in students if not any(a['student_id'] == s.id for a in assignments)]
    for student in unassigned_students:
        assignments.append({
            'student_id': student.id,
            'student_name': f"{student.user.first_name} {student.user.last_name}" if student.user else f"Student {student.id}",
            'destination_id': None,
            'destination_name': None,
            'grade': None,
            'satisfied_preference': False,
            'status': 'unassigned'
        })
    
    return assignments


def _genetic_algorithm(
    students: List[Student],
    destinations: List[Destination],
    preferences: Dict[int, Dict[int, str]],
    respect_constraints: bool,
    population_size: int = 100,
    generations: int = 200,
    mutation_rate: float = 0.1
) -> List[Dict]:
    """
    Algorithme génétique pour l'optimisation de l'assignation
    """
    if not students or not destinations:
        return []
    
    # Fonction de fitness
    def fitness(individual: Dict[int, int]) -> float:
        score = 0
        dest_counts = defaultdict(int)
        
        for student_id, dest_id in individual.items():
            if dest_id is None:
                score -= 100  # Pénalité pour non-assigné
                continue
            
            # Score basé sur la préférence
            student_prefs = preferences.get(student_id, {})
            grade = student_prefs.get(dest_id, 'F')
            score += calculate_preference_score(grade)
            
            # Vérifier la capacité
            destination = next((d for d in destinations if d.id == dest_id), None)
            if destination:
                dest_counts[dest_id] += 1
                if dest_counts[dest_id] > destination.total_places:
                    score -= 50  # Pénalité pour surcharge
        
        return score
    
    # Créer une population initiale
    def create_individual() -> Dict[int, int]:
        individual = {}
        available_places = {d.id: d.total_places for d in destinations}
        
        for student in students:
            student_prefs = preferences.get(student.id, {})
            
            # Essayer d'assigner selon les préférences
            for grade in ['A', 'B', 'C', 'D', 'E', 'F']:
                possible_dests = [d_id for d_id, g in student_prefs.items() if g == grade]
                random.shuffle(possible_dests)
                
                for dest_id in possible_dests:
                    if available_places.get(dest_id, 0) > 0:
                        individual[student.id] = dest_id
                        available_places[dest_id] -= 1
                        break
                else:
                    continue
                break
            else:
                # Aucune préférence satisfaite, assigner aléatoirement
                available = [d_id for d_id, count in available_places.items() if count > 0]
                if available:
                    dest_id = random.choice(available)
                    individual[student.id] = dest_id
                    available_places[dest_id] -= 1
                else:
                    individual[student.id] = None
        
        return individual
    
    # Croisement
    def crossover(p1: Dict, p2: Dict) -> Tuple[Dict, Dict]:
        students_list = list(p1.keys())
        point = len(students_list) // 2
        
        c1 = {}
        c2 = {}
        
        for i, student_id in enumerate(students_list):
            if i < point:
                c1[student_id] = p1[student_id]
                c2[student_id] = p2[student_id]
            else:
                c1[student_id] = p2[student_id]
                c2[student_id] = p1[student_id]
        
        return c1, c2
    
    # Mutation
    def mutate(individual: Dict) -> Dict:
        if random.random() < mutation_rate:
            student_id = random.choice(list(individual.keys()))
            available_dests = [d.id for d in destinations]
            individual[student_id] = random.choice(available_dests) if available_dests else None
        return individual
    
    # Algorithme génétique principal
    population = [create_individual() for _ in range(population_size)]
    
    for generation in range(generations):
        # Évaluer la fitness
        fitness_scores = [(ind, fitness(ind)) for ind in population]
        fitness_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Sélection des meilleurs
        elite_size = population_size // 4
        new_population = [ind for ind, _ in fitness_scores[:elite_size]]
        
        # Générer le reste par croisement et mutation
        while len(new_population) < population_size:
            p1, p2 = random.choices([ind for ind, _ in fitness_scores[:population_size//2]], k=2)
            c1, c2 = crossover(p1, p2)
            new_population.append(mutate(c1))
            if len(new_population) < population_size:
                new_population.append(mutate(c2))
        
        population = new_population
    
    # Retourner la meilleure solution
    best_individual = max(population, key=fitness)
    
    # POST-PROCESSING: Validate and fix capacity constraints
    # Count assignments per destination
    dest_counts = defaultdict(int)
    valid_assignments = {}
    
    # Sort students by preference score (higher is better) to prioritize better students
    def student_priority(student_id):
        dest_id = best_individual.get(student_id)
        if not dest_id:
            return -1
        student_prefs = preferences.get(student_id, {})
        grade = student_prefs.get(dest_id, 'F')
        return calculate_preference_score(grade)
    
    sorted_student_ids = sorted(best_individual.keys(), key=student_priority, reverse=True)
    
    for student_id in sorted_student_ids:
        dest_id = best_individual.get(student_id)
        if dest_id:
            destination = next((d for d in destinations if d.id == dest_id), None)
            if destination and dest_counts[dest_id] < destination.total_places:
                valid_assignments[student_id] = dest_id
                dest_counts[dest_id] += 1
            else:
                # Over capacity - this student doesn't get assigned
                valid_assignments[student_id] = None
        else:
            valid_assignments[student_id] = None
    
    # Convertir en format d'assignations
    assignments = []
    for student in students:
        student_id = student.id
        dest_id = valid_assignments.get(student_id)
        
        if dest_id:
            destination = next((d for d in destinations if d.id == dest_id), None)
            student_prefs = preferences.get(student_id, {})
            grade = student_prefs.get(dest_id, 'F')
            
            assignments.append({
                'student_id': student_id,
                'student_name': f"{student.user.first_name} {student.user.last_name}" if student.user else f"Student {student_id}",
                'destination_id': dest_id,
                'destination_name': destination.university_name if destination else None,
                'grade': grade,
                'satisfied_preference': grade in ['A', 'B', 'C']
            })
        else:
            assignments.append({
                'student_id': student_id,
                'student_name': f"{student.user.first_name} {student.user.last_name}" if student.user else f"Student {student_id}",
                'destination_id': None,
                'destination_name': None,
                'grade': None,
                'satisfied_preference': False,
                'status': 'unassigned'
            })
    
    return assignments


def _calculate_statistics(assignments: List[Dict], preferences: Dict) -> Dict:
    """Calcule les statistiques de l'assignation"""
    total = len(assignments)
    if total == 0:
        return {}
    
    assigned = [a for a in assignments if a['destination_id'] is not None]
    unassigned = [a for a in assignments if a['destination_id'] is None]
    satisfied = [a for a in assignments if a.get('satisfied_preference', False)]
    
    grade_counts = defaultdict(int)
    for a in assigned:
        grade = a.get('grade', 'F')
        grade_counts[grade] += 1
    
    # Calculer le score de satisfaction moyen
    total_score = sum(calculate_preference_score(a.get('grade', 'F')) for a in assigned)
    avg_score = total_score / len(assigned) if assigned else 0
    
    return {
        'total_students': total,
        'assigned': len(assigned),
        'unassigned': len(unassigned),
        'satisfaction_rate': len(satisfied) / total * 100 if total > 0 else 0,
        'assignment_rate': len(assigned) / total * 100 if total > 0 else 0,
        'average_preference_score': round(avg_score, 2),
        'grade_distribution': dict(grade_counts),
        'max_possible_score': 6 * len(assigned),  # Si tous A
        'actual_score': total_score,
        'efficiency': round(total_score / (6 * len(assigned)) * 100, 2) if assigned else 0
    }
