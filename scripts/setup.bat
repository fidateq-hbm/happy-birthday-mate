@echo off
REM Happy Birthday Mate - Windows Setup Script

echo ====================================
echo Happy Birthday Mate - Setup
echo ====================================
echo.

REM Change to project root directory (go up from scripts folder)
cd /d "%~dp0.."
set PROJECT_ROOT=%CD%

echo Project root: %PROJECT_ROOT%
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] PostgreSQL not found in PATH
    echo Make sure PostgreSQL is installed and configured
)

echo [1/5] Setting up Backend...
cd "%PROJECT_ROOT%\backend"

REM Create virtual environment
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
echo Installing Python dependencies...
call venv\Scripts\activate
pip install -r requirements.txt

REM Create .env if it doesn't exist
if not exist .env (
    echo Creating backend .env file...
    if exist env.template (
        copy env.template .env >nul
        echo Created backend\.env from template
    ) else (
        echo WARNING: env.template not found. Please create .env manually.
    )
    echo Please edit backend\.env with your configuration
)

cd "%PROJECT_ROOT%"

echo.
echo [2/5] Setting up Frontend...
cd "%PROJECT_ROOT%\frontend"

REM Install npm dependencies
if not exist node_modules (
    echo Installing Node.js dependencies...
    call npm install
)

REM Create .env.local if it doesn't exist
if not exist .env.local (
    echo Creating frontend .env.local file...
    if exist env.local.template (
        copy env.local.template .env.local >nul
        echo Created frontend\.env.local from template
    ) else (
        echo WARNING: env.local.template not found. Please create .env.local manually.
    )
    echo Please edit frontend\.env.local with your Firebase configuration
)

cd "%PROJECT_ROOT%"

echo.
echo [3/5] Database Setup...
echo Please ensure PostgreSQL is running and you have created the database:
echo   CREATE DATABASE happy_birthday_mate;
echo.
pause

echo Initializing database tables...
cd "%PROJECT_ROOT%\backend"
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    echo Please ensure venv was created successfully
    pause
    exit /b 1
)
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

echo.
echo [4/5] Seeding database...
cd "%PROJECT_ROOT%"
python database\seed_data.py

echo.
echo [5/5] Setup Complete!
echo.
echo ====================================
echo Next Steps:
echo ====================================
echo 1. Edit backend\.env with your configuration
echo 2. Edit frontend\.env.local with Firebase config
echo 3. Add firebase-credentials.json to backend folder
echo.
echo To start the application:
echo   Backend:  cd backend ^&^& venv\Scripts\activate ^&^& uvicorn main:app --reload
echo   Frontend: cd frontend ^&^& npm run dev
echo.
echo Visit: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo ====================================
pause

