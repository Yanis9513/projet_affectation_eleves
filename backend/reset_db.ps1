Write-Host "Reset Database Script" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "student_assignment.db")
{
    Write-Host "Deleting old database..." -ForegroundColor Yellow
    try
    {
        Remove-Item -Force "student_assignment.db"
        Write-Host "Database deleted" -ForegroundColor Green
    }
    catch
    {
        Write-Host "ERROR: Database is locked. Stop the backend server first." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Creating new database..." -ForegroundColor Cyan
& .\venv\Scripts\python.exe init_db.py

if ($LASTEXITCODE -ne 0)
{
    Write-Host "ERROR: Failed to create database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Seeding database..." -ForegroundColor Cyan
& .\venv\Scripts\python.exe seed_db.py

if ($LASTEXITCODE -ne 0)
{
    Write-Host "ERROR: Failed to seed database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "SUCCESS! Database is ready." -ForegroundColor Green
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Cyan
Write-Host "  Admin: admin@esiee.fr / admin123" -ForegroundColor White
Write-Host "  Teacher: prof.dupont@esiee.fr / prof123" -ForegroundColor White
Write-Host "  Student: alice.dubois@edu.esiee.fr / student123" -ForegroundColor White
Write-Host ""
