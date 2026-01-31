# Intégration de l'Algorithme Génétique - Résumé Complet

## 📋 Vue d'ensemble

L'algorithme génétique de vos collègues (Mohamed AIDAOUI et Hocine BOUROUIH) a été intégré avec succès dans l'application pour gérer les affectations du type `exchange_program`. L'algorithme fonctionne maintenant avec la base de données SQLAlchemy au lieu des fichiers CSV.

## ✅ Modifications effectuées

### 1. Dépendances ajoutées (`requirements.txt`)

```txt
numpy==1.26.2          # Calculs numériques pour l'algorithme
deap==1.4.1            # Framework d'algorithmes génétiques (NSGA-II)
```

### 2. Nouveaux modèles de données

#### `app/models/destination.py` (67 lignes)
Représente une université partenaire pour les programmes d'échange.

**Champs principaux:**
- `university_name`, `country`, `city`
- `total_places`, `available_places` - Gestion de la capacité
- `mobility_type` - SEMESTER, FULL_YEAR, SHORT_TERM
- `accepted_filieres` - Filières acceptées (ex: "Informatique,Mathématiques")
- `min_toeic_score`, `min_english_level`, `min_gpa` - Critères d'éligibilité

**Méthodes:**
```python
has_available_places() -> bool
accepts_filiere(filiere: str) -> bool
```

#### `app/models/destination_preference.py` (32 lignes)
Représente les choix de destination d'un étudiant (classés de 1 à 6).

**Champs:**
- `student_id`, `destination_id`, `project_id`
- `rank` - De 1 (choix préféré) à 6 (dernier choix)

**Contraintes:**
- Rang entre 1 et 6
- Un seul choix par rang par étudiant
- Pas de doublons de destinations

#### Extensions du modèle `Student`
```python
toeic_score: int              # Score TOEIC (0-990)
classement: str               # Priorité: C1, C2 ou C3
mobility_type: str            # Type de mobilité souhaité
gpa: float                    # Moyenne générale
```

### 3. Service d'algorithme génétique

#### `app/services/genetic_algorithm.py` (311 lignes)

**Classe principale:** `GeneticAlgorithmService`

**Méthodes clés:**
```python
load_data()                                    # Charge étudiants et destinations depuis DB
setup_deap()                                   # Configure le framework DEAP
generate_valid_assignment() -> list            # Génère une solution initiale valide
evaluate_solution(individual) -> tuple         # Calcule fitness (satisfaction, pénalités)
mutate_individual(individual) -> tuple         # Opérateur de mutation
run_optimization(pop_size=40, gen=30) -> list  # Exécute l'algo génétique
save_assignments(solution)                     # Sauvegarde dans la table Assignment
execute(population_size=40, generations=30) -> dict  # Point d'entrée principal
```

**Configuration de l'algorithme:**
- **Méthode:** NSGA-II (Multi-objectif)
- **Population:** mu=40, lambda=80
- **Générations:** 30 par défaut
- **Croisement:** 60% (cxpb=0.6)
- **Mutation:** 30% (mutpb=0.3)

**Fitness (2 objectifs):**
1. **Maximiser satisfaction:** sum(7 - rank) pour chaque affectation
   - CHOIX1 = 6 points
   - CHOIX2 = 5 points
   - ...
   - CHOIX6 = 1 point

2. **Minimiser pénalités:**
   - Dépassement capacité: -100 pts/place excédentaire
   - Incompatibilité mobility_type: -50 pts
   - Filière non acceptée: -50 pts
   - TOEIC insuffisant: -30 pts
   - Non-affecté: -20 pts

**Tri des étudiants (priorité):**
1. Classement (C1 > C2 > C3)
2. Score TOEIC (décroissant)

### 4. Routes API

#### `app/api/routes/destinations.py` (210 lignes)

**Routes enseignants (CRUD destinations):**
```
POST   /api/destinations/{project_id}           # Créer destination
GET    /api/destinations/{project_id}           # Lister destinations
GET    /api/destinations/detail/{destination_id} # Détail destination
PUT    /api/destinations/{destination_id}       # Modifier destination
DELETE /api/destinations/{destination_id}       # Supprimer destination
```

