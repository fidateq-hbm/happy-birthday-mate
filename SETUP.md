# Happy Birthday Mate - Setup Guide

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL 14+ (for database)
- Firebase Account (for authentication & storage)
- Stripe Account (for payments)

## Quick Start

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb happy_birthday_mate

# Or using psql
psql -U postgres
CREATE DATABASE happy_birthday_mate;
\q
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL=postgresql://user:password@localhost:5432/happy_birthday_mate
# FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
# Add other configuration values

# Download Firebase Admin SDK credentials
# 1. Go to Firebase Console > Project Settings > Service Accounts
# 2. Click "Generate New Private Key"
# 3. Save as backend/firebase-credentials.json

# Initialize database
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Seed database with sample data
python ../database/seed_data.py

# Run the server
uvicorn main:app --reload
```

Backend will be available at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your Firebase config
# NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# ... (get these from Firebase Console)

# Run the development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password + Google)
4. Enable Storage

### 2. Get Configuration
**For Frontend (.env.local):**
- Go to Project Settings > General
- Scroll to "Your apps" > Web app
- Copy the configuration values

**For Backend (firebase-credentials.json):**
- Go to Project Settings > Service Accounts
- Click "Generate New Private Key"
- Save the JSON file

### 3. Storage Rules
In Firebase Console > Storage > Rules:
```
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

## Stripe Setup (Optional for V1)

1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard > Developers > API Keys
3. Add to backend .env:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Add publishable key to frontend .env.local:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

## Database Migrations

Using Alembic (already configured):

```bash
cd backend

# Create a migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/happy_birthday_mate
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
SECRET_KEY=your-secret-key-min-32-chars
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYSTACK_SECRET_KEY=sk_test_...
ALLOWED_ORIGINS=http://localhost:3000
OPENAI_API_KEY=sk-...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend (Manual Testing)
1. Start backend: `uvicorn main:app --reload`
2. Start frontend: `npm run dev`
3. Navigate to `http://localhost:3000`
4. Test user flows:
   - Sign up
   - Complete onboarding
   - View dashboard
   - Create birthday wall
   - Browse gifts

## Production Deployment

### Backend (Railway/Heroku/DigitalOcean)
- Set environment variables
- Use production PostgreSQL database
- Enable SSL for database connections

### Frontend (Vercel/Netlify)
- Connect GitHub repository
- Set environment variables
- Automatic deployments on push

### Database (Production)
- Use managed PostgreSQL (RDS, DigitalOcean, Supabase)
- Enable automated backups
- Set up monitoring

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL format
- Check user permissions

### Firebase Issues
- Verify API keys are correct
- Check Firebase Console for quota limits
- Ensure Storage rules are configured

### CORS Issues
- Add frontend URL to ALLOWED_ORIGINS in backend .env
- Check FastAPI CORS middleware configuration

## Support

For issues or questions:
- Check the documentation
- Review error logs in backend/frontend
- Ensure all environment variables are set correctly

Happy Building! 🎉

