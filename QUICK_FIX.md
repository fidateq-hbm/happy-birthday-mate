# Quick Fix - Database Initialization

## The Problem
Python can't find the `app` module when running from the project root. You need to run commands from the `backend` directory.

## Solution - Run These Commands:

```powershell
# Navigate to backend directory
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\backend"

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Initialize database (run from backend directory)
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# If that works, seed the database (go back to project root first)
cd ..
python database\seed_data.py
```

## Alternative: Use PYTHONPATH

If you want to run from project root:

```powershell
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM"
$env:PYTHONPATH = "$PWD\backend"
cd backend
.\venv\Scripts\Activate.ps1
cd ..
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
python database\seed_data.py
```

## After Database Setup

1. **Update `backend\.env`** with your PostgreSQL password
2. **Update `frontend\.env.local`** with Firebase config
3. **Start servers** using the commands below

