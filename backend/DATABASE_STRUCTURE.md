# 📊 Structure de la Base de Données

## Vue d'ensemble

Cette base de données gère un système d'affectation d'étudiants aux projets pour ESIEE Paris.

### Diagramme des Relations

```
┌─────────────┐
│    USERS    │ (Admin, Professeurs, Élèves)
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   (Validateur)
│ TEACHERS │   │ STUDENTS │
└────┬─────┘   └────┬─────┘
     │              │
     │              ├──────────────┬──────────────┐
     │              │              │              │
     ▼              ▼              ▼              ▼
┌──────────┐   ┌────────────────┐ │      ┌────────────────┐
│ PROJECTS │◄──┤ PREFERENCES    │ │      │ FORM_RESPONSES │
└────┬─────┘   └────────────────┘ │      └────────────────┘
     │                             │              ▲
     ├──────────────┬──────────────┤              │
     │              │              │              │
     ▼              ▼              ▼              │
┌────────────┐ ┌─────────────┐ ┌──────────────┐ │
│ASSIGNMENTS │ │FORM_QUESTIONS│─────────────────┘
└────────────┘ └─────────────┘
```

---

## 📋 Tables de la Base de Données

### 1. **USERS** (Utilisateurs)
Table principale pour tous les utilisateurs du système.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Clé primaire |
| `email` | STRING | Email unique |
| `username` | STRING | Nom d'utilisateur unique |
| `hashed_password` | STRING | Mot de passe hashé (bcrypt) |
| `first_name` | STRING | Prénom |
| `last_name` | STRING | Nom |
| `role` | ENUM | ADMIN, TEACHER, STUDENT |
| `is_active` | BOOLEAN | Compte actif? |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de mise à jour |

**Relations:**
- 1 → 1 avec `Student` (si role = STUDENT)
- 1 → 1 avec `Teacher` (si role = TEACHER)

---

### 2. **TEACHERS** (Professeurs)
Profil détaillé des professeurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Clé primaire |
| `user_id` | INTEGER | FK → users.id (CASCADE) |
| `department` | STRING | Département (ex: "Informatique") |
| `office` | STRING | Numéro de bureau |
| `phone` | STRING | Téléphone |
| `bio` | TEXT | Biographie courte |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de mise à jour |

**Relations:**
- 1 → N avec `Project` (un professeur crée plusieurs projets)

---

### 3. **STUDENTS** (Élèves)
Profil détaillé des élèves avec rang et compétences.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Clé primaire |
| `user_id` | INTEGER | FK → users.id (CASCADE) |
| `student_number` | STRING | Numéro étudiant unique (ex: "E2025001") |
| `filiere` | ENUM | Filière d'études |
| `english_level` | ENUM | Niveau d'anglais (A1-C2) |
| `general_rank` | INTEGER | Rang général dans la filière |
| `gpa` | FLOAT | Moyenne générale |
| `promotion` | STRING | Année de promotion (ex: "2025") |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de mise à jour |

**Enums:**
- **Filiere**: INFORMATIQUE, ELECTRONIQUE, ENERGIE, BIOTECHNOLOGIE, SYSTEMES_EMBARQUES, RESEAUX, AUTRE
- **EnglishLevel**: A1, A2, B1, B2, C1, C2

**Relations:**
- 1 → N avec `StudentPreference` (préférences de projets)
- 1 → N avec `Assignment` (affectations)
- 1 → N avec `StudentResponse` (réponses aux formulaires)

---

### 4. **PROJECTS** (Projets d'Affectation)
Projets créés par les professeurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Clé primaire |
| `teacher_id` | INTEGER | FK → teachers.id (CASCADE) |
| `title` | STRING | Titre du projet |
| `description` | TEXT | Description détaillée |
| `min_students` | INTEGER | Nombre min d'étudiants |
| `max_students` | INTEGER | Nombre max d'étudiants |
| `required_english_level` | ENUM | Niveau d'anglais requis |
| `target_filiere` | ENUM | Filière ciblée (optionnel) |
| `has_custom_form` | BOOLEAN | A un formulaire personnalisé? |
| `is_active` | BOOLEAN | Projet actif? |
| `is_open_for_preferences` | BOOLEAN | Ouvert aux préférences? |
| `deadline` | DATETIME | Date limite de soumission |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de mise à jour |

**Relations:**
- 1 → N avec `FormQuestion` (questions du formulaire)
- 1 → N avec `StudentPreference` (préférences des élèves)
- 1 → N avec `Assignment` (affectations finales)

---

### 5. **FORM_QUESTIONS** (Questions de Formulaire)
Questions personnalisées pour chaque projet.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Clé primaire |
| `project_id` | INTEGER | FK → projects.id (CASCADE) |
| `question_text` | TEXT | Texte de la question |
| `question_type` | ENUM | Type de question |
| `options` | TEXT | Options (JSON) pour choix multiples |
| `is_required` | BOOLEAN | Question obligatoire? |
| `order` | INTEGER | Ordre d'affichage |
| `scale_min` | INTEGER | Min pour échelle (ex: 1) |
| `scale_max` | INTEGER | Max pour échelle (ex: 10) |
| `created_at` | DATETIME | Date de création |

