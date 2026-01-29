# Quick Start Guide

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
