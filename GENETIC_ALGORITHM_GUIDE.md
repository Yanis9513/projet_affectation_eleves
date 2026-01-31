# Guide d'utilisation de l'algorithme génétique pour les programmes d'échange

## Vue d'ensemble

L'algorithme génétique est utilisé **uniquement pour les projets de type `exchange_program`**. Il permet d'affecter les étudiants aux universités partenaires en optimisant la satisfaction globale tout en respectant les contraintes (capacité, niveau d'anglais, filière, etc.).

## Architecture

### Modèles de données

#### 1. Destination (Université partenaire)
```python
class Destination:
    university_name: str          # Nom de l'université
    country: str                  # Pays
    city: str                     # Ville
    total_places: int             # Nombre total de places
    available_places: int         # Places disponibles
    mobility_type: MobilityType   # SEMESTER, FULL_YEAR, SHORT_TERM
    accepted_filieres: str        # Filières acceptées (séparées par virgules)
    min_english_level: str        # Niveau minimum d'anglais (ex: B2, C1)
    min_toeic_score: int          # Score TOEIC minimum (0-990)
    min_gpa: float                # Moyenne minimale (0-20)
```

#### 2. DestinationPreference (Choix de l'étudiant)
```python
class DestinationPreference:
    student_id: int               # ID de l'étudiant
    destination_id: int           # ID de la destination
    project_id: int               # ID du projet
    rank: int                     # Rang de préférence (1-6)
```

#### 3. Student (Extensions pour l'échange)
```python
class Student:
    # Champs existants...
    toeic_score: int              # Score TOEIC (0-990)
    classement: str               # Priorité: C1, C2 ou C3
    mobility_type: str            # Type de mobilité souhaité
```

## Fonctionnement de l'algorithme

### 1. Algorithme génétique (NSGA-II)

L'algorithme utilise le framework **DEAP** avec les paramètres suivants:

- **Population**: 40 individus (mu=40, lambda=80)
- **Générations**: 30 iterations
- **Probabilité de croisement**: 60%
- **Probabilité de mutation**: 30%
- **Méthode**: NSGA-II (Non-dominated Sorting Genetic Algorithm II)

### 2. Fonction de fitness (évaluation)

Chaque solution est évaluée selon 2 objectifs:

#### Objectif 1: Maximiser la satisfaction
```python
satisfaction = sum(7 - rank)  # CHOIX1=6pts, CHOIX2=5pts, ..., CHOIX6=1pt
```

#### Objectif 2: Minimiser les pénalités
- **Dépassement de capacité**: -100 points par place en excès
- **Incompatibilité mobility_type**: -50 points
- **Filière non acceptée**: -50 points
- **TOEIC insuffisant**: -30 points
- **Non-affecté**: -20 points

### 3. Priorité des étudiants

Les étudiants sont triés par priorité décroissante:

1. **Classement** (C1 > C2 > C3)
2. **Score TOEIC** (du plus élevé au plus bas)

## Utilisation via l'API

### Étape 1: Créer un projet d'échange

```bash
POST /api/projects
{
  "title": "Programme d'échange 2024",
  "project_type": "exchange_program",
  "description": "Mobilité internationale",
  "start_date": "2024-09-01",
  "end_date": "2025-06-30"
}
```

### Étape 2: Ajouter des destinations (Enseignant)

```bash
POST /api/destinations/{project_id}
{
  "university_name": "University of Edinburgh",
  "country": "UK",
  "city": "Edinburgh",
  "total_places": 10,
  "mobility_type": "SEMESTER",
  "accepted_filieres": "Informatique,Mathématiques",
  "min_english_level": "B2",
  "min_toeic_score": 750,
  "min_gpa": 12.0
}
```

### Étape 3: Consulter les destinations disponibles (Étudiant)

```bash
GET /api/destinations/{project_id}
```

### Étape 4: Soumettre ses choix (Étudiant)

```bash
POST /api/destinations/preferences
{
  "project_id": 1,
  "preferences": [
    {"destination_id": 5, "rank": 1},  # CHOIX1
    {"destination_id": 2, "rank": 2},  # CHOIX2
    {"destination_id": 8, "rank": 3},  # CHOIX3
    {"destination_id": 1, "rank": 4},  # CHOIX4
    {"destination_id": 3, "rank": 5},  # CHOIX5
    {"destination_id": 7, "rank": 6}   # CHOIX6
  ]
}
```

### Étape 5: Exécuter l'algorithme (Enseignant)

```bash
POST /api/assignments/run-algorithm
{
  "project_id": 1,
  "population_size": 40,  # Optionnel (défaut: 40)
  "generations": 30       # Optionnel (défaut: 30)
}
```

**Réponse:**
```json
{
  "status": "success",
  "message": "Successfully assigned 45 students to destinations",
  "assignments_created": 45,
  "groups_created": 0,
  "stats": {
    "total_students": 50,
    "assigned_students": 45,
    "unassigned_students": 5,
    "choice1_count": 25,
    "average_satisfaction": 5.2,
    "satisfaction_rate": 50.0
  }
}
```

### Étape 6: Consulter les résultats

```bash
GET /api/assignments/project/{project_id}
```

**Réponse:**
```json
[
  {
    "id": 1,
    "student_id": 101,
    "project_id": 1,
    "group_number": null,
    "preference_rank": 1,
    "satisfaction_score": 6.0,
    "destination_id": 5,
    "destination": {
      "university_name": "University of Edinburgh",
      "country": "UK",
      "city": "Edinburgh"
    }
  }
]
```

## Structure des tables

### Table `destinations`
```sql
CREATE TABLE destinations (
    id INTEGER PRIMARY KEY,
    project_id INTEGER NOT NULL,
    university_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    total_places INTEGER NOT NULL,
    available_places INTEGER NOT NULL,
    mobility_type VARCHAR(20) NOT NULL,
    accepted_filieres TEXT NOT NULL,
    min_english_level VARCHAR(10),
    min_toeic_score INTEGER,
    min_gpa FLOAT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

### Table `destination_preferences`
```sql
CREATE TABLE destination_preferences (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    destination_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 6),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE (student_id, project_id, rank),
    UNIQUE (student_id, project_id, destination_id)
);
```

## Dépendances ajoutées

```txt
numpy==1.26.2          # Calculs numériques
deap==1.4.1            # Framework d'algorithmes génétiques
```

## Fichiers créés/modifiés

### Nouveaux fichiers
- `app/models/destination.py` - Modèle Destination
- `app/models/destination_preference.py` - Modèle DestinationPreference
- `app/services/genetic_algorithm.py` - Service d'algorithme génétique
- `app/api/routes/destinations.py` - Routes API pour destinations
- `app/schemas/destination_schemas.py` - Schémas Pydantic

### Fichiers modifiés
- `app/models/student.py` - Ajout de toeic_score, classement, mobility_type
- `app/models/project.py` - Ajout de la relation destinations
- `app/api/routes/assignments.py` - Ajout du support exchange_program
- `backend/requirements.txt` - Ajout de numpy et deap
- `backend/init_db.py` - Ajout des nouvelles tables
- `backend/main.py` - Enregistrement des routes destinations

## Initialisation de la base de données

```bash
cd backend
python init_db.py
```

## Tests

### Tester avec des données de test

```python
# Créer des destinations
destinations = [
    {"university_name": "MIT", "country": "USA", "total_places": 5, ...},
    {"university_name": "Oxford", "country": "UK", "total_places": 8, ...},
    # ... autres destinations
]

# Créer des étudiants avec leurs paramètres
students = [
    {"email": "student1@example.com", "toeic_score": 850, "classement": "C1"},
    {"email": "student2@example.com", "toeic_score": 720, "classement": "C2"},
    # ... autres étudiants
]

# Soumettre les préférences de chaque étudiant
# Exécuter l'algorithme
# Vérifier les résultats
```

## Optimisation des paramètres

Pour ajuster les performances de l'algorithme:

- **Plus de diversité**: Augmenter `population_size` (50-100)
- **Meilleure convergence**: Augmenter `generations` (50-100)
- **Plus rapide**: Réduire les deux paramètres (20-30)

## Crédits

Algorithme original développé par:
- Mohamed AIDAOUI
- Hocine BOUROUIH

Adapté pour intégration SQLAlchemy/FastAPI.