**Routes étudiants (préférences):**
```
POST   /api/destinations/preferences            # Soumettre choix 1-6
GET    /api/destinations/preferences/{project_id} # Consulter mes choix
```

#### Modification de `app/api/routes/assignments.py`

Ajout de la logique conditionnelle dans `run_assignment_algorithm()`:

```python
if project.project_type == ProjectType.EXCHANGE_PROGRAM:
    # Utilise l'algorithme génétique
    ga_service = GeneticAlgorithmService(db, project_id)
    result = ga_service.execute(population_size, generations)
    
elif project.project_type == ProjectType.GROUP_PROJECT:
    # Utilise l'algorithme simple existant
    groups, stats = assign_students_to_groups(...)
```

#### Ajout de `require_teacher()` dans `app/api/routes/auth.py`
Fonction helper pour restreindre l'accès aux enseignants.

### 5. Schémas Pydantic

#### `app/schemas/destination_schemas.py`

```python
DestinationCreate              # Création de destination
DestinationUpdate              # Modification de destination
DestinationResponse            # Réponse avec ID et disponibilité
DestinationPreferenceCreate    # Un choix (destination + rang)
DestinationPreferenceResponse  # Choix avec relations
DestinationPreferencesSubmit   # Soumission complète (1-6 choix)
```

### 6. Initialisations

#### `init_db.py`
Ajout des imports `Destination` et `DestinationPreference` pour créer les tables.

#### `main.py`
Enregistrement du routeur destinations:
```python
app.include_router(destinations.router, prefix="/api", tags=["Destinations"])
```

### 7. Script de données de test

#### `backend/seed_exchange_program.py`

Crée automatiquement:
- 1 professeur: `prof.exchange@school.fr` / `teacher123`
- 1 projet d'échange actif
- 8 universités partenaires (Edinburgh, MIT, Munich, Toronto, Singapore, KTH, Milano, Tokyo)
- 15 étudiants avec scores TOEIC et classements variés
- Préférences aléatoires pour chaque étudiant

**Utilisation:**
```bash
cd backend
python seed_exchange_program.py
```

## 🚀 Utilisation

### Workflow complet

1. **Enseignant: Créer le projet**
```bash
POST /api/projects
{
  "title": "Programme d'échange 2024",
  "project_type": "exchange_program",
  "start_date": "2024-09-01",
  "end_date": "2025-06-30"
}
```

2. **Enseignant: Ajouter des destinations**
```bash
POST /api/destinations/{project_id}
{
  "university_name": "University of Edinburgh",
  "country": "UK",
  "city": "Edinburgh",
  "total_places": 10,
  "mobility_type": "SEMESTER",
  "accepted_filieres": "Informatique,Mathématiques",
  "min_toeic_score": 750,
  "min_gpa": 12.0
}
```

3. **Étudiant: Consulter les destinations**
```bash
GET /api/destinations/{project_id}
```

4. **Étudiant: Soumettre ses 6 choix**
```bash
POST /api/destinations/preferences
{
  "project_id": 1,
  "preferences": [
    {"destination_id": 5, "rank": 1},
    {"destination_id": 2, "rank": 2},
    {"destination_id": 8, "rank": 3},
    {"destination_id": 1, "rank": 4},
    {"destination_id": 3, "rank": 5},
    {"destination_id": 7, "rank": 6}
  ]
}
```

5. **Enseignant: Exécuter l'algorithme**
```bash
POST /api/assignments/run-algorithm
{
  "project_id": 1,
  "population_size": 40,  # Optionnel
  "generations": 30       # Optionnel
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

6. **Consulter les résultats**
```bash
GET /api/assignments/project/{project_id}
```

## 📦 Installation

```bash
cd backend

# Installer les nouvelles dépendances
pip install -r requirements.txt

# Initialiser la base de données
python init_db.py

# (Optionnel) Charger des données de test
python seed_exchange_program.py

# Lancer le serveur
uvicorn main:app --reload
```

## 🧪 Tests

### Test manuel via Swagger UI

1. Accéder à `http://localhost:8000/docs`
2. S'authentifier avec le compte test:
   - Email: `prof.exchange@school.fr`
   - Password: `teacher123`
