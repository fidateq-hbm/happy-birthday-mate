# Apply CORS Configuration - Manual Steps

## Issue
gsutil is having permission issues. Use one of these methods:

## Method 1: Run PowerShell as Administrator (Recommended)

1. **Close current PowerShell**
2. **Right-click PowerShell** → **Run as Administrator**
3. Navigate to project:
   ```powershell
   cd "C:\Users\HomePC\Documents\Jobs\Happy Birthday Mate\HBM"
   ```
4. Apply CORS:
   ```powershell
   gsutil cors set cors.json gs://happy-birthday-mate-7f498.firebasestorage.app
   ```
5. Verify:
   ```powershell
   gsutil cors get gs://happy-birthday-mate-7f498.firebasestorage.app
   ```

## Method 2: Firebase Console (Easier - No Admin Required)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **happy-birthday-mate-7f498**
3. Click **Storage** in left sidebar
4. Click **Settings** (gear icon) at the top
5. Scroll down to **CORS configuration** section
6. Click **Edit** or **Add CORS configuration**
7. Paste this JSON:
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
8. Click **Save**

## Method 3: Use gcloud storage (Alternative)

If gsutil doesn't work, try:
```powershell
gcloud storage buckets update gs://happy-birthday-mate-7f498.firebasestorage.app --cors-file=cors.json
```

## Apply Storage Rules

1. Go to Firebase Console → **Storage** → **Rules** tab
2. Paste this content:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_pictures/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```
3. Click **Publish**

## Verify CORS is Applied

After applying, test by:
1. Going to your onboarding page
2. Try uploading a profile picture
3. Check browser console - CORS errors should be gone

