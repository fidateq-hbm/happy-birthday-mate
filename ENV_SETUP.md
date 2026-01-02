# Environment Variables Setup Guide

## Quick Setup

### Step 1: Create Backend .env File

Run this PowerShell command in the project root:

```powershell
Copy-Item backend\env.template backend\.env
```

Or manually create `backend/.env` with this content:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/happy_birthday_mate

# Security - Generate a secure random secret key
# Generate using: python -c "import secrets; print(secrets.token_urlsafe(32))"
# Or use: openssl rand -hex 32
SECRET_KEY=your-secret-key-here-generate-a-secure-random-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Firebase Admin SDK
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json

# Payment Providers (Optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYSTACK_SECRET_KEY=

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# OpenAI API (Optional)
OPENAI_API_KEY=
```

**Important:** Update `DATABASE_URL` with your PostgreSQL credentials!

### Step 2: Create Frontend .env.local File

Run this PowerShell command:

```powershell
Copy-Item frontend\env.local.template frontend\.env.local
```

Then edit `frontend/.env.local` and add your Firebase configuration:

```env
# Firebase Configuration (Get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Stripe (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# PayPal (Optional)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
```

### Step 3: Configure Database

Update `DATABASE_URL` in `backend/.env`:

```env
# Replace with your PostgreSQL credentials:
# Format: postgresql://username:password@host:port/database_name

# Example if PostgreSQL user is 'postgres' with password 'mypassword':
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/happy_birthday_mate

# Example if no password:
DATABASE_URL=postgresql://postgres@localhost:5432/happy_birthday_mate
```

### Step 4: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or select existing)
3. Go to **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Click **Web app** icon (`</>`)
6. Copy the configuration values
7. Paste into `frontend/.env.local`

### Step 5: Download Firebase Admin SDK

1. In Firebase Console, go to **Project Settings**
2. Click **Service Accounts** tab
3. Click **Generate New Private Key**
4. Save the JSON file as `backend/firebase-credentials.json`

## Verification

After setup, verify your files exist:

```powershell
# Check backend .env
Test-Path backend\.env

# Check frontend .env.local
Test-Path frontend\.env.local

# Check Firebase credentials
Test-Path backend\firebase-credentials.json
```

All should return `True`!

