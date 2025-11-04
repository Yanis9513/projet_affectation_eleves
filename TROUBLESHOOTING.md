# 🔧 Troubleshooting Guide

Common issues and their solutions when setting up the project.

## 🐍 Python / Backend Issues

### Issue: "Execution of scripts is disabled" (PowerShell)

**Error Message:**
```
Impossible de charger le fichier ... Activate.ps1, car l'exécution de scripts est désactivée sur ce système.
```

**Solution:**
Run this command before activating the virtual environment:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
```

Then activate normally:
```powershell
.\venv\Scripts\Activate.ps1
```

**Alternative Solutions:**

**Option A: Use Command Prompt instead of PowerShell**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
```

**Option B: Activate with full path**
```powershell
& "C:\Users\yanis\Pictures\Projet-multidisciplinaire-5-Web-App.-d-affectation-d-tudiants\backend\venv\Scripts\Activate.ps1"
```

**Option C: Change execution policy permanently (Admin PowerShell)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Issue: Python not found

**Error:** `python: command not found` or `'python' is not recognized`

**Solution:**
1. Install Python from https://python.org
2. During installation, **check "Add Python to PATH"**
3. Restart your terminal
4. Test with: `python --version`

**Alternative:**
Try `python3` instead of `python`:
```powershell
python3 -m venv venv
```

---

### Issue: pip install fails

**Error:** Various package installation errors

**Solutions:**

**Update pip first:**
```powershell
python -m pip install --upgrade pip
```

**If SQLAlchemy or psycopg2 fails:**
```powershell
# Use binary version
pip install psycopg2-binary
```

**If all packages fail:**
```powershell
# Install one by one
pip install fastapi
pip install uvicorn
pip install sqlalchemy
# etc...
```

---

### Issue: Port 8000 already in use

**Error:** `[ERROR] [Error 10048] Only one usage of each socket address...`

**Solution:**

**Find and kill the process:**
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Or use a different port:**
```powershell
uvicorn main:app --reload --port 8001
```

---

### Issue: Database errors

**Error:** Various SQLAlchemy or database connection errors

**Solution:**

**For SQLite (default):**
- Make sure `.env` file exists: `cp .env.example .env`
- Check `DATABASE_URL` in `.env`:
  ```
  DATABASE_URL=sqlite:///./student_assignment.db
  ```
- Delete the `.db` file and restart to recreate tables

**For PostgreSQL:**
- Make sure PostgreSQL is running
- Check connection string format:
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/dbname
  ```

---

### Issue: Module not found errors

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**This is the most common issue!** Here are the solutions:

**Solution 1: Use the setup script (Easiest)**
```powershell
cd backend
.\setup.ps1
```

**Solution 2: Manual installation**
```powershell
# Make sure you're in the backend folder
cd backend

# Deactivate if already activated
deactivate

# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Activate venv
.\venv\Scripts\Activate.ps1

# Verify you see (venv) in your prompt!

# Upgrade pip first
python -m pip install --upgrade pip

# Install packages one by one
pip install fastapi
pip install "uvicorn[standard]"
pip install sqlalchemy
pip install pydantic
pip install pydantic-settings
pip install python-multipart

# Verify installation
python -c "import fastapi; print('FastAPI installed successfully!')"
```

**Solution 3: Use requirements.txt**
```powershell
# With venv activated
pip install -r requirements.txt
```

**Solution 4: Recreate venv from scratch**
```powershell
# Remove old venv
Remove-Item -Recurse -Force venv

# Create new one
python -m venv venv

# Activate
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\venv\Scripts\Activate.ps1

# Install
pip install -r requirements.txt
```

**How to verify venv is active:**
- You should see `(venv)` at the start of your prompt
- Run: `Get-Command python | Select-Object -ExpandProperty Source`
- Should show path ending in `\backend\venv\Scripts\python.exe`

---

## 🌐 Node.js / Frontend Issues

### Issue: npm not found

**Error:** `'npm' is not recognized as an internal or external command`

**Solution:**
1. Install Node.js from https://nodejs.org
2. Choose LTS version (recommended)
3. Restart your terminal
4. Test with: `npm --version`

---

### Issue: npm install fails

**Error:** Various installation errors

**Solutions:**

**Clear npm cache:**
```powershell
npm cache clean --force
rm -Recurse -Force node_modules
rm package-lock.json
npm install
```

**Use different registry:**
```powershell
npm install --registry=https://registry.npmjs.org/
```

**Update npm:**
```powershell
npm install -g npm@latest
```

---

### Issue: Port 3000 already in use

**Error:** `Port 3000 is already in use`

**Solution:**

**Option 1: Kill the process**
```powershell
# Find process
netstat -ano | findstr :3000

