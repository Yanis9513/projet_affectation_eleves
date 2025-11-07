# 📐 MCD - Modèle Conceptuel de Données
## Système d'Affectation d'Étudiants - ESIEE Paris

---

## 🎨 Diagramme MCD Textuel

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MODÈLE CONCEPTUEL DE DONNÉES                   │
└─────────────────────────────────────────────────────────────────────────┘

                                    USERS
┌───────────────────────────────────────────────────────────────────────┐
│ • id (PK)                                                             │
│ • email (UNIQUE, NOT NULL)                                            │
│ • username (UNIQUE, NOT NULL)                                         │
│ • hashed_password (NOT NULL)                                          │
│ • first_name                                                          │
│ • last_name                                                           │
│ • role (ENUM: STUDENT, TEACHER, ADMIN)                               │
│ • is_active (BOOLEAN)                                                 │
│ • created_at (DATETIME)                                               │
│ • updated_at (DATETIME)                                               │
└────────┬──────────────────────────────────┬─────────────────┬─────────┘
         │ 1                                │ 1               │
         │                                  │                 │
         │ 1:1                              │ 1:1             │
         │                                  │                 │
         ▼ 1                                ▼ 1               │
                                                              │
┌─────────────────┐              ┌──────────────────┐        │
│    STUDENTS     │              │     TEACHERS     │        │
├─────────────────┤              ├──────────────────┤        │
│ • id (PK)       │              │ • id (PK)        │        │
│ • user_id (FK)  │              │ • user_id (FK)   │        │
│   [UNIQUE]      │              │   [UNIQUE]       │        │
│ • student_number│              │ • department     │        │
│   (UNIQUE)      │              │ • office         │        │
│ • filiere (ENUM)│              │ • phone          │        │
│ • english_level │              │ • bio            │        │
│   (ENUM)        │              │ • created_at     │        │
│ • general_rank  │              │ • updated_at     │        │
│ • gpa (FLOAT)   │              └────────┬─────────┘        │
│ • promotion     │                       │                   │
│ • created_at    │                       │ 1                 │
│ • updated_at    │                       │                   │
└────┬────────────┘                       │ 1:N               │
     │                                    │                   │
     │ 1                                  ▼ N                 │
     │                           ┌─────────────────┐          │
     │                           │    PROJECTS     │          │
     │                           ├─────────────────┤          │
     │                           │ • id (PK)       │          │
     │                           │ • teacher_id(FK)│          │
     │                           │ • title         │          │
     │                           │ • description   │          │
     │                           │ • min_students  │          │
     │                           │ • max_students  │          │
     │                           │ • required_     │          │
     │                           │   english_level │          │
     │                           │ • target_filiere│          │
     │                           │ • has_custom_   │          │
     │                           │   form (BOOL)   │          │
     │                           │ • is_active     │          │
     │                           │ • is_open_for_  │          │
     │                           │   preferences   │          │
     │                           │ • deadline      │          │
     │                           │ • created_at    │          │
     │                           │ • updated_at    │          │
     │                           └────┬────────────┘          │
     │                                │ 1                     │
     │                                │                       │
     │ 1:N                            │ 1:N                   │
     │                                │                       │
     ├────────────────────────────────┼───────────┐           │
     │                                │           │           │
     │                                │           │           │
     ▼ N                              ▼ N         ▼ N         │
┌──────────────────┐        ┌─────────────────┐  │           │
│STUDENT_PREFERENCES│        │  FORM_QUESTIONS │  │           │
├──────────────────┤        ├─────────────────┤  │           │
│ • id (PK)        │        │ • id (PK)       │  │           │
│ • student_id (FK)│        │ • project_id(FK)│  │           │
│ • project_id (FK)│        │ • question_text │  │           │
│ • rank (INT)     │        │ • question_type │  │           │
│   [1,2,3...]     │        │   (ENUM: TEXT,  │  │           │
│ • created_at     │        │    TEXTAREA,    │  │           │
│ • updated_at     │        │    MULTIPLE_    │  │           │
└────────┬─────────┘        │    CHOICE,      │  │           │
         │                  │    CHECKBOX,    │  │           │
         │                  │    SCALE,       │  │           │
         │                  │    YES_NO)      │  │           │
         │                  │ • options (JSON)│  │           │
         │                  │ • is_required   │  │           │
    UNIQUE(student_id,      │ • order         │  │           │
           project_id)      │ • scale_min     │  │           │
    UNIQUE(student_id,      │ • scale_max     │  │           │
           rank)            │ • created_at    │  │           │
                            └────────┬────────┘  │           │
         ┌──────────────────────────┘            │           │
         │ 1                                     │           │
         │                                       │           │
         │ 1:N                                   │ 1:N       │
         │                                       │           │
         ▼ N                                     ▼ N         │
