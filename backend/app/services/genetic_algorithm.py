"""
Algorithme Génétique pour l'Affectation des Étudiants aux Universités Partenaires

Adapté de Algo_Gen_AI.py pour fonctionner avec SQLAlchemy
Utilise DEAP pour optimiser l'affectation en maximisant la satisfaction
tout en respectant les contraintes de capacité, mobilité et filière.
"""

import random
import logging
import numpy as np
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from deap import base, creator, tools, algorithms

from app.models.student import Student
from app.models.destination import Destination
from app.models.destination_preference import DestinationPreference
from app.models.assignment import Assignment

logger = logging.getLogger(__name__)

# Grade to numeric rank mapping (A=best=1, F=worst=6)
GRADE_TO_RANK = {"A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6}


class GeneticAlgorithmService:
    """
    Service d'optimisation par algorithme génétique pour les programmes d'échange
    """
    
    def __init__(self, db: Session, project_id: int):
        self.db = db
        self.project_id = project_id
        self.students = []
        self.destinations = []
        self.preferences_map = {}
        self.toolbox = None
        
    def load_data(self):
        """Charge les données depuis la base de données"""
        # Charger les destinations du projet
        self.destinations = self.db.query(Destination).filter(
            Destination.project_id == self.project_id,
            Destination.is_active == True
        ).all()
        
        if not self.destinations:
            raise ValueError("Aucune destination disponible pour ce projet")
        
        # Charger les étudiants avec leurs préférences
        preferences = self.db.query(DestinationPreference).filter(
            DestinationPreference.project_id == self.project_id
        ).all()
        
        # Récupérer les IDs uniques des étudiants
        student_ids = list(set([p.student_id for p in preferences]))
        
        if not student_ids:
            raise ValueError("Aucun étudiant n'a soumis de préférences")
        
        # Charger les étudiants
        self.students = self.db.query(Student).filter(
            Student.id.in_(student_ids)
        ).all()
        
        # Trier les étudiants par priorité (classement C1>C2>C3, puis TOEIC décroissant)
        classement_order = {"C1": 1, "C2": 2, "C3": 3}
        self.students.sort(
            key=lambda s: (
                classement_order.get(s.classement, 99),
                -(s.toeic_score or 0)
            )
        )
        
        # Construire la map des préférences
        # preferences_map[student_id] = {1: dest_id, 2: dest_id, ...}
        # Le modèle DestinationPreference utilise 'grade' (A-F), pas 'rank'
        for student in self.students:
            prefs = self.db.query(DestinationPreference).filter(
                DestinationPreference.student_id == student.id,
                DestinationPreference.project_id == self.project_id
            ).order_by(DestinationPreference.grade).all()
            
            self.preferences_map[student.id] = {
                GRADE_TO_RANK.get(pref.grade, 6): pref.destination_id for pref in prefs
            }
    
    def setup_deap(self):
        """Configure DEAP pour l'algorithme génétique"""
        # Nettoyer les créations précédentes (thread-safe with try/except)
        try:
            del creator.FitnessMulti
        except AttributeError:
            pass
        try:
            del creator.Individual
        except AttributeError:
            pass
        
        # Créer les types DEAP
        creator.create("FitnessMulti", base.Fitness, weights=(1.0, -1.0))
        creator.create("Individual", list, fitness=creator.FitnessMulti)
        
        self.toolbox = base.Toolbox()
        self.toolbox.register("individual", tools.initIterate, creator.Individual, self.generate_valid_assignment)
        self.toolbox.register("population", tools.initRepeat, list, self.toolbox.individual)
        self.toolbox.register("evaluate", self.evaluate_solution)
        self.toolbox.register("mate", tools.cxTwoPoint)
        self.toolbox.register("mutate", self.mutate_individual)
        self.toolbox.register("select", tools.selNSGA2)
    
    def generate_valid_assignment(self):
        """Génère une affectation initiale valide"""
        assignment = []
        capacities = {dest.id: dest.available_places for dest in self.destinations}
        
        for student in self.students:
            assigned = False
            student_prefs = self.preferences_map.get(student.id, {})
            
            # Essayer chaque choix dans l'ordre
            for rank in sorted(student_prefs.keys()):
                dest_id = student_prefs[rank]
                dest = next((d for d in self.destinations if d.id == dest_id), None)
                
                if not dest:
                    continue
                
                # Vérifier compatibilité et capacité
                if (self._check_compatibility(student, dest) and 
                    capacities.get(dest_id, 0) > 0):
                    assignment.append(dest_id)
                    capacities[dest_id] -= 1
                    assigned = True
                    break
            
            # Si aucun choix valide
            if not assigned:
                assignment.append(None)
        
        return assignment
    
    def _check_compatibility(self, student: Student, destination: Destination) -> bool:
        """Vérifie la compatibilité étudiant/destination"""
        # Vérifier le type de mobilité
        if student.mobility_type and student.mobility_type != destination.mobility_type.value:
            return False
        
        # Vérifier la filière
        if not destination.accepts_filiere(student.filiere.value):
            return False
        
        # Vérifier le score TOEIC minimum
        if destination.min_toeic_score and (not student.toeic_score or student.toeic_score < destination.min_toeic_score):
            return False
        
        return True
    
    def find_choice_rank(self, student_id: int, destination_id: Optional[int]) -> Optional[int]:
        """Trouve le rang du choix pour un étudiant"""
        if not destination_id:
            return None
        
        student_prefs = self.preferences_map.get(student_id, {})
        for rank, dest_id in student_prefs.items():
            if dest_id == destination_id:
                return rank
        return None
    
    def evaluate_solution(self, individual: List[Optional[int]]) -> Tuple[float, float]:
        """Évalue une solution (affectation)"""
        satisfaction_total = 0
        penalties = 0
        capacities = {dest.id: dest.available_places for dest in self.destinations}
        
        for i, student in enumerate(self.students):
            dest_id = individual[i]
            
            # Cas: non affecté
            if not dest_id:
                penalties += 10
                continue
            
            # Vérifier si la destination existe
            dest = next((d for d in self.destinations if d.id == dest_id), None)
            if not dest:
                penalties += 10
                continue
            
            # Vérifier compatibilités
            if not self._check_compatibility(student, dest):
                penalties += 5
            
            # Vérifier capacité
            if capacities[dest_id] <= 0:
                penalties += 10
            else:
                capacities[dest_id] -= 1
            
            # Calcul satisfaction
            rank = self.find_choice_rank(student.id, dest_id)
            if rank:
                satisfaction_total += (7 - rank)  # CHOIX1=6, CHOIX6=1
        
        satisfaction_avg = satisfaction_total / len(self.students) if self.students else 0
        return satisfaction_avg, penalties
    
    def mutate_individual(self, individual: List[Optional[int]], indpb: float = 0.2):
        """Mute un individu en changeant aléatoirement certaines affectations"""
        for i in range(len(individual)):
            if random.random() < indpb:
                student = self.students[i]
                
                # Trouver destinations compatibles
                compatible = [
                    dest.id for dest in self.destinations
                    if self._check_compatibility(student, dest)
                ]
                
                if compatible:
                    individual[i] = random.choice(compatible)
        
        return individual,
    
    def run_optimization(self, population_size: int = 40, generations: int = 30) -> List[Optional[int]]:
        """Exécute l'optimisation"""
        logger.info(f"Démarrage optimisation: {len(self.students)} étudiants, {len(self.destinations)} destinations")
        
        # Créer population initiale
        population = self.toolbox.population(n=population_size)
        
        # Évaluer chaque individu
        fitnesses = list(map(self.toolbox.evaluate, population))
        for ind, fit in zip(population, fitnesses):
            ind.fitness.values = fit
        
        # Algorithme génétique
        population, logbook = algorithms.eaMuPlusLambda(
            population, self.toolbox,
            mu=population_size,
            lambda_=population_size * 2,
            cxpb=0.6,
            mutpb=0.3,
            ngen=generations,
            verbose=False
        )
        
        # Meilleure solution
        best = tools.selBest(population, 1)[0]
        logger.info(f"Optimisation terminée. Score: {best.fitness.values}")
        
        return best
    
    def save_assignments(self, solution: List[Optional[int]]):
        """Sauvegarde les affectations dans la base de données"""
        # Supprimer les anciennes affectations pour ce projet
        self.db.query(Assignment).filter(
            Assignment.project_id == self.project_id
        ).delete()
        
        # Créer les nouvelles affectations
        assignments_created = []
        capacities = {dest.id: dest.available_places for dest in self.destinations}
        
        created_count = 0
        skipped_count = 0
        for i, student in enumerate(self.students):
            dest_id = solution[i]
            
            if not dest_id:
                skipped_count += 1
                continue
            
            if capacities.get(dest_id, 0) <= 0:
                skipped_count += 1
                continue
            
            dest = next((d for d in self.destinations if d.id == dest_id), None)
            if not dest:
                skipped_count += 1
                continue
            
            # Réduire la capacité
            capacities[dest_id] -= 1
            
            # Calculer le score de satisfaction
            rank = self.find_choice_rank(student.id, dest_id)
            satisfaction_score = (7 - rank) if rank else 0
            
            # Créer l'affectation
            assignment = Assignment(
                project_id=self.project_id,
                student_id=student.id,
                destination_id=dest_id,  # Store the assigned destination
                group_number=None,  # Pas de groupe pour exchange_program
                satisfaction_score=satisfaction_score,
                preference_rank=rank
            )
            
            self.db.add(assignment)
            created_count += 1
            assignments_created.append({
                "student_id": student.id,
                "destination_id": dest_id,
                "destination_name": dest.university_name,
                "choice_rank": rank,
                "satisfaction": satisfaction_score
            })
        
        # Mettre à jour les capacités des destinations
        for dest in self.destinations:
            dest.available_places = capacities.get(dest.id, dest.available_places)
        
        try:
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise
        
        return assignments_created
    
    def execute(self, population_size: int = 40, generations: int = 30) -> Dict:
        """Exécute l'algorithme complet"""
        try:
            # 1. Charger les données
            self.load_data()
            
            # 2. Configurer DEAP
            self.setup_deap()
            
            # 3. Exécuter l'optimisation
            best_solution = self.run_optimization(population_size, generations)
            
            # 4. Sauvegarder les résultats
            assignments = self.save_assignments(best_solution)
            
            # 5. Calculer les statistiques
            total_students = len(self.students)
            assigned_students = len(assignments)
            choice1_count = sum(1 for a in assignments if a['choice_rank'] == 1)
            avg_satisfaction = sum(a['satisfaction'] for a in assignments) / assigned_students if assigned_students > 0 else 0
            
            return {
                "success": True,
                "total_students": total_students,
                "assigned_students": assigned_students,
                "unassigned_students": total_students - assigned_students,
                "choice1_count": choice1_count,
                "average_satisfaction": round(avg_satisfaction, 2),
                "assignments": assignments
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
