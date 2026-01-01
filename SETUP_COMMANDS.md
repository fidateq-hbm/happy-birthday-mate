# Correct Setup Commands for PowerShell

## Step-by-Step Setup

### 1. Backend Setup (Already Done ✅)
You've already completed this! Dependencies are installed.

### 2. Create .env Files (Already Done ✅)
You've already created these!

### 3. Initialize Database (Fix This!)

**Run these commands from the backend directory:**

```powershell
# Make sure you're in backend directory
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\backend"

# Activate virtual environment (if not already activated)
.\venv\Scripts\Activate.ps1

# Initialize database tables
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Seed database (from project root, but with backend venv active)
cd ..
python database\seed_data.py
```

### 4. Update Configuration Files

**Edit `backend\.env`:**
```powershell
notepad backend\.env
```

Update the `DATABASE_URL` line with your PostgreSQL credentials:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/happy_birthday_mate
```

**Edit `frontend\.env.local`:**
```powershell
notepad frontend\.env.local
```

Add your Firebase configuration values.

### 5. Start Servers

**Option A: Use start script**
```powershell
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM"
.\scripts\start.bat
```

**Option B: Manual start**

**Terminal 1 - Backend:**
```powershell
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\backend"
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```powershell
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\frontend"
npm run dev
```

