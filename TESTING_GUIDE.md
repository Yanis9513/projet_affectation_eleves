# Backend API Testing Guide

## Testing the Group Project Flow

### 1. Start the Backend Server

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

The server should start at: `http://localhost:8000`

### 2. Test API Endpoints

#### Check API Documentation
Open in browser: `http://localhost:8000/docs`

#### Test 1: Create a Project

```powershell
# PowerShell command to create a project
$body = @{
    title = "Test Project - Java"
    description = "Test project for group formation"
    project_type = "group_project"
    group_size = 3
    partner_preference_enabled = $true
    students = @(
        @{
            name = "Jean Dupont"
            email = "jean.dupont@edu.esiee.fr"
            filiere = "INFORMATIQUE"
            rank = 1
            grade = 15.5
        },
        @{
            name = "Marie Martin"
            email = "marie.martin@edu.esiee.fr"
            filiere = "INFORMATIQUE"
            rank = 2
            grade = 14.8
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8000/api/projects/" -Method POST -Body $body -ContentType "application/json"
```

#### Test 2: Get All Projects

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/projects/" -Method GET
```

#### Test 3: Get Project by ID

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/projects/1" -Method GET
```

#### Test 4: Upload Students to Project

```powershell
$students = @{
    students = @(
        @{
            name = "Pierre Dubois"
            email = "pierre.dubois@edu.esiee.fr"
            filiere = "ELECTRONIQUE"
            rank = 3
            grade = 16.2
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8000/api/projects/1/upload-students" -Method POST -Body $students -ContentType "application/json"
```

#### Test 5: Get Students for Project

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/projects/1/students" -Method GET
```

#### Test 6: Submit Partner Preference

```powershell
$preference = @{
    project_id = 1
    preferred_partner_id = 2
    rank = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/preferences/students/1/partner-preference" -Method POST -Body $preference -ContentType "application/json"
```

### 3. Test with CSV File

Use the provided `test_students.csv` file:

```powershell
# Read CSV and create project with all students
$csv = Import-Csv backend\test_students.csv

$students = $csv | ForEach-Object {
    @{
        name = $_.name
        email = $_.email
        filiere = if ($_.filiere) { $_.filiere } else { $null }
        rank = if ($_.rank) { [int]$_.rank } else { $null }
        grade = if ($_.grade) { [double]$_.grade } else { $null }
    }
}

$body = @{
    title = "Projet Complet avec CSV"
    description = "Test avec tous les étudiants du CSV"
    project_type = "group_project"
    group_size = 4
    partner_preference_enabled = $true
    students = $students
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8000/api/projects/" -Method POST -Body $body -ContentType "application/json"
```

### 4. Check Database

```powershell
cd backend
python check_db.py
```

### 5. Common Issues

#### Issue: "Table not found"
**Solution:** Recreate the database
```powershell
cd backend
Remove-Item .\student_assignment.db -ErrorAction SilentlyContinue
python init_db.py
```

#### Issue: "CORS error in frontend"
**Solution:** Make sure backend CORS is configured for `http://localhost:5173`

Check `main.py`:
```python
allow_origins=["http://localhost:3000", "http://localhost:5173"]
```

#### Issue: "Connection refused"
**Solution:** Make sure backend is running:
```powershell
cd backend
python -m uvicorn main:app --reload
```

### 6. Frontend Testing

#### Start Frontend
```powershell
cd frontend
npm run dev
```

Open browser: `http://localhost:5173`

#### Test Flow:
1. Login as teacher (select "Enseignant")
2. Click "Create New Project"
3. Fill in project details
4. Upload CSV or manually add students
5. Configure group settings
6. Create project
7. Login as student
8. Go to form URL: `http://localhost:5173/form/1`
9. Select partner preference
10. Submit form

### 7. API Response Examples

#### Successful Project Creation:
```json
{
  "id": 1,
  "teacher_id": 1,
  "title": "Test Project",
  "project_type": "group_project",
  "group_size": 3,
  "partner_preference_enabled": true,
  "is_active": true,
  "created_at": "2025-12-11T10:30:00"
}
```

#### Successful Preference Submission:
```json
{
  "message": "Partner preference submitted successfully",
  "success": true
}
```

### 8. Database Schema Check

```powershell
cd backend
python -c "from app.models.project import Project, ProjectType; from app.models.preference import StudentPreference; print('Models loaded successfully')"
```

---

## Next Steps After Testing

1. ✅ Verify all endpoints work
2. ✅ Test with CSV file (24 students)
3. ✅ Test partner preference submission
4. 🔄 Implement authentication (get real student/teacher ID from JWT)
5. 🔄 Add email notification system
6. 🔄 Implement grouping algorithm
7. 🔄 Build English Leveling project type
8. 🔄 Build Exchange Program project type
