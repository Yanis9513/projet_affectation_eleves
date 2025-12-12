# Quick Start Guide

## 🚀 Getting Started

### Backend Setup

```powershell
cd backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Start server
python -m uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`
API Docs at: `http://localhost:8000/docs`

### Frontend Setup

```powershell
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📋 Test the Group Project Flow

### 1. Start Both Servers

**Terminal 1 - Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### 2. Test Teacher Flow

1. Open browser: `http://localhost:5173`
2. Click "Commencer" (Start)
3. Select "Enseignant" (Teacher) role
4. Fill in teacher details and login
5. Click "➕ Créer un Nouveau Projet"
6. **Step 1:** Enter project info
   - Name: "Test Project Java"
   - Description: "Group project for Java development"
   - Type: "👥 Projet de Groupe"
7. **Step 2:** Upload CSV
   - Use the file: `backend/test_students.csv`
   - Or drag and drop the file
   - Review the 24 students imported
8. **Step 3:** Configure groups
   - Group size: 3
   - Partner preferences: ✅ Enabled
9. **Step 4:** Review and create
   - Check the summary
   - Click "Créer le Projet"
10. ✅ Success! Project created

### 3. Test Student Flow

1. Open new incognito window: `http://localhost:5173/form/1`
   - (Replace `1` with the actual project ID if different)
2. Select "Étudiant" (Student) role
3. Fill in student details and login
4. See project information displayed
5. Select a partner from dropdown (or choose "Aucune préférence")
6. Click "Soumettre mes Préférences"
7. ✅ Success! Preference submitted

---

## 🧪 Testing with Test CSV

The file `backend/test_students.csv` contains 24 students:
- 12 from E5FI (Informatique)
- 12 from E5SI (Systèmes d'Information)
- With realistic names, emails, ranks, and grades

Perfect for testing group formation with 8 groups of 3 students each!

---

## 🐛 Common Issues

### Backend won't start
```powershell
# Check if another process is using port 8000
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess

# Kill the process or use different port
python -m uvicorn main:app --reload --port 8001
```

### Frontend won't start
```powershell
# Check if port 5173 is in use
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess

# Or just use different port (Vite will ask)
```

### CORS errors
Make sure backend `main.py` has:
```python
allow_origins=["http://localhost:5173"]
```

### Database errors
```powershell
cd backend
Remove-Item .\student_assignment.db -ErrorAction SilentlyContinue
python init_db.py
```

---

## ✅ What's Working

- ✅ Teacher can create projects
- ✅ CSV upload with 24 students
- ✅ Student form displays correctly
- ✅ Partner selection dropdown
- ✅ Preference submission
- ✅ Data persists in database
- ✅ All API endpoints functional

## 🔜 What's Next

- 🔄 Add authentication (JWT tokens)
- 🔄 Get real student/teacher ID from session
- 🔄 Email notifications
- 🔄 Grouping algorithm implementation
- 🔄 Results display page
- 🔄 English Leveling project type
- 🔄 Exchange Program project type

---

## 📊 Database Check

```powershell
cd backend
python check_db.py
```

This shows all tables and their data.

---

## 🎉 Success Criteria

You know it's working when:
1. ✅ Teacher creates project → No errors
2. ✅ CSV with 24 students → All imported
3. ✅ Navigate to `/form/1` → Form loads
4. ✅ Select partner → Dropdown has all students
5. ✅ Submit → Success message
6. ✅ Check database → Preference saved

**Ready to build the algorithm!** 🚀
