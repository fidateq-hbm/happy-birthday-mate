# Railway Deployment Guide

## Quick Setup

1. **Create PostgreSQL Database** in Railway
2. **Create Backend Service** from GitHub repo
3. **Set Environment Variables** (see below)
4. **Upload Firebase Credentials** (see below)
5. **Run Migrations** (see below)

## Environment Variables

Copy these to Railway → Your Service → Variables:

```bash
DATABASE_URL=<from-postgresql-service>
SECRET_KEY=<generate-random-32-char-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
ALLOWED_ORIGINS=https://happybirthdaymate.com,https://www.happybirthdaymate.com
GEMINI_API_KEY=<your-gemini-api-key>
```

## Firebase Credentials Setup

### Option 1: Upload File via Railway Shell

1. Go to Railway → Your Service → Deployments → Shell
2. Run:
   ```bash
   cd backend
   nano firebase-credentials.json
   ```
3. Paste your Firebase service account JSON
4. Save (Ctrl+X, Y, Enter)

### Option 2: Use Environment Variable

1. Base64 encode your `firebase-credentials.json`:
   ```bash
   # PowerShell:
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("firebase-credentials.json"))
   ```
2. Add to Railway variables:
   ```bash
   FIREBASE_CREDENTIALS_BASE64=<your-base64-string>
   ```
3. Update `app/core/config.py` to decode it (requires code change)

## Run Database Migrations

After deployment, run migrations via Railway Shell:

```bash
cd backend
alembic upgrade head
```

## Seed Initial Data

```bash
cd backend
python database/seed_gift_catalog.py
python database/seed_celebrities_for_today.py
```

## Start Command

Railway will use:
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

This is configured in `railway.json` and `Procfile`.

