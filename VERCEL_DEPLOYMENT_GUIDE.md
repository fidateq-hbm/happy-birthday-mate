# Vercel Frontend Deployment Guide

## Step 1: Install Vercel CLI

```powershell
npm install -g vercel
```

## Step 2: Login to Vercel

```powershell
vercel login
```

This will open your browser to authenticate.

## Step 3: Navigate to Frontend Directory

```powershell
cd frontend
```

## Step 4: Deploy to Vercel

```powershell
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (first time)
- **Project name?** → `happy-birthday-mate` (or your preferred name)
- **Directory?** → `./` (current directory)
- **Override settings?** → No

## Step 5: Set Environment Variables

After deployment, set environment variables in Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your project: `happy-birthday-mate`
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

### Required Environment Variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://happy-birthday-mate.onrender.com` | Your Render backend URL |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `[Your Firebase API Key]` | From Firebase Console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `[Your Firebase Auth Domain]` | From Firebase Console |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `[Your Firebase Project ID]` | From Firebase Console |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `[Your Firebase Storage Bucket]` | From Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `[Your Firebase Messaging Sender ID]` | From Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `[Your Firebase App ID]` | From Firebase Console |

### How to Get Firebase Values:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon) → **General** tab
4. Scroll to "Your apps" section
5. Click on your web app (or create one if needed)
6. Copy the values from the config object

## Step 6: Redeploy After Setting Variables

After adding environment variables, Vercel will automatically trigger a new deployment. Or manually trigger:

```powershell
vercel --prod
```

## Step 7: Set Your First User as Admin

After your backend is deployed and migrations have run:

1. Go to your Render backend logs or use the API
2. Or run locally (if you have access):
   ```powershell
   cd backend
   python ../database/set_admin.py your-email@example.com
   ```

Alternatively, you can set yourself as admin directly in the database:
- Connect to your Supabase database
- Run: `UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';`

## Step 8: Access Your Deployed App

Once deployed, Vercel will provide you with a URL like:
- `https://happy-birthday-mate.vercel.app`

## Step 9: Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain: `happybirthdaymate.com`
3. Follow DNS configuration instructions
4. Update `ALLOWED_ORIGINS` in Render to include your custom domain

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Check Vercel build logs for specific errors

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check Render backend is running
- Verify CORS settings in backend (`ALLOWED_ORIGINS`)

### Firebase Errors
- Verify all Firebase environment variables are set correctly
- Check Firebase Console for API restrictions

## Quick Deploy Command

For future deployments:
```powershell
cd frontend
vercel --prod
```

