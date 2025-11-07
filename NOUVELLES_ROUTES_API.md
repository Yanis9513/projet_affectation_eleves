# ✅ Routes API Ajoutées - Système d'Affectation d'Étudiants

## Date: 7 Novembre 2025

---

## 🎉 NOUVELLES ROUTES API CRÉÉES

### 1. **Routes Professeurs** (`/api/teachers`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/teachers/` | Liste de tous les professeurs |
| GET | `/api/teachers/{teacher_id}` | Profil d'un professeur avec infos utilisateur |
| PUT | `/api/teachers/{teacher_id}` | Modifier le profil d'un professeur |
| GET | `/api/teachers/{teacher_id}/projects` | Tous les projets d'un professeur |

**Fichier**: `backend/app/api/routes/teachers.py` ✅

---

### 2. **Routes Formulaires** (`/api/forms`)

#### Questions de Formulaire

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/forms/projects/{project_id}/forms` | Créer une question de formulaire |
| GET | `/api/forms/projects/{project_id}/forms` | Récupérer toutes les questions d'un projet |
| PUT | `/api/forms/projects/{project_id}/forms/{question_id}` | Modifier une question |
| DELETE | `/api/forms/projects/{project_id}/forms/{question_id}` | Supprimer une question |

#### Réponses aux Formulaires

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/forms/students/{student_id}/responses` | Soumettre réponses (création/modification) |
| GET | `/api/forms/students/{student_id}/responses` | Récupérer réponses d'un étudiant |
| GET | `/api/forms/projects/{project_id}/responses` | Voir toutes les réponses d'un projet (prof) |

**Types de questions supportés**:
- ✅ TEXT (texte court)
- ✅ TEXTAREA (texte long)
- ✅ MULTIPLE_CHOICE (choix unique)
- ✅ CHECKBOX (choix multiples)
- ✅ SCALE (échelle 1-5, 1-10)
- ✅ YES_NO (oui/non)

**Fichier**: `backend/app/api/routes/forms.py` ✅

---

### 3. **Routes Préférences** (`/api/preferences`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/preferences/students/{student_id}/preferences` | Créer préférences (en masse) |
| GET | `/api/preferences/students/{student_id}/preferences` | Récupérer préférences d'un étudiant |
| PUT | `/api/preferences/students/{student_id}/preferences` | Modifier préférences (remplace tout) |
| DELETE | `/api/preferences/students/{student_id}/preferences` | Supprimer toutes les préférences |
| GET | `/api/preferences/projects/{project_id}/preferences` | Voir préférences pour un projet (prof) |
| GET | `/api/preferences/stats` | Statistiques globales sur les préférences |

**Validations**:
- ✅ Rangs uniques (1, 2, 3, ...)
- ✅ Rangs consécutifs à partir de 1
- ✅ Un projet par préférence
- ✅ Vérification deadline projet
- ✅ Vérification projet actif

**Fichier**: `backend/app/api/routes/preferences.py` ✅

---

## 📦 STRUCTURE DES DONNÉES

### Exemple: Créer des Questions de Formulaire

**POST** `/api/forms/projects/1/forms`

```json
{
  "question_text": "Pourquoi souhaitez-vous rejoindre ce projet ?",
  "question_type": "textarea",
  "is_required": true,
  "order": 1
}
```

**Réponse:**
```json
{
  "id": 1,
  "project_id": 1,
  "question_text": "Pourquoi souhaitez-vous rejoindre ce projet ?",
  "question_type": "textarea",
  "options": null,
  "is_required": true,
  "order": 1,
  "scale_min": null,
  "scale_max": null,
  "created_at": "2025-11-07T10:30:00"
}
```

---

### Exemple: Soumettre des Préférences

**POST** `/api/preferences/students/1/preferences`

```json
{
  "preferences": [
    { "project_id": 5, "rank": 1 },
    { "project_id": 2, "rank": 2 },
    { "project_id": 7, "rank": 3 }
  ]
}
```

**Réponse:**
```json
[
  {
    "id": 1,
    "student_id": 1,
    "project_id": 5,
    "rank": 1,
    "created_at": "2025-11-07T10:35:00",
    "updated_at": "2025-11-07T10:35:00"
  },
  {
    "id": 2,
    "student_id": 1,
    "project_id": 2,
    "rank": 2,
    "created_at": "2025-11-07T10:35:00",
    "updated_at": "2025-11-07T10:35:00"
  },
  {
    "id": 3,
    "student_id": 1,
    "project_id": 7,
    "rank": 3,
    "created_at": "2025-11-07T10:35:00",
    "updated_at": "2025-11-07T10:35:00"
  }
]
```

---

### Exemple: Soumettre Réponses au Formulaire

**POST** `/api/forms/students/1/responses`

```json
[
  {
    "question_id": 1,
    "response_text": "Je suis passionné par l'IA et j'ai déjà réalisé plusieurs projets personnels dans ce domaine."
  },
  {
    "question_id": 2,
    "response_value": "Oui"
  },
  {
    "question_id": 3,
    "response_value": "8"
  }
]
```

---

### Exemple: Voir Préférences d'un Projet (Vue Professeur)

**GET** `/api/preferences/projects/1/preferences`