# Kill it
taskkill /PID <PID> /F
```

**Option 2: Use different port**
Edit `vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 3001, // Change this
  }
})
```

---

### Issue: Vite errors or build fails

**Error:** Various Vite-related errors

**Solutions:**

**Clean install:**
```powershell
rm -Recurse -Force node_modules
rm -Recurse -Force dist
rm package-lock.json
npm install
```

**Update Vite:**
```powershell
npm install vite@latest
```

**Check Node.js version:**
```powershell
node --version  # Should be v18 or higher
```

---

### Issue: TailwindCSS not working

**Error:** Styles not applying, or `@tailwind` errors

**Solution:**

1. Make sure `tailwind.config.js` exists
2. Make sure `postcss.config.js` exists
3. Check `index.css` has:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
4. Restart the dev server: `npm run dev`

---

### Issue: React Router errors

**Error:** `useNavigate` or routing issues

**Solution:**

Make sure `react-router-dom` is installed:
```powershell
npm install react-router-dom
```

Check version compatibility:
```powershell
npm list react-router-dom
```

---

## 🔌 API / Integration Issues

### Issue: CORS errors in browser

**Error:** `Access to fetch at ... has been blocked by CORS policy`

**Solution:**

**Backend already configured, but check:**

In `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Make sure both servers are running!**

---

### Issue: API calls return 404

**Error:** `404 Not Found` when calling API

**Checklist:**
1. ✅ Is backend running? (http://localhost:8000)
2. ✅ Is the route defined in backend?
3. ✅ Check the URL in browser DevTools Network tab
4. ✅ Test directly in Swagger: http://localhost:8000/docs

**Common mistakes:**
- Missing `/api` prefix: Use `/api/students/` not `/students/`
- Wrong HTTP method: POST vs GET
- Backend not running

---

### Issue: Network errors

**Error:** `ERR_CONNECTION_REFUSED` or `Network Error`

**Solution:**

1. **Backend not running:** Start it with `uvicorn main:app --reload`
2. **Wrong port:** Check if backend is on 8000, frontend on 3000
3. **Firewall:** Allow both ports in Windows Firewall
4. **Check proxy:** In `vite.config.js`, proxy should point to backend

---

## 🗄️ Database Issues

### Issue: Tables not created

**Error:** `no such table: users` or similar

**Solution:**

Tables are auto-created when you start the backend. If not:

```powershell
# In Python console
python
>>> from app.database import engine, Base
>>> Base.metadata.create_all(bind=engine)
>>> exit()
```

Or delete the database file and restart:
```powershell
rm student_assignment.db
uvicorn main:app --reload
```

---

### Issue: Database locked

**Error:** `database is locked`

**Solution:**

SQLite is locked by another process:
1. Stop all backend servers
2. Close any database viewers
3. Restart the backend
4. Consider using PostgreSQL for production

---

## 🐳 Docker Issues

### Issue: Docker not found

**Error:** `'docker' is not recognized`

**Solution:**
Install Docker Desktop from https://docker.com

---

### Issue: Docker build fails

**Error:** Various build errors

**Solutions:**

**Clean and rebuild:**
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**Check Docker is running:**
- Look for Docker Desktop in system tray
- Should show a running whale icon

---

## 💻 General Issues

### Issue: Changes not reflecting

**Problem:** Code changes don't show up in browser/app

**Solution:**

**Frontend:**
1. Hard refresh browser: `Ctrl + Shift + R` or `Ctrl + F5`
2. Clear browser cache
3. Check terminal for errors
4. Restart dev server

**Backend:**
1. Check `--reload` flag is on: `uvicorn main:app --reload`
2. Check terminal for errors
3. Restart server
4. Test in `/docs` to isolate issue

---

### Issue: Terminal shows errors but app works

**Problem:** Lint errors or warnings in terminal

**Solution:**

**These are usually OK:**
- Import errors before packages are installed
- TODO comments marked as errors
- Unused variables in template code

**Ignore until you implement the features!**

---

### Issue: Can't find files or paths wrong

**Error:** File not found or path errors

**Solution:**

**Use absolute paths or navigate correctly:**
```powershell
# Wrong
cd backend
cd backend  # Error: already in backend

# Right
cd C:\Users\yanis\Pictures\Projet-multidisciplinaire-5-Web-App.-d-affectation-d-tudiants
cd backend
```

**Check current directory:**
```powershell
pwd  # Shows current location
ls   # Lists files in current directory
```

---

## 🆘 Still Stuck?

### Debug Checklist:

1. ✅ Read the error message carefully
2. ✅ Check if mentioned in this troubleshooting guide
3. ✅ Search the error on Google (copy-paste exact error)
4. ✅ Check terminal for more detailed errors
5. ✅ Try restarting the server/terminal
6. ✅ Check if all dependencies are installed

### Getting Help:

1. **Check Documentation:**
   - `GETTING_STARTED.md`
   - `PROJECT_SUMMARY.md`
   - `backend/README.md`
   - `frontend/README.md`

2. **Use API Docs:**
   - http://localhost:8000/docs
   - Test endpoints directly

3. **Check Browser Console:**
   - Press F12
   - Look at Console tab for errors
   - Look at Network tab for API calls

4. **Ask Your Team:**
   - Share the exact error message
   - Share what you tried
   - Share relevant code

---

## 📝 Tips to Avoid Issues

1. **Always activate venv** before working on backend
2. **Run both servers** when testing integration
3. **Save files** before testing changes
4. **Read error messages** fully before googling
5. **Check one thing at a time** when debugging
6. **Use version control** (git) to undo changes if needed

---

**Remember:** Most errors are common and easily fixed. Don't panic! 🚀
