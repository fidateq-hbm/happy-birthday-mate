# 🚀 Deployment Guide: Happy Birthday Mate

Complete step-by-step guide to deploy the backend to Railway and frontend to Vercel.

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ A GitHub account
- ✅ A Railway account (sign up at https://railway.app)
- ✅ A Vercel account (sign up at https://vercel.com)
- ✅ Firebase project set up (for authentication)
- ✅ Google Gemini API key (for AI messages)
- ✅ Your domain name configured (happybirthdaymate.com)

---

## 🗄️ Part 1: Railway Setup (Backend + PostgreSQL)

### Step 1: Install Railway CLI

**Option 1: Using npm (Recommended - Works on all platforms):**
```powershell
# Open PowerShell (can be run from anywhere)
# Make sure you have Node.js installed first (https://nodejs.org/)
npm install -g @railway/cli
```

**Option 2: Using Scoop (Windows only - if you have Scoop package manager):**
```powershell
# Open PowerShell (can be run from anywhere)
scoop install railway
```

**Option 3: Manual Download (Windows):**
1. Go to https://github.com/railwayapp/cli/releases
2. Download the latest `railway_windows_amd64.zip` for Windows
3. Extract the zip file
4. Copy `railway.exe` to a folder in your PATH (e.g., `C:\Windows\System32` or create a `C:\railway` folder and add it to PATH)
5. Add the folder to your system PATH:
   - Open "Environment Variables" in Windows
   - Edit "Path" under System variables
   - Add the folder containing `railway.exe`
   - Click OK

**Option 4: Using Chocolatey (Windows only - if you have Chocolatey):**
```powershell
# Open PowerShell as Administrator
choco install railway
```

**Verify installation:**
```powershell
# Run from anywhere
railway --version
```

**If installation fails, try:**
```powershell
# Clear npm cache and retry
npm cache clean --force
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
# Run from anywhere (PowerShell or Terminal)
railway login
```

This will open your browser to authenticate.

### Step 3: Navigate to Project Root and Create Railway Project

```bash
# Navigate to your project root directory
# Windows PowerShell:
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM"

# Mac/Linux Terminal:
# cd /path/to/your/project/HBM

# Initialize Railway project (run from project root: HBM/)
railway init
```

Follow the prompts:
- Create a new project: **Yes**
- Enter project name: `happy-birthday-mate` (or your preferred name)

### Step 4: Create PostgreSQL Database

**Option A: Via Railway Dashboard**
1. Go to https://railway.app/dashboard
2. Click on your project
3. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
4. Wait for database to be created (~30 seconds)
5. Click on PostgreSQL service → **"Variables"** tab
6. Copy the `DATABASE_URL` value

**Option B: Via Railway CLI**
```bash
# Run from project root: C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\
railway add postgresql

# Get the DATABASE_URL
railway variables
```

### Step 5: Navigate to Backend Directory and Deploy

**According to Railway documentation, `railway up` will automatically create a service if one doesn't exist.**

```powershell
# Navigate to backend directory
# Windows PowerShell:
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\backend"

# Make sure you're linked to the project (you already did this)
# If not linked, run: railway link

# Deploy - this will auto-create a backend service
railway up
```

**When prompted to select a service:**
- If you see only "Postgres", Railway will create a new service automatically when you deploy
- You can press **Enter** on "Postgres" to proceed, or Railway may create a new service automatically
- Alternatively, if the prompt allows typing, type a new service name like `backend` and press Enter

**Via Railway Dashboard (Alternative):**
1. Go to your Railway project dashboard
2. Click **"+ New"** → **"Empty Service"**
3. Go to **"Settings"**:
   - **Root Directory**: `backend` (or leave empty if deploying from backend folder)
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 6: Set Environment Variables

**Important:** You need to deploy first (Step 8) to create the backend service, then you can set variables.

**Via Railway CLI (Recommended):**
```powershell
# Make sure you're in the backend directory
# Current directory: C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\backend

# First, make sure you have a backend service (deploy first with railway up)
# Then set environment variables one by one (run from: HBM/backend/)
# Note: Use --set flag with "KEY=VALUE" format (no spaces around =)
railway variables --set "DATABASE_URL=postgresql://postgres:password@hostname:port/railway"
railway variables --set "SECRET_KEY=your-random-secret-key-minimum-32-characters"
railway variables --set "ALGORITHM=HS256"
railway variables --set "ACCESS_TOKEN_EXPIRE_MINUTES=30"
railway variables --set "FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json"
railway variables --set "ALLOWED_ORIGINS=https://happybirthdaymate.com,https://www.happybirthdaymate.com"
railway variables --set "GEMINI_API_KEY=your-gemini-api-key-here"
```

**Note:** If you get "No service linked" error, you need to deploy first with `railway up` to create the service, then set variables.

**Via Railway Dashboard (Alternative):**
In your backend service, go to **"Variables"** tab and add:

#### Required Variables:

```bash
# Database (from PostgreSQL service)
DATABASE_URL=postgresql://postgres:password@hostname:port/railway
# ⚠️ Use the DATABASE_URL from your PostgreSQL service variables

# Security
SECRET_KEY=your-random-secret-key-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Firebase Admin SDK
# You need to upload firebase-credentials.json to Railway
# Option 1: Base64 encode the JSON file and paste here
# Option 2: Use Railway's file upload feature (if available)
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json

# CORS - Add your Vercel frontend URL (update after deploying frontend)
ALLOWED_ORIGINS=https://happybirthdaymate.com,https://www.happybirthdaymate.com

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here
```

#### Optional Variables:

```bash
# Email Service (if using Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@happybirthdaymate.com
EMAIL_FROM_NAME=Happy Birthday Mate

# Payment Providers (if using)
STRIPE_SECRET_KEY=
PAYPAL_CLIENT_ID=
PAYSTACK_SECRET_KEY=
```

### Step 5: Upload Firebase Credentials

**Option A: Using Railway's File System (Recommended)**

1. In Railway, go to your backend service
2. Open the **"Deployments"** tab
3. Click on the latest deployment
4. Open the **"Shell"** tab
5. Create the file:
   ```bash
   mkdir -p backend
   cd backend
   nano firebase-credentials.json
   ```
6. Paste your Firebase service account JSON content
7. Save and exit (Ctrl+X, Y, Enter)

**Option B: Using Environment Variable (Alternative)**

1. Base64 encode your `firebase-credentials.json`:
   ```bash
   # On Windows PowerShell:
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("firebase-credentials.json"))
   ```
2. Add to Railway variables:
   ```bash
   FIREBASE_CREDENTIALS_BASE64=your-base64-encoded-content
   ```
3. Update your backend code to decode it (requires code change)

### Step 8: Deploy Backend (Auto-Creates Service)

**According to Railway documentation, deploying will automatically create a service if one doesn't exist.**

**Via Railway CLI:**
```powershell
# Make sure you're in the backend directory
# Current directory: C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\backend

# Deploy to Railway (run from: HBM/backend/)
# This will automatically create a backend service if one doesn't exist
railway up
```

**What happens:**
- Railway will upload all files in the backend directory
- If no backend service exists, Railway will create one automatically
- Install dependencies from `requirements.txt`
- Start the application using the command in `Procfile` or `railway.json`

**If prompted to select a service:**
- Railway may ask you to select a service during first deployment
- If you only see "Postgres", Railway will create a new service for your backend automatically
- You can proceed with the deployment - Railway handles service creation

**Note:** If you're not in the backend directory, navigate there first:
```powershell
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\backend"
railway up
```

**Via Railway Dashboard (Alternative):**
1. Go to Railway dashboard → Your project
2. Click **"+ New"** → **"Empty Service"**
3. Upload your backend folder or connect via CLI

### Step 9: Get Backend URL

```bash
# Run from backend directory: C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\backend
railway domain
```

Or in Railway dashboard:
1. Go to your backend service
2. Click **"Settings"** → **"Generate Domain"**
3. Copy your backend URL (e.g., `https://your-app.railway.app`)

### Step 10: Run Database Migrations

**Via Railway CLI:**
```bash
# Run from backend directory: C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\backend
railway run alembic upgrade head
```

**Via Railway Shell (Alternative):**
1. In Railway dashboard, go to your backend service
2. Open **"Deployments"** → Latest deployment → **"Shell"**
3. Run:
   ```bash
   cd backend
   pip install -r requirements.txt
   alembic upgrade head
   ```
4. You should see: `INFO [alembic.runtime.migration] Running upgrade ... -> ..., <revision>`
5. If successful, your database tables are now created!

### Step 8: Test Backend

1. Visit: `https://your-backend-url.railway.app/docs`
2. You should see the FastAPI Swagger documentation
3. Test the health endpoint: `https://your-backend-url.railway.app/api/health`

---

## 🎨 Part 2: Vercel Setup (Frontend)

### Step 1: Install Vercel CLI

**Windows/Mac/Linux:**
```bash
# Open PowerShell or Terminal (can be run from anywhere)
# Install Vercel CLI globally
npm install -g vercel
```

**Verify installation:**
```bash
# Run from anywhere
vercel --version
```

### Step 2: Login to Vercel

```bash
# Run from anywhere (PowerShell or Terminal)
vercel login
```

This will open your browser to authenticate.

### Step 3: Navigate to Frontend Directory and Create Vercel Project

```bash
# Navigate to frontend directory
# Windows PowerShell:
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\frontend"

# Mac/Linux Terminal:
# cd /path/to/your/project/HBM/frontend

# Initialize and deploy (run from: HBM/frontend/)
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (for first time)
- Project name: `happy-birthday-mate` (or your preferred name)
- Directory: `./` (current directory)
- Override settings? **No** (use defaults)

### Step 4: Set Environment Variables

**Via Vercel CLI:**
```bash
# Make sure you're in the frontend directory
# Current directory: C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\frontend

# Set environment variables (run from: HBM/frontend/)
vercel env add NEXT_PUBLIC_API_URL
# Enter your Railway backend URL when prompted

vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
```

For each variable, you'll be prompted to:
- Enter the value
- Select environments (Production, Preview, Development) - select all

**Via Vercel Dashboard (Alternative):**
Go to your project → **"Settings"** → **"Environment Variables"** and add:

```bash
# Backend API URL (from Railway)
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app

# Firebase Configuration (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**To get Firebase config:**
1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps" → Web app
3. Copy the config values

### Step 5: Deploy Frontend

**Via Vercel CLI:**
```bash
# Make sure you're in the frontend directory
# Current directory: C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\frontend

# Deploy to production (run from: HBM/frontend/)
vercel --prod
```

**Note:** If you're not in the frontend directory, navigate there first:
```bash
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\frontend"
vercel --prod
```

This will:
- Build your Next.js application
- Deploy to Vercel
- Provide you with a deployment URL

**Via Vercel Dashboard (Alternative):**
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Click **"Deployments"** → **"Redeploy"** (if needed)

### Step 6: Configure Custom Domain

**Via Vercel CLI:**
```bash
# Add custom domain
vercel domains add happybirthdaymate.com
vercel domains add www.happybirthdaymate.com
```

**Via Vercel Dashboard:**
1. Go to your project → **"Settings"** → **"Domains"**
2. Add your domain: `happybirthdaymate.com`
3. Add `www.happybirthdaymate.com` as well
4. Follow Vercel's DNS instructions:
   - Add a CNAME record pointing to `cname.vercel-dns.com`
   - Or add A records as instructed

### Step 7: Update Backend CORS

1. Go back to Railway → Backend service → Variables
2. Update `ALLOWED_ORIGINS`:
   ```bash
   ALLOWED_ORIGINS=https://happybirthdaymate.com,https://www.happybirthdaymate.com,https://your-app.vercel.app
   ```
3. Redeploy the backend

---

## 🔧 Part 3: Post-Deployment Setup

### Step 1: Seed Initial Data

1. In Railway, go to your backend service
2. Open **"Deployments"** → Latest deployment → **"Shell"**
3. Run:
   ```bash
   cd backend
   python database/seed_gift_catalog.py
   python database/seed_celebrities_for_today.py
   ```
4. You should see confirmation messages for each seed operation

### Step 2: Update Firebase Authorized Domains

1. Go to Firebase Console → Authentication → Settings
2. Add authorized domains:
   - `happybirthdaymate.com`
   - `www.happybirthdaymate.com`
   - `your-app.vercel.app`

### Step 3: Test Everything

1. ✅ Visit your frontend: `https://happybirthdaymate.com`
2. ✅ Test signup/login
3. ✅ Test API calls
4. ✅ Check backend logs in Railway
5. ✅ Check frontend logs in Vercel

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Database connection errors
- **Solution**: Check `DATABASE_URL` is correct in Railway variables

**Problem**: Firebase credentials not found
- **Solution**: Ensure `firebase-credentials.json` is in the backend directory

**Problem**: CORS errors
- **Solution**: Update `ALLOWED_ORIGINS` with your frontend URL

### Frontend Issues

**Problem**: API calls failing
- **Solution**: Check `NEXT_PUBLIC_API_URL` matches your Railway backend URL

**Problem**: Firebase auth not working
- **Solution**: Verify all Firebase env variables are set correctly

**Problem**: Build fails
- **Solution**: Check Vercel build logs for specific errors

---

## 📝 Quick Reference

### Railway Backend URL
```
https://your-backend.railway.app
```

### Vercel Frontend URL
```
https://happybirthdaymate.com
```

### Environment Variables Checklist

**Backend (Railway):**
- [ ] DATABASE_URL
- [ ] SECRET_KEY
- [ ] FIREBASE_CREDENTIALS_PATH
- [ ] ALLOWED_ORIGINS
- [ ] GEMINI_API_KEY

**Frontend (Vercel):**
- [ ] NEXT_PUBLIC_API_URL
- [ ] NEXT_PUBLIC_FIREBASE_API_KEY
- [ ] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- [ ] NEXT_PUBLIC_FIREBASE_PROJECT_ID
- [ ] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- [ ] NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- [ ] NEXT_PUBLIC_FIREBASE_APP_ID

---

## 🎉 You're Done!

Your Happy Birthday Mate platform is now live! 🚀

**Next Steps:**
- Monitor logs in Railway and Vercel
- Set up error tracking (Sentry, etc.)
- Configure email service for production
- Set up monitoring and alerts

---

## 📞 Need Help?

If you encounter issues:
1. Check Railway logs: Service → Deployments → View Logs
2. Check Vercel logs: Project → Deployments → View Logs
3. Verify all environment variables are set correctly
4. Ensure database migrations ran successfully