**Enums QuestionType:**
- `TEXT`: Réponse courte
- `TEXTAREA`: Réponse longue
- `MULTIPLE_CHOICE`: Choix unique
- `CHECKBOX`: Choix multiples
- `SCALE`: Échelle numérique (1-5, 1-10)
- `YES_NO`: Oui/Non

**Relations:**
- 1 → N avec `StudentResponse` (réponses des élèves)

---

### 6. **STUDENT_RESPONSES** (Réponses des Élèves)
Réponses des élèves aux formulaires des projets.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Clé primaire |
| `student_id` | INTEGER | FK → students.id (CASCADE) |
| `question_id` | INTEGER | FK → form_questions.id (CASCADE) |
| `response_text` | TEXT | Réponse texte (pour TEXT, TEXTAREA) |
| `response_value` | STRING | Réponse valeur (pour SCALE, YES_NO, etc.) |
| `submitted_at` | DATETIME | Date de soumission |

**Relations:**
- N → 1 avec `Student`
- N → 1 avec `FormQuestion`

---

### 7. **STUDENT_PREFERENCES** (Préférences des Élèves)
Classement des projets préférés par chaque élève.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Clé primaire |
| `student_id` | INTEGER | FK → students.id (CASCADE) |
| `project_id` | INTEGER | FK → projects.id (CASCADE) |
| `rank` | INTEGER | Rang de préférence (1 = premier choix) |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de mise à jour |

**Contraintes:**
- Un élève ne peut avoir qu'une préférence par projet
- Un élève ne peut donner le même rang à deux projets différents

**Relations:**
- N → 1 avec `Student`
- N → 1 avec `Project`

---

### 8. **ASSIGNMENTS** (Affectations)
Affectations finales des élèves aux projets (résultat de l'algorithme).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Clé primaire |
| `student_id` | INTEGER | FK → students.id (CASCADE) |
| `project_id` | INTEGER | FK → projects.id (CASCADE) |
| `preference_rank` | INTEGER | Rang obtenu (1 = premier choix) |
| `satisfaction_score` | FLOAT | Score de satisfaction (0-10) |
| `algorithm_score` | FLOAT | Score de l'algorithme génétique |
| `algorithm_run_id` | STRING | ID de l'exécution de l'algorithme |
| `is_validated` | BOOLEAN | Affectation validée? |
| `validated_by` | INTEGER | FK → users.id (qui a validé?) |
| `notes` | TEXT | Notes de l'admin/professeur |
| `assigned_at` | DATETIME | Date d'affectation |
| `validated_at` | DATETIME | Date de validation |
| `created_at` | DATETIME | Date de création |

**Contraintes:**
- **Un élève ne peut être affecté qu'à un seul projet**

**Relations:**
- N → 1 avec `Student`
- N → 1 avec `Project`

---

## 🔧 Initialisation de la Base de Données

### 1. Créer les tables

```bash
cd backend
python init_db.py
```

### 2. Peupler avec des données de test

```bash
python seed_db.py
```

Cela créera:
- 1 administrateur
- 3 professeurs
- 10 élèves
- 5 projets
- Formulaires pour 2 projets
- Préférences pour 3 élèves

### 3. Comptes de test créés

| Type | Email | Password |
|------|-------|----------|
| Admin | admin@esiee.fr | admin123 |
| Prof | prof.dupont@esiee.fr | prof123 |
| Prof | prof.martin@esiee.fr | prof123 |
| Prof | prof.bernard@esiee.fr | prof123 |
| Élève | alice.dubois@edu.esiee.fr | student123 |
| Élève | bob.leroy@edu.esiee.fr | student123 |
| ... | ... | student123 |

---

## 📈 Exemples de Requêtes

### Obtenir tous les projets d'un professeur
```python
teacher = db.query(Teacher).filter(Teacher.user_id == user_id).first()
projects = teacher.projects
```

### Obtenir les préférences d'un élève
```python
student = db.query(Student).filter(Student.user_id == user_id).first()
preferences = student.preferences.order_by(StudentPreference.rank).all()
```

### Obtenir les élèves affectés à un projet
```python
project = db.query(Project).filter(Project.id == project_id).first()
assignments = project.assignments
students = [assignment.student for assignment in assignments]
```

### Obtenir les questions d'un formulaire
```python
questions = db.query(FormQuestion).filter(
    FormQuestion.project_id == project_id
).order_by(FormQuestion.order).all()
```

---

## 🔐 Sécurité

- **Mots de passe**: Hashés avec bcrypt (jamais stockés en clair)
- **Cascade DELETE**: Suppression en cascade pour maintenir l'intégrité
- **Contraintes uniques**: Évitent les duplications
- **Foreign Keys**: Garantissent l'intégrité référentielle

---

## 🚀 Prochaines Étapes

1. ✅ Structure de la base créée
2. ✅ Scripts d'initialisation prêts
3. 🔄 Implémenter les routes API (CRUD)
4. 🔄 Ajouter l'authentification JWT
5. 🔄 Développer l'algorithme génétique d'affectation
6. 🔄 Connecter le frontend au backend

---

**Date de création:** 7 Novembre 2025  
**École:** ESIEE Paris
