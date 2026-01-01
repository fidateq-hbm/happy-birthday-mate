# Happy Birthday Mate - Quick Start Guide

Get up and running in 5 minutes! 🚀

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ Python 3.11+ installed (`python --version` or `python3 --version`)
- ✅ PostgreSQL 14+ installed and running
- ✅ Git installed

## Step 1: Clone & Setup (2 minutes)

```bash
# Clone the repository (if from Git)
git clone <repository-url>
cd HBM

# Run automated setup
# Windows:
scripts\setup.bat

# Mac/Linux:
chmod +x scripts/setup.sh
./scripts/setup.sh
```

The setup script will:
- ✅ Create Python virtual environment
- ✅ Install all dependencies
- ✅ Create environment template files
- ✅ Initialize database
- ✅ Seed sample data

## Step 2: Configure Environment (2 minutes)

### Backend Configuration

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/happy_birthday_mate
SECRET_KEY=your-super-secret-key-minimum-32-characters-long-please
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend Configuration

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000

# Get these from Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
```

## Step 3: Firebase Setup (1 minute)

### Quick Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable **Authentication** → Email/Password + Google
4. Enable **Storage**
5. Get config from Project Settings → Your apps → Web app
6. Download Admin SDK JSON → Save as `backend/firebase-credentials.json`

### Storage Rules (Copy-paste)
In Firebase Console → Storage → Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_pictures/{userId}/{fileName} {
      allow read;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /birthday_walls/{wallId}/{fileName} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 4: Create Database (30 seconds)

```bash
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE happy_birthday_mate;

# Exit
\q
```

## Step 5: Start Application (30 seconds)

```bash
# Windows:
scripts\start.bat

# Mac/Linux:
./scripts/start.sh
```

This starts both backend and frontend automatically!

## Step 6: Test It Out! 🎉

1. **Open Browser**: http://localhost:3000
2. **Click "Start Celebrating"**
3. **Sign up** with email/password or Google
4. **Complete onboarding**:
   - Upload a profile picture
   - Enter your details (use a birthday soon to test tribe room!)
   - Accept terms
5. **View Dashboard** and explore features!

---

## Quick Links

- 🏠 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs
- 📊 API Health: http://localhost:8000/health

---

## Testing Tips

### Test Birthday Features (Without Waiting!)

1. **Create a user with today's birthday**:
   - During onboarding, set DOB to today's date (any year)
   - You'll be assigned to today's tribe
   - Birthday features will be immediately available!

2. **Create multiple test users**:
   - Use different email addresses
   - Set same birthday date
   - They'll all be in the same tribe!

3. **Test the Tribe Room**:
   - Login as a user with today's birthday
   - Click "Enter Birthday Tribe Room" on dashboard
   - Send messages from different accounts

4. **Test Birthday Wall**:
   - Click "Birthday Wall" on dashboard
   - Create a wall (opens 24h before birthday)
   - For testing, create wall with today's birthday
   - Share the link, upload photos!

### Sample Test Data

After running seed script, you have:
- ✅ 3 celebrities with birthdays
- ✅ 5 digital gifts in catalog

---

## Common Issues

### Port Already in Use
```bash
# Backend (8000)
# Windows: netstat -ano | findstr :8000
# Mac/Linux: lsof -ti:8000 | xargs kill -9

# Frontend (3000)
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
# Windows: services.msc → PostgreSQL service
# Mac: brew services list
# Linux: sudo systemctl status postgresql
```

### Firebase Error
- Double-check all Firebase config values
- Ensure firebase-credentials.json is in backend folder
- Verify Authentication and Storage are enabled

### Python Virtual Environment Issues
```bash
# Recreate venv
cd backend
rm -rf venv  # Windows: rmdir /s venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## Next Steps

Once everything is running:

1. **Explore the codebase**:
   - `frontend/src/app/` - All pages
   - `frontend/src/components/` - Reusable components
   - `backend/app/api/routes/` - API endpoints
   - `backend/app/models/` - Database models

2. **Read the docs**:
   - [SETUP.md](SETUP.md) - Detailed setup
   - [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture
   - [FEATURES.md](FEATURES.md) - Feature list

3. **Start developing**:
   - Make changes (files auto-reload)
   - Test features
   - Check API docs at http://localhost:8000/docs

---

## Production Deployment

When ready to deploy:

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
# Or connect GitHub repo for auto-deployment
```

### Backend (Railway/Heroku)
```bash
# Set all environment variables
# Connect PostgreSQL database
# Deploy via GitHub integration
```

### Don't forget:
- ✅ Update CORS origins
- ✅ Use production PostgreSQL
- ✅ Enable SSL for database
- ✅ Set secure SECRET_KEY
- ✅ Configure Stripe/PayPal keys

---

## Help & Support

**Stuck? Check these:**
1. Terminal output for error messages
2. Browser console (F12) for frontend errors
3. `http://localhost:8000/docs` for API testing
4. Database logs in PostgreSQL

**Still stuck?**
- Review [SETUP.md](SETUP.md) for troubleshooting
- Check environment variables are correct
- Ensure all services are running

---

## Congratulations! 🎉

You now have a fully functional birthday celebration platform running locally!

Start creating accounts, testing features, and building amazing birthday experiences.

**Happy Birthday Mate - Where no one celebrates alone!** ✨

---

*Setup time: ~5 minutes | Learning curve: Gentle | Fun factor: Maximum! 🎂*

