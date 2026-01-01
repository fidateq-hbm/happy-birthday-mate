@echo off
REM Happy Birthday Mate - Start Script (Windows)

REM Change to project root directory
cd /d "%~dp0.."
set PROJECT_ROOT=%CD%

echo Starting Happy Birthday Mate...
echo Project root: %PROJECT_ROOT%
echo.

REM Check if backend venv exists
if not exist "%PROJECT_ROOT%\backend\venv" (
    echo [ERROR] Backend virtual environment not found!
    echo Please run setup.bat first
    pause
    exit /b 1
)

REM Check if frontend node_modules exists
if not exist "%PROJECT_ROOT%\frontend\node_modules" (
    echo [ERROR] Frontend dependencies not installed!
    echo Please run setup.bat first
    pause
    exit /b 1
)

REM Start backend in new window
start "HBM Backend" cmd /k "cd /d %PROJECT_ROOT%\backend && venv\Scripts\activate && uvicorn main:app --reload"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "HBM Frontend" cmd /k "cd /d %PROJECT_ROOT%\frontend && npm run dev"

echo.
echo ====================================
echo Happy Birthday Mate is starting...
echo ====================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo ====================================
echo.
echo Press any key to stop all servers...
pause >nul

REM Kill all processes
taskkill /F /FI "WINDOWTITLE eq HBM*" >nul 2>&1
echo Servers stopped.

