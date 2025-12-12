# 🚀 Quick Start Guide - Student Assignment System

Welcome! This guide will help you get started with the project quickly.

## ✅ What You Have Now

I've set up a complete project structure with:

### Backend (FastAPI + Python)
- ✅ API structure with routes for auth, students, projects, and assignments
- ✅ Database models (User, Student, Project, Assignment)
- ✅ SQLAlchemy ORM configuration
- ✅ Environment configuration
- ✅ Ready-to-use API endpoints (with TODOs for implementation)

### Frontend (React + Vite + TailwindCSS)
- ✅ Modern React setup with routing
- ✅ Beautiful, responsive UI with TailwindCSS
- ✅ 7 complete pages (Home, Login, Dashboards, Projects, Preferences, Assignments)
- ✅ Reusable components and layouts
- ✅ API proxy configuration

## 🏃 Running the Project

### Step 1: Install Backend Dependencies

**Using PowerShell (Recommended):**
```powershell
cd backend
python -m venv venv

# ⚠️ IMPORTANT: If you get "execution of scripts is disabled" error:
# Run this command first (it's safe, only affects current session):
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Now activate the virtual environment
.\venv\Scripts\Activate.ps1

# You should see (venv) at the start of your prompt
# Install dependencies
pip install -r requirements.txt
```

**Using Git Bash / WSL / Linux:**
```bash
cd backend
python -m venv venv

# Activate using bash script
source venv/Scripts/activate
# OR
. venv/Scripts/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Start Backend Server

**Using PowerShell:**
```powershell
# ⚠️ IMPORTANT: Make sure you're in the backend folder!
cd backend

# Activate venv (if not already activated)
.\venv\Scripts\Activate.ps1

# Start the server
uvicorn main:app --reload
```

**Using Git Bash / WSL:**
```bash
cd backend

# Activate venv
source venv/Scripts/activate

# Start the server
uvicorn main:app --reload
```

**Quick Command (Without Activation):**
```bash
cd backend
./venv/Scripts/python -m uvicorn main:app --reload
```

✅ Backend running at http://localhost:8000
📚 API Docs at http://localhost:8000/docs

### Step 3: Install Frontend Dependencies

```powershell
# Open new terminal
cd frontend
npm install
```

### Step 4: Start Frontend Server

```powershell
# In frontend folder
npm run dev
```

✅ Frontend running at http://localhost:3000

## 📁 Project Structure

```
your-project/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # API endpoints
│   │   │   ├── auth.py        # Login, register
│   │   │   ├── students.py    # Student management
│   │   │   ├── projects.py    # Project management
│   │   │   └── assignments.py # Assignment algorithm
│   │   ├── models/            # Database models
│   │   ├── database.py        # DB connection
│   │   └── config.py          # Configuration
│   ├── main.py                # FastAPI app
│   └── requirements.txt       # Python packages
│
└── frontend/
    ├── src/
    │   ├── pages/             # All pages
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   ├── TeacherDashboard.jsx
    │   │   ├── ProjectsPage.jsx
    │   │   ├── PreferencesPage.jsx
    │   │   └── AssignmentsPage.jsx
    │   ├── components/        # Reusable components
    │   │   └── Layout.jsx     # Main layout
    │   ├── App.jsx            # Main app with routing
    │   └── index.css          # Tailwind styles
    └── package.json           # Node packages
```

## 🎨 What You Can Do Now

### 1. Design & UI Work
- ✅ All pages are created with TailwindCSS
- ✅ You can modify colors in `frontend/tailwind.config.js`
- ✅ Edit any page in `frontend/src/pages/`
- ✅ Use custom classes: `.btn-primary`, `.card`, `.input-field`

### 2. Backend Development
- The API structure is ready
- Each route has TODOs showing what needs implementation
- Database models are defined
- You can test APIs at http://localhost:8000/docs

### 3. Next Steps
1. **Start with UI** - Customize the design and colors
2. **Implement Backend** - Fill in the TODO sections in routes
3. **Connect Frontend to Backend** - Replace simulated data with real API calls
4. **Add Algorithm** - Your teammates will implement the genetic algorithm

## 🔧 Learning Resources

### For Web Development Beginners:

**Frontend (React):**
- React components are in `.jsx` files
- Each page is a separate component
- Use `useState` for managing data
- Use `useEffect` for loading data when page loads

**Backend (FastAPI):**
- Routes are Python functions with `@router.get()` or `@router.post()`
- Database operations use SQLAlchemy
- FastAPI auto-generates API documentation

**TailwindCSS:**
- Use utility classes like `bg-blue-500`, `text-white`, `p-4`
- Custom classes defined in `src/index.css`
## 🐛 Common Issues

**"syntax error near unexpected token" when running Activate.ps1:**
- You're using Git Bash/WSL instead of PowerShell
- Solution: Use `source venv/Scripts/activate` instead
- OR: Open Windows PowerShell and use `.\venv\Scripts\Activate.ps1`

**Backend won't start:**
- Make sure venv is activated:
  - PowerShell: `.\venv\Scripts\Activate.ps1`
  - Git Bash: `source venv/Scripts/activate`
- Install dependencies: `pip install -r requirements.txt`
- `backend/.env` - Backend settings (database, secrets)
- `frontend/vite.config.js` - Frontend settings
- `frontend/tailwind.config.js` - Design system (colors, etc.)

**Entry Points:**
- `backend/main.py` - Backend starts here
- `frontend/src/main.jsx` - Frontend starts here
- `frontend/src/App.jsx` - Routing configuration

## 🐛 Common Issues

**Backend won't start:**
- Make sure venv is activated: `.\venv\Scripts\Activate.ps1`
- Install dependencies: `pip install -r requirements.txt`

**Frontend won't start:**
- Delete `node_modules` and run `npm install` again
- Make sure you're in the `frontend` folder

**CSS not working:**
- TailwindCSS errors are normal in VSCode
- The styles will work when you run the app

## 💡 Tips for Getting Started

1. **Don't worry about the errors** - The TODO comments and import errors are normal. They'll go away as you implement features.

2. **Start simple** - Begin by customizing colors and text, then move to functionality.

3. **Use the docs** - Visit http://localhost:8000/docs to see all API endpoints and test them.

4. **Learn by doing** - Modify a page, save it, and see the changes instantly!

5. **Work in parallel** - Frontend and backend can be developed separately.

## 🎯 Your Focus Areas

Since you mentioned **you're not working on the algorithm**, focus on:

✅ **Design & UI** - Make the app look beautiful
✅ **Frontend Pages** - Improve the user experience
✅ **Backend API** - Implement CRUD operations
✅ **Database** - Store and retrieve data

Your teammates will handle the genetic algorithm part.

## 📞 Need Help?

- Check `backend/README.md` for backend details
- Check `frontend/README.md` for frontend details
- Visit http://localhost:8000/docs for API documentation
- The "to do" file has your complete project requirements

---

**You're all set! Start by running both servers and exploring the app.** 🚀
