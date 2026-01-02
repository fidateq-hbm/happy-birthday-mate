# Firebase Storage CORS Configuration Guide

## Problem
Firebase Storage is blocking image uploads from the frontend due to CORS (Cross-Origin Resource Sharing) policy. This prevents users from uploading profile pictures during onboarding.

## Solution
Configure CORS for your Firebase Storage bucket using Google Cloud's `gsutil` tool.

## Step 1: Find Your Firebase Storage Bucket Name

Your Firebase Storage bucket name is stored in the environment variable:
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

To find it:
1. Check your `.env.local` file in the `frontend` directory
2. Or check your Vercel environment variables
3. The bucket name typically looks like: `your-project-id.appspot.com` or `your-project-id.firebasestorage.app`

## Step 2: Install Google Cloud SDK

If you don't have `gsutil` installed:

### Windows:
1. Download and install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Or use PowerShell: `(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe"); & $env:Temp\GoogleCloudSDKInstaller.exe`

### Mac/Linux:
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

## Step 3: Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your Firebase project ID (from `NEXT_PUBLIC_FIREBASE_PROJECT_ID`).

## Step 4: Apply CORS Configuration

A `cors.json` file has been created in the project root with the correct CORS settings.

### Apply CORS using gsutil:

```bash
gsutil cors set cors.json gs://YOUR_STORAGE_BUCKET_NAME
```

Replace `YOUR_STORAGE_BUCKET_NAME` with your actual bucket name.

**Example:**
```bash
gsutil cors set cors.json gs://happy-birthday-mate.appspot.com
```

### Verify CORS is set:

```bash
gsutil cors get gs://YOUR_STORAGE_BUCKET_NAME
```

This should return the CORS configuration from `cors.json`.

## Step 5: Alternative - Configure via Firebase Console

If you prefer using the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Storage** → **Rules** tab
4. Click on **Settings** (gear icon)
5. Scroll to **CORS configuration**
6. Add the following CORS configuration:

```json
[
  {
    "origin": ["https://www.happybirthdaymate.com", "https://happybirthdaymate.com", "http://localhost:3000"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "X-Requested-With"],
    "maxAgeSeconds": 3600
  }
]
```

## Step 6: Update Firebase Storage Security Rules

Also ensure your Storage rules allow uploads. In Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload profile pictures
    match /profile_pictures/{userId}/{allPaths=**} {
      allow read: if true; // Public read access
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Current Code Using Firebase Storage

The Firebase Storage is being used in:
- **File**: `frontend/src/app/onboarding/page.tsx`
- **Function**: `uploadProfilePicture()`
- **Lines**: 88-104

The code uploads to: `profile_pictures/${firebaseUser.uid}/${Date.now()}_${profilePicture.name}`

## Troubleshooting

### Check if CORS is applied:
```bash
gsutil cors get gs://YOUR_BUCKET_NAME
```

### Check bucket name:
The bucket name is configured in `frontend/src/lib/firebase.ts`:
```typescript
storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```

### Common Issues:
1. **Wrong bucket name**: Make sure you're using the exact bucket name from your Firebase config
2. **Not authenticated**: Run `gcloud auth login` first
3. **Wrong project**: Run `gcloud config set project YOUR_PROJECT_ID`
4. **CORS not taking effect**: Wait a few minutes and try again, or clear browser cache

## Quick Fix (Temporary)

Until CORS is configured, the onboarding process will use a fallback avatar from ui-avatars.com if the upload fails. This allows users to complete onboarding even if Firebase Storage has CORS issues.