┌──────────────────────┐                ┌───────────────┐   │
│  STUDENT_RESPONSES   │                │  ASSIGNMENTS  │   │
├──────────────────────┤                ├───────────────┤   │
│ • id (PK)            │                │ • id (PK)     │   │
│ • student_id (FK)────┼────────────────│ • student_id  │   │
│ • question_id (FK)   │                │   (FK) [UNQ]  │   │
│ • response_text      │                │ • project_id  │   │
│ • response_value     │                │   (FK)        │   │
│ • submitted_at       │                │ • preference_ │   │
└──────────────────────┘                │   rank        │   │
                                        │ • satisfaction│   │
                                        │   _score      │   │
                                        │ • algorithm_  │   │
                                        │   score       │   │
                                        │ • algorithm_  │   │
                                        │   run_id      │   │
                                        │ • is_validated│   │
                                        │ • validated_by├───┘
                                        │   (FK → users)│
                                        │ • validated_at│
                                        │ • notes       │
                                        │ • assigned_at │
                                        │ • created_at  │
                                        └───────────────┘
                                        UNIQUE(student_id)
```

---

## 📋 Légende des Cardinalités

```
1:1   = Relation un à un
1:N   = Relation un à plusieurs
N:N   = Relation plusieurs à plusieurs (via table de liaison)
```

---

## 🔗 Relations Détaillées

### 1. **USERS ↔ STUDENTS** (1:1)
- Un utilisateur avec role=STUDENT → Un profil étudiant
- `users.id` → `students.user_id` (UNIQUE)
- Cascade DELETE: Si user supprimé → student supprimé

### 2. **USERS ↔ TEACHERS** (1:1)
- Un utilisateur avec role=TEACHER → Un profil professeur
- `users.id` → `teachers.user_id` (UNIQUE)
- Cascade DELETE: Si user supprimé → teacher supprimé

### 3. **TEACHERS ↔ PROJECTS** (1:N)
- Un professeur peut créer plusieurs projets
- Un projet est créé par un seul professeur
- `teachers.id` → `projects.teacher_id`
- Cascade DELETE: Si teacher supprimé → ses projets supprimés

### 4. **STUDENTS ↔ STUDENT_PREFERENCES** (1:N)
- Un étudiant peut avoir plusieurs préférences (rang 1, 2, 3...)
- Une préférence appartient à un seul étudiant
- `students.id` → `student_preferences.student_id`
- Cascade DELETE: Si student supprimé → ses préférences supprimées

### 5. **PROJECTS ↔ STUDENT_PREFERENCES** (1:N)
- Un projet peut être choisi par plusieurs étudiants
- Une préférence concerne un seul projet
- `projects.id` → `student_preferences.project_id`
- Cascade DELETE: Si project supprimé → préférences associées supprimées

### 6. **PROJECTS ↔ FORM_QUESTIONS** (1:N)
- Un projet peut avoir plusieurs questions de formulaire
- Une question appartient à un seul projet
- `projects.id` → `form_questions.project_id`
- Cascade DELETE: Si project supprimé → ses questions supprimées

### 7. **STUDENTS ↔ STUDENT_RESPONSES** (1:N)
- Un étudiant peut répondre à plusieurs questions
- Une réponse appartient à un seul étudiant
- `students.id` → `student_responses.student_id`
- Cascade DELETE: Si student supprimé → ses réponses supprimées

### 8. **FORM_QUESTIONS ↔ STUDENT_RESPONSES** (1:N)
- Une question peut avoir plusieurs réponses (de différents étudiants)
- Une réponse concerne une seule question
- `form_questions.id` → `student_responses.question_id`
- Cascade DELETE: Si question supprimée → ses réponses supprimées

### 9. **STUDENTS ↔ ASSIGNMENTS** (1:N mais avec UNIQUE)
- Un étudiant peut avoir plusieurs affectations (historique)
- Mais **UNIQUE(student_id)** garantit qu'un étudiant n'a qu'une seule affectation active
- `students.id` → `assignments.student_id`
- Cascade DELETE: Si student supprimé → ses affectations supprimées

### 10. **PROJECTS ↔ ASSIGNMENTS** (1:N)
- Un projet peut avoir plusieurs étudiants affectés
- Une affectation concerne un seul projet
- `projects.id` → `assignments.project_id`
- Cascade DELETE: Si project supprimé → affectations associées supprimées

### 11. **USERS ↔ ASSIGNMENTS** (1:N) - Validation
- Un utilisateur (admin/prof) peut valider plusieurs affectations
- Une affectation peut être validée par un seul utilisateur
- `users.id` → `assignments.validated_by`
- NO CASCADE: Si validateur supprimé → validated_by devient NULL

---

## 🎯 Contraintes d'Intégrité

### Contraintes UNIQUE

```sql
-- USERS
UNIQUE(email)
UNIQUE(username)

