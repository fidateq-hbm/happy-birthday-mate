# Initialize Firebase Storage and Apply CORS

## Issue
The Firebase Storage bucket doesn't exist yet. You need to initialize it first in Firebase Console.

## Step-by-Step Instructions

### Step 1: Initialize Firebase Storage

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Sign in** with: petrinusonuoha@gmail.com
3. **Select project**: happy-birthday-mate-7f498
4. **Click "Storage"** in the left sidebar
5. **If you see "Get started" button**, click it to initialize Storage
6. **Follow the setup wizard**:
   - Choose **Start in production mode** (we'll update rules after)
   - Select a **location** (choose closest to your users, e.g., `us-central1` or `europe-west1`)
   - Click **Done**

This will create the bucket: `happy-birthday-mate-7f498.firebasestorage.app`

### Step 2: Configure CORS

1. **Still in Storage**, click the **Settings** (gear icon) at the top right
2. **Scroll down** to find **CORS configuration** section
3. **Click "Edit"** or **"Add CORS configuration"**
4. **Paste this JSON**:
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
5. **Click "Save"**

### Step 3: Apply Storage Security Rules

1. **Click the "Rules" tab** (next to Files tab)
2. **Replace** all existing rules with:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload their own profile pictures
    match /profile_pictures/{userId}/{allPaths=**} {
      // Allow public read access for profile pictures
      allow read: if true;
      // Allow write only if authenticated and uploading to their own folder
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // Max 5MB
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```
3. **Click "Publish"**

### Step 4: Verify

1. **Wait 1-2 minutes** for changes to propagate
2. **Go to your website**: https://www.happybirthdaymate.com/onboarding
3. **Try uploading a profile picture**
4. **Check browser console** - CORS errors should be gone

## After Initialization

Once Storage is initialized, you can also apply CORS via gsutil (if you prefer):
```powershell
gsutil cors set cors.json gs://happy-birthday-mate-7f498.firebasestorage.app
```

But the Firebase Console method is recommended and easier.

