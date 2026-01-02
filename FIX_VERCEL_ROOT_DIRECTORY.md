# Fix Vercel Root Directory Configuration

## Problem
Vercel is trying to build from the root directory, but `package.json` is in the `frontend` folder.

## Solution: Update Root Directory in Vercel Dashboard

### Steps:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in to your account

2. **Select Your Project**
   - Click on your "Happy Birthday Mate" project

3. **Go to Settings**
   - Click on **"Settings"** tab (top navigation)
   - Or click the **gear icon** ⚙️ next to your project name

4. **Update Root Directory**
   - Scroll down to **"General"** section
   - Find **"Root Directory"** setting
   - Click **"Edit"** or the **pencil icon** ✏️
   - Change from: `./` (root)
   - Change to: `frontend`
   - Click **"Save"**

5. **Verify Build Settings**
   - While in Settings, check **"Build and Output Settings"**:
     - **Framework Preset**: Next.js
     - **Build Command**: `npm run build` (should auto-detect)
     - **Output Directory**: `.next` (should auto-detect)
     - **Install Command**: `npm install` (should auto-detect)

6. **Redeploy**
   - Go to **"Deployments"** tab
   - Click the **three dots** (⋯) on the latest deployment
   - Click **"Redeploy"**
   - Or just push a new commit to trigger a new deployment

## Alternative: Use Vercel CLI to Update

If you prefer using CLI:

```powershell
cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM\frontend"
vercel link
```

Then when prompted:
- Set up and develop? **Y**
- Which scope? Select your account
- Link to existing project? **Y**
- What's the name of your existing project? Enter your project name
- Which directory contains your application code? **./** (since you're already in frontend)

But the Dashboard method is easier and more reliable.

---

**After updating, Vercel will build from the `frontend` directory and find `package.json` correctly!** ✅

