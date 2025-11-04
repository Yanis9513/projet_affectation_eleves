# Quick Setup Script for Backend
# Run this if you encounter module import errors

Write-Host "=== Backend Setup Script ===" -ForegroundColor Green
Write-Host ""

# Check if in backend directory
if (-not (Test-Path "main.py")) {
    Write-Host "ERROR: Please run this script from the backend directory!" -ForegroundColor Red
    Write-Host "Run: cd backend" -ForegroundColor Yellow
    exit 1
}

# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "Virtual environment created!" -ForegroundColor Green
}

# Activate venv
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
& .\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install requirements
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install fastapi==0.104.1
pip install "uvicorn[standard]==0.24.0"
pip install sqlalchemy==2.0.23
pip install pydantic==2.5.0
pip install pydantic-settings==2.1.0
pip install python-multipart==0.0.6

# Verify installation
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Yellow
python -c "import fastapi; print('✓ FastAPI installed:', fastapi.__version__)"
python -c "import uvicorn; print('✓ Uvicorn installed:', uvicorn.__version__)"
python -c "import sqlalchemy; print('✓ SQLAlchemy installed:', sqlalchemy.__version__)"

# Create .env if doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "To start the server, run:" -ForegroundColor Cyan
Write-Host "  uvicorn main:app --reload" -ForegroundColor White
Write-Host ""
Write-Host "Then visit: http://localhost:8000/docs" -ForegroundColor Cyan
