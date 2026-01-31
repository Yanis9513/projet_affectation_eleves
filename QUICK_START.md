# Quick Start Guide

## Prerequisites

### MailHog (Email Service)
You need MailHog to intercept and display emails locally. Choose one of these options:

**Option 1: Download executable (easiest)**
- Download from: https://github.com/mailhog/MailHog/releases
- Download the `.exe` file for Windows
- Double-click to run

**Option 2: Using Docker**
- Install Docker: https://www.docker.com/products/docker-desktop
- Run: `docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog`

---

## Start Services in Order

### 1. Start MailHog (Email Service) - **FIRST**

MailHog is a local email service that intercepts all emails sent by the backend and displays them in a web inbox.

**If using .exe:**
- Double-click the `MailHog.exe` file you downloaded

**If using Docker:**
```powershell
docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

MailHog Inbox: `http://localhost:8025`

---

### 2. Backend Setup

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

Frontend runs at: `http://localhost:3000`

---