-- STUDENTS
UNIQUE(user_id)          -- Un user = un seul profil student
UNIQUE(student_number)   -- Numéro étudiant unique

-- TEACHERS
UNIQUE(user_id)          -- Un user = un seul profil teacher

-- STUDENT_PREFERENCES
UNIQUE(student_id, project_id)  -- Un étudiant ne peut choisir un projet qu'une fois
UNIQUE(student_id, rank)        -- Un étudiant ne peut avoir qu'un seul projet à chaque rang

-- ASSIGNMENTS
UNIQUE(student_id)       -- Un étudiant ne peut être affecté qu'à un seul projet
```

### Contraintes CHECK (Logiques)

```sql
-- PROJECTS
CHECK(min_students >= 1)
CHECK(max_students >= min_students)

-- STUDENT_PREFERENCES
CHECK(rank >= 1)

-- ASSIGNMENTS
CHECK(satisfaction_score >= 0 AND satisfaction_score <= 10)
CHECK(preference_rank >= 1)
```

### Contraintes NOT NULL

```sql
-- USERS: email, username, hashed_password, role
-- STUDENTS: user_id, student_number, filiere, english_level
-- TEACHERS: user_id
-- PROJECTS: teacher_id, title, min_students, max_students
-- FORM_QUESTIONS: project_id, question_text, question_type
-- STUDENT_PREFERENCES: student_id, project_id, rank
-- ASSIGNMENTS: student_id, project_id
```

---

## 📊 Énumérations (ENUM)

### UserRole
```
- STUDENT
- TEACHER
- ADMIN
```

### Filiere
```
- INFORMATIQUE
- ELECTRONIQUE
- ENERGIE
- BIOTECHNOLOGIE
- SYSTEMES_EMBARQUES
- RESEAUX
- AUTRE
```

### EnglishLevel
```
- A1
- A2
- B1
- B2
- C1
- C2
```

### QuestionType
```
- TEXT          (Réponse courte)
- TEXTAREA      (Réponse longue)
- MULTIPLE_CHOICE (Choix unique)
- CHECKBOX      (Choix multiples)
- SCALE         (Échelle 1-10)
- YES_NO        (Oui/Non)
```

---

## 🔄 Flux de Données Typique

### 1. Inscription
```
User (STUDENT) créé → Student créé automatiquement (relation 1:1)
User (TEACHER) créé → Teacher créé automatiquement (relation 1:1)
```

### 2. Création de Projet
```
Teacher → crée Project
Project → has_custom_form = true
Project → FormQuestions créées
```

### 3. Soumission Préférences
```
Student → voit Projects actifs
Student → crée StudentPreferences (rank 1, 2, 3...)
Student → soumet StudentResponses aux formulaires
```

### 4. Algorithme d'Affectation
```
Algorithm → lit Students (rank, filiere, english_level)
Algorithm → lit StudentPreferences
Algorithm → lit Projects (contraintes)
Algorithm → génère Assignments
```

### 5. Validation
```
Admin/Teacher → consulte Assignments
Admin/Teacher → valide (is_validated = true)
Admin/Teacher → ajoute notes si besoin
```

---

## 📐 Diagramme ER (Entity-Relationship) Simplifié

```
    ┌─────────┐
    │  USERS  │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│STUDENT│ │TEACHER  │
