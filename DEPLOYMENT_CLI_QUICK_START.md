# 🚀 Quick CLI Deployment Guide

Fast deployment using Railway and Vercel CLIs (no GitHub required).

## Prerequisites

```powershell
# Install Railway CLI (Recommended method - using npm)
# Windows PowerShell (run from anywhere):
npm install -g @railway/cli

# Alternative: If npm doesn't work, download manually from:
# https://github.com/railwayapp/cli/releases
# Extract railway.exe and add to your PATH

# Install Vercel CLI
npm install -g vercel

# Verify installations
railway --version
vercel --version
```

---

## 🗄️ Railway Backend (5 minutes)

```bash
# 1. Install Railway CLI (run from anywhere)
# Windows PowerShell:
iwr https://railway.app/install.ps1 | iex

# 2. Login (run from anywhere)
railway login

# 3. Navigate to project root and initialize
# Directory: C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM"
railway init

# 4. Add PostgreSQL (run from: HBM/)
railway add postgresql

# 5. Get DATABASE_URL (run from: HBM/)
railway variables

# 6. Navigate to backend directory
# Directory: C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\backend
cd backend

# 7. Set environment variables (run from: HBM/backend/)
# Note: Use --set flag with "KEY=VALUE" format
railway variables --set "DATABASE_URL=<from-step-4>"
railway variables --set "SECRET_KEY=<generate-random-32-chars>"
railway variables --set "ALGORITHM=HS256"
railway variables --set "ACCESS_TOKEN_EXPIRE_MINUTES=30"
railway variables --set "FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json"
railway variables --set "ALLOWED_ORIGINS=https://happybirthdaymate.com,https://www.happybirthdaymate.com"
railway variables --set "GEMINI_API_KEY=<your-key>"

# 8. Deploy (run from: HBM/backend/)
railway up

# 9. Run migrations (run from: HBM/backend/)
railway run alembic upgrade head

# 10. Seed data (run from: HBM/backend/)
railway run python database/seed_gift_catalog.py
railway run python database/seed_celebrities_for_today.py

# 11. Get your backend URL (run from: HBM/backend/)
railway domain
```

---

## 🎨 Vercel Frontend (5 minutes)

```bash
# 1. Install Vercel CLI (run from anywhere)
npm install -g vercel

# 2. Login (run from anywhere)
vercel login

# 3. Navigate to frontend directory
# Directory: C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\frontend
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\frontend"

# 4. Initialize and deploy (run from: HBM/frontend/)
vercel

# 5. Set environment variables (run from: HBM/frontend/)
vercel env add NEXT_PUBLIC_API_URL
# Enter your Railway backend URL

vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID

# 6. Deploy to production (run from: HBM/frontend/)
vercel --prod

# 7. Add custom domain (run from: HBM/frontend/)
vercel domains add happybirthdaymate.com
vercel domains add www.happybirthdaymate.com
```

---

## ✅ Done!

Your app is now live! 🎉

**Backend URL:** `https://your-app.railway.app`  
**Frontend URL:** `https://happybirthdaymate.com`

---

## 🔄 Updating Your Deployment

**Backend:**
```bash
# Navigate to backend directory
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\backend"
# Deploy (run from: HBM/backend/)
railway up
```

**Frontend:**
```bash
# Navigate to frontend directory
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\frontend"
# Deploy (run from: HBM/frontend/)
vercel --prod
```

---

## 📝 Notes

- Make sure `firebase-credentials.json` is in the `backend` folder before deploying
- Update `ALLOWED_ORIGINS` in Railway after getting your Vercel URL
- Add authorized domains in Firebase Console after deployment