3. Tester les routes destinations
4. Se connecter en tant qu'étudiant (`alice.martin@student.fr` / `student123`)
5. Soumettre des préférences
6. Revenir au compte enseignant et exécuter l'algorithme

### Vérifier les résultats

```bash
# Compter les affectations
GET /api/assignments/?project_id=1

# Statistiques
GET /api/assignments/stats?project_id=1
```

## 📂 Structure des fichiers créés/modifiés

```
backend/
├── requirements.txt                           # ✏️ Modifié (numpy, deap)
├── init_db.py                                # ✏️ Modifié (imports)
├── main.py                                   # ✏️ Modifié (router destinations)
├── seed_exchange_program.py                  # ✨ Nouveau
├── app/
│   ├── models/
│   │   ├── __init__.py                       # ✏️ Modifié (exports)
│   │   ├── student.py                        # ✏️ Modifié (toeic, classement)
│   │   ├── project.py                        # ✏️ Modifié (relation destinations)
│   │   ├── destination.py                    # ✨ Nouveau (67 lignes)
│   │   └── destination_preference.py         # ✨ Nouveau (32 lignes)
│   ├── schemas/
│   │   ├── __init__.py                       # ✨ Nouveau
│   │   └── destination_schemas.py            # ✨ Nouveau (65 lignes)
│   ├── services/
│   │   └── genetic_algorithm.py              # ✨ Nouveau (311 lignes)
│   └── api/
│       └── routes/
│           ├── auth.py                       # ✏️ Modifié (require_teacher)
│           ├── assignments.py                # ✏️ Modifié (exchange_program)
│           └── destinations.py               # ✨ Nouveau (210 lignes)

Documentation/
├── GENETIC_ALGORITHM_GUIDE.md                # ✨ Nouveau
└── GENETIC_ALGORITHM_INTEGRATION.md          # ✨ Nouveau (ce fichier)
```

**Total:**
- ✨ 7 nouveaux fichiers
- ✏️ 7 fichiers modifiés
- 📄 ~700 lignes de code ajoutées

## 🔧 Paramètres ajustables

Dans la requête `POST /api/assignments/run-algorithm`:

```json
{
  "project_id": 1,
  "population_size": 50,    // Plus de diversité (défaut: 40)
  "generations": 50         // Meilleure convergence (défaut: 30)
}
```

**Recommandations:**
- **Prototypage rapide:** `population_size=20, generations=15`
- **Production standard:** `population_size=40, generations=30` (défaut)
- **Optimisation poussée:** `population_size=80, generations=100`

## 🎯 Différences avec l'algorithme original

### Conservé:
✅ Algorithme génétique NSGA-II  
✅ Calcul de fitness (satisfaction vs pénalités)  
✅ Tri par classement (C1>C2>C3) puis TOEIC  
✅ Contraintes de capacité, filière, TOEIC  
✅ Système de choix 1-6  

### Adapté:
🔄 CSV → SQLAlchemy  
🔄 Standalone script → Service FastAPI  
🔄 Fichiers en entrée/sortie → API REST  
🔄 pandas DataFrame → SQLAlchemy Query  
🔄 Résultats CSV → Table Assignment  

## 📝 Prochaines étapes recommandées

1. **Frontend:**
   - Interface de gestion des destinations (enseignant)
   - Formulaire de sélection des 6 choix (étudiant)
   - Tableau de résultats avec filtres et exports

2. **Améliorations:**
   - Ajouter validation de compatibilité au moment de la soumission des préférences
   - Email de notification quand l'algorithme termine
   - Export Excel/PDF des résultats
   - Logs détaillés de l'exécution de l'algorithme

3. **Tests:**
   - Tests unitaires pour le service genetic_algorithm
   - Tests d'intégration pour les routes
   - Tests de charge (100+ étudiants, 20+ destinations)

## 👥 Crédits

**Algorithme original:**
- Mohamed AIDAOUI
- Hocine BOUROUIH

**Adaptation SQLAlchemy/FastAPI:**
- GitHub Copilot (Assistant AI)

## 📚 Ressources

- [Documentation DEAP](https://deap.readthedocs.io/)
- [NSGA-II Paper](https://ieeexplore.ieee.org/document/996017)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
