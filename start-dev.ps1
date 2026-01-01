# Happy Birthday Mate - Development Start Script (PowerShell)
# Starts both backend and frontend servers

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Starting Happy Birthday Mate..." -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "backend\venv")) {
    Write-Host "ERROR: Backend virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: cd backend; python -m venv venv; venv\Scripts\activate; pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "ERROR: Frontend dependencies not installed!" -ForegroundColor Red
    Write-Host "Please run: cd frontend; npm install" -ForegroundColor Yellow
    exit 1
}

# Start Backend in new window
Write-Host "Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; .\venv\Scripts\Activate.ps1; uvicorn main:app --reload" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Servers are starting!" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the servers." -ForegroundColor Gray
Write-Host ""

