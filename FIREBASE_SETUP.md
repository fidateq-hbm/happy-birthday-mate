# Firebase Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select an existing project
3. Follow the setup wizard

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password** - Click, toggle Enable, Save
   - **Google** - Click, toggle Enable, select project support email, Save

## Step 3: Get Firebase Config (Frontend)

1. In Firebase Console, click the gear icon ⚙️ (top left) → **Project settings**
2. Scroll down to **Your apps** section
3. Click the **Web** icon `</>` (or select existing web app)
4. Register your app with nickname: "Happy Birthday Mate Frontend"
5. Copy the `firebaseConfig` object values

## Step 4: Configure Frontend

Open `frontend/.env.local` and add:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Important:** After saving `.env.local`, restart the Next.js dev server!

## Step 5: Get Firebase Admin SDK (Backend)

1. In Firebase Console → Project settings → **Service accounts** tab
2. Click **Generate new private key**
3. Download the JSON file
4. Rename it to `firebase-credentials.json`
5. Move it to the **backend** directory: `backend/firebase-credentials.json`

## Step 6: Configure Backend

Your `backend/.env` should have:

```env
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

## Step 7: Enable Firebase Storage

1. In Firebase Console, go to **Storage** (left sidebar)
2. Click **Get Started**
3. Start in **Production mode** (we'll secure it later)
4. Choose a location (default is fine)
5. Click **Done**

## Step 8: Restart Servers

Stop both dev servers (Ctrl+C) and restart:

### Backend:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

### Frontend:
```powershell
cd frontend
npm run dev
```

## Troubleshooting

### "Error (auth/configuration-not-found)"
- Check that all `NEXT_PUBLIC_FIREBASE_*` variables are set in `frontend/.env.local`
- Restart the Next.js dev server after changing `.env.local`

### "Warning: Firebase Admin SDK not initialized"
- Check that `firebase-credentials.json` exists in the `backend` directory
- Verify the path in `backend/.env`

### Google Sign-In Not Working
- Ensure Google provider is enabled in Firebase Console → Authentication → Sign-in method
- Check that you've selected a support email for the OAuth consent screen

## Security Notes (Production)

Before deploying to production:

1. **Firestore/Storage Rules**: Update security rules to restrict access
2. **Authorized Domains**: Add your production domain to Firebase Console → Authentication → Settings → Authorized domains
3. **Environment Variables**: Use your hosting platform's environment variable system (not `.env.local`)
4. **API Keys**: Firebase API keys for web apps are safe to expose (they're restricted by domain)

## Next Steps

Once Firebase is configured:
1. Try signing up with email/password
2. Try signing in with Google
3. Complete the onboarding flow
4. Access your dashboard

Happy celebrating! 🎉

