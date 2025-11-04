# Backend - Student Assignment API

FastAPI backend for the student assignment web application.

## 🚀 Quick Start

### 1. Install Python Dependencies

```powershell
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```powershell
# Copy the example environment file
cp .env.example .env

# Edit .env with your configurations
```

### 3. Run the Development Server

```powershell
# Make sure you're in the backend directory with venv activated
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive Docs (Swagger): http://localhost:8000/docs
- Alternative Docs (ReDoc): http://localhost:8000/redoc

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── auth.py        # Authentication endpoints
│   │       ├── students.py    # Student management
│   │       ├── projects.py    # Project management
│   │       └── assignments.py # Assignment endpoints
│   ├── models/
│   │   ├── user.py           # User database model
│   │   ├── student.py        # Student database model
│   │   ├── project.py        # Project database model
│   │   └── assignment.py     # Assignment database model
│   ├── database.py           # Database configuration
│   └── config.py             # App configuration
├── main.py                   # FastAPI application entry point
├── requirements.txt          # Python dependencies
└── .env                      # Environment variables (create from .env.example)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Students
- `GET /api/students/` - Get all students
- `GET /api/students/{id}` - Get a specific student
- `POST /api/students/` - Create a new student
- `PUT /api/students/{id}` - Update a student
- `DELETE /api/students/{id}` - Delete a student

### Projects
- `GET /api/projects/` - Get all projects
- `GET /api/projects/{id}` - Get a specific project
- `POST /api/projects/` - Create a new project
- `PUT /api/projects/{id}` - Update a project
- `DELETE /api/projects/{id}` - Delete a project
- `POST /api/projects/{project_id}/preferences/{student_id}` - Add student preference

### Assignments
- `GET /api/assignments/` - Get all assignments
- `POST /api/assignments/run-algorithm` - Run the assignment algorithm
- `GET /api/assignments/stats` - Get assignment statistics
- `DELETE /api/assignments/` - Clear all assignments

## 💾 Database

By default, the application uses SQLite for development. The database file will be created automatically as `student_assignment.db`.

For production, configure PostgreSQL in your `.env` file:
```
DATABASE_URL=postgresql://user:password@localhost:5432/student_assignment
```

## 🧪 Testing

```powershell
# Run tests
pytest

# Run with coverage
pytest --cov=app
```

## 📝 Notes

- All TODO comments in the code indicate areas that need implementation
- The algorithm endpoint is a placeholder for the team working on the genetic algorithm
- Authentication is set up but needs full JWT implementation
- Database operations need to be fully implemented in each route
