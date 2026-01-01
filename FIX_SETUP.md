# Fixing Setup Issues

## Issues Found

The setup script had path issues when run from the `scripts` directory. These have been fixed!

## Quick Fix - Run Setup Again

Since the frontend dependencies were installed successfully, you just need to:

### 1. Complete Backend Setup

```powershell
# Navigate to project root
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM"

# Go to backend
cd backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create .env file
Copy-Item env.template .env

# Go back to root
cd ..
```

### 2. Create Environment Files

```powershell
# From project root
Copy-Item backend\env.template backend\.env
Copy-Item frontend\env.local.template frontend\.env.local
```

### 3. Initialize Database

```powershell
# Make sure you're in project root
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM"

# Activate backend venv
cd backend
.\venv\Scripts\Activate.ps1

# Initialize database
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Seed database
cd ..
python database\seed_data.py
```

### 4. Update Configuration

Edit `backend\.env` and update:
- `DATABASE_URL` with your PostgreSQL credentials

Edit `frontend\.env.local` and add:
- Firebase configuration values

## Or Use Fixed Setup Script

The setup script has been fixed. You can run it again from anywhere:

```powershell
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM"
.\scripts\setup.bat
```

It will now:
- ✅ Find the project root automatically
- ✅ Use correct paths
- ✅ Copy template files correctly
- ✅ Activate virtual environment properly

## Start Servers

After setup is complete:

```powershell
# Option 1: Use the fixed start script
.\scripts\start.bat

# Option 2: Manual start
# Terminal 1 - Backend:
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload

# Terminal 2 - Frontend:
cd frontend
npm run dev
```

## Verify Everything Works

1. **Backend**: http://localhost:8000/docs (should show API docs)
2. **Frontend**: http://localhost:3000 (should show homepage)

If you see errors, check:
- PostgreSQL is running
- Database `happy_birthday_mate` exists
- `.env` files are configured correctly
- Virtual environment is activated