**Réponse:**
```json
{
  "project_id": 1,
  "project_title": "Application Mobile IA",
  "total_preferences": 15,
  "by_rank": {
    "rank_1": [
      {
        "student_id": 5,
        "student_number": "E12345",
        "student_name": "Marie Dupont",
        "filiere": "Informatique",
        "english_level": "B2",
        "general_rank": 12
      },
      {
        "student_id": 8,
        "student_number": "E12348",
        "student_name": "Pierre Martin",
        "filiere": "Informatique",
        "english_level": "C1",
        "general_rank": 5
      }
    ],
    "rank_2": [
      {
        "student_id": 3,
        "student_number": "E12343",
        "student_name": "Sophie Bernard",
        "filiere": "Informatique",
        "english_level": "B1",
        "general_rank": 25
      }
    ],
    "rank_3": [
      // ...
    ]
  }
}
```

---

### Exemple: Statistiques Globales

**GET** `/api/preferences/stats`

**Réponse:**
```json
{
  "total_students": 120,
  "students_with_preferences": 95,
  "students_without_preferences": 25,
  "completion_rate": 79.17,
  "total_active_projects": 25,
  "total_preferences_submitted": 285,
  "avg_preferences_per_student": 3.0
}
```

---

## 🔧 MISE À JOUR DU MAIN.PY

Le fichier `backend/main.py` a été mis à jour pour inclure les nouvelles routes :

```python
from app.api.routes import auth, students, projects, assignments, teachers, forms, preferences

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(teachers.router, prefix="/api/teachers", tags=["Teachers"])  # ✨ NOUVEAU
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(forms.router, prefix="/api/forms", tags=["Forms"])  # ✨ NOUVEAU
app.include_router(preferences.router, prefix="/api/preferences", tags=["Preferences"])  # ✨ NOUVEAU
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])
```

---

## 📚 DOCUMENTATION API

Accéder à la documentation interactive :
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Toutes les nouvelles routes sont automatiquement documentées avec :
- ✅ Descriptions
- ✅ Schémas de requête/réponse
- ✅ Codes de statut HTTP
- ✅ Exemples

---

## ✅ FONCTIONNALITÉS CLÉS

### Routes Formulaires
1. **Création dynamique**: Professeurs créent formulaires personnalisés
2. **Types variés**: 6 types de questions différents
3. **Validation**: Champs requis, ordre, options
4. **Auto-update**: `has_custom_form` du projet mis à jour automatiquement
5. **Édition/suppression**: Modification et suppression de questions
6. **Réponses groupées**: Soumettre plusieurs réponses à la fois
7. **Mise à jour**: Si réponse existe déjà, elle est mise à jour
8. **Vue professeur**: Voir toutes les réponses groupées par étudiant

### Routes Préférences
1. **Soumission en masse**: Soumettre toutes les préférences d'un coup
2. **Validations strictes**:
   - Rangs uniques et consécutifs
   - Projets uniques
   - Vérification deadline
   - Vérification statut projet
3. **Remplacement total**: Modification remplace toutes les préférences
4. **Vue enrichie**: Infos projets incluses dans GET
5. **Vue professeur**: Voir qui a choisi le projet et à quel rang
6. **Statistiques**: Dashboard global de complétion

### Routes Professeurs
1. **Liste complète**: Tous les professeurs avec pagination
2. **Profil détaillé**: Infos utilisateur incluses
3. **Modification**: Mise à jour department, office, bio, etc.
4. **Projets**: Liste de tous les projets d'un prof

---

## 🧪 TESTER LES ROUTES

### 1. Démarrer le serveur
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

### 2. Tester avec cURL

**Créer une question de formulaire:**
```powershell
curl -X POST "http://localhost:8000/api/forms/projects/1/forms" `
  -H "Content-Type: application/json" `
  -d '{
    "question_text": "Quelle est votre motivation ?",
    "question_type": "textarea",
    "is_required": true,
    "order": 1
  }'
```

**Soumettre des préférences:**
```powershell
curl -X POST "http://localhost:8000/api/preferences/students/1/preferences" `
  -H "Content-Type: application/json" `
  -d '{
    "preferences": [
      {"project_id": 1, "rank": 1},
      {"project_id": 2, "rank": 2},
      {"project_id": 3, "rank": 3}
    ]
  }'
```

### 3. Tester avec Swagger UI
Ouvrir http://localhost:8000/docs et tester interactivement !

---

## 📝 PROCHAINES ÉTAPES

### Routes restantes à créer:
- [ ] Routes Admin (`/api/admin`)
- [ ] Routes Algorithme (`/api/algorithm`)
- [ ] Authentification JWT complète
- [ ] Hash des mots de passe
- [ ] Email notifications

### Frontend à connecter:
- [ ] FormBuilder (professeur)
- [ ] FormViewer (étudiant)
- [ ] PreferencesSorter (étudiant)
- [ ] ProjectPreferences (professeur)

---

## 🎯 RÉSUMÉ

**3 nouveaux fichiers de routes créés:**
1. ✅ `teachers.py` - 4 endpoints
2. ✅ `forms.py` - 7 endpoints
3. ✅ `preferences.py` - 6 endpoints

**Total: 17 nouveaux endpoints API** 🚀

**Fonctionnalités couvertes:**
- ✅ Gestion professeurs
- ✅ Formulaires personnalisés complets
- ✅ Préférences étudiants avec validations
- ✅ Vues pour professeurs
- ✅ Statistiques

Le backend est maintenant **beaucoup plus complet** et prêt pour connecter le frontend ! 🎉