└───┬───┘ └──┬──────┘
    │        │
    │     ┌──▼──────┐
    │     │ PROJECT │◄────┐
    │     └──┬──────┘     │
    │        │             │
    │     ┌──┴──────────┐  │
    │     │             │  │
    │  ┌──▼──────┐  ┌──▼──▼───────┐
    ├─►│PREFERENCE│  │FORM_QUESTION│
    │  └─────────┘  └──┬──────────┘
    │                  │
    │              ┌───▼──────────┐
    ├─────────────►│STUDENT_      │
    │              │RESPONSE      │
    │              └──────────────┘
    │
    │  ┌──────────┐
    └─►│ASSIGNMENT│
       └──────────┘
```

---

## 🗄️ Script SQL de Création (Simplifié)

```sql
-- USERS
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    role ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TEACHERS
CREATE TABLE teachers (
    id INTEGER PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    department VARCHAR,
    office VARCHAR,
    phone VARCHAR,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- STUDENTS
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    student_number VARCHAR UNIQUE NOT NULL,
    filiere ENUM('INFORMATIQUE', 'ELECTRONIQUE', ...) NOT NULL,
    english_level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL,
    general_rank INTEGER,
    gpa FLOAT,
    promotion VARCHAR,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PROJECTS
CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    teacher_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    min_students INTEGER DEFAULT 1,
    max_students INTEGER DEFAULT 5,
    required_english_level ENUM(...),
    target_filiere ENUM(...),
    has_custom_form BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_open_for_preferences BOOLEAN DEFAULT TRUE,
    deadline DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- FORM_QUESTIONS
CREATE TABLE form_questions (
    id INTEGER PRIMARY KEY,
    project_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('TEXT', 'TEXTAREA', ...) NOT NULL,
    options TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    order INTEGER DEFAULT 0,
    scale_min INTEGER,
    scale_max INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- STUDENT_PREFERENCES
CREATE TABLE student_preferences (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE(student_id, project_id),
    UNIQUE(student_id, rank)
);

-- STUDENT_RESPONSES
CREATE TABLE student_responses (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    response_text TEXT,
    response_value VARCHAR,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES form_questions(id) ON DELETE CASCADE
);

-- ASSIGNMENTS
CREATE TABLE assignments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    preference_rank INTEGER,
    satisfaction_score FLOAT,
    algorithm_score FLOAT,
    algorithm_run_id VARCHAR,
    is_validated BOOLEAN DEFAULT FALSE,
    validated_by INTEGER,
    validated_at DATETIME,
    notes TEXT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_by) REFERENCES users(id),
    UNIQUE(student_id)
);
```

---

## 📝 Résumé des Tables

| Table | Nombre de colonnes | Clés étrangères | Contraintes uniques |
|-------|-------------------|-----------------|---------------------|
| users | 10 | 0 | 2 (email, username) |
| teachers | 7 | 1 (user_id) | 1 (user_id) |
| students | 9 | 1 (user_id) | 2 (user_id, student_number) |
| projects | 13 | 1 (teacher_id) | 0 |
| form_questions | 10 | 1 (project_id) | 0 |
| student_responses | 6 | 2 (student_id, question_id) | 0 |
| student_preferences | 6 | 2 (student_id, project_id) | 2 |
| assignments | 13 | 3 (student_id, project_id, validated_by) | 1 (student_id) |

**Total: 8 tables**

---

## 🎯 Points Clés du Modèle

1. ✅ **Séparation User/Profil**: User générique, Students/Teachers spécialisés
2. ✅ **Cascade DELETE**: Intégrité référentielle garantie
3. ✅ **Contraintes métier**: Un étudiant = un projet (UNIQUE)
4. ✅ **Rangs ordonnés**: Préférences avec rangs consécutifs
5. ✅ **Validation workflow**: is_validated + validated_by
6. ✅ **Traçabilité**: algorithm_run_id pour grouper affectations
7. ✅ **Flexibilité**: Formulaires avec 6 types de questions
8. ✅ **Historique**: Timestamps created_at, updated_at partout

---

**Date de création**: 7 Novembre 2025
**École**: ESIEE Paris
