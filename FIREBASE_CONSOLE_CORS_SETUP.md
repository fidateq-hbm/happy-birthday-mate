# Apply CORS via Firebase Console (Recommended Method)

## Why Firebase Console?
Firebase Storage buckets are managed through Firebase Console, not gcloud CLI. This is the official and easiest method.

## Step-by-Step Instructions

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Sign in with: **petrinusonuoha@gmail.com** (or your Firebase account)
3. Select project: **happy-birthday-mate-7f498**

### Step 2: Navigate to Storage
1. In the left sidebar, click **Storage**
2. If you see "Get started" or "Create bucket", click it to initialize Storage (if not already done)

### Step 3: Configure CORS
1. Click the **Settings** (gear icon) at the top right of the Storage page
2. Scroll down to find **CORS configuration** section
3. Click **Edit** or **Add CORS configuration**
4. **Delete any existing CORS configuration** (if present)
5. **Paste this JSON**:
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
6. Click **Save** or **Update**

### Step 4: Apply Storage Security Rules
1. Still in Storage, click the **Rules** tab (next to Files tab)
2. **Replace** the existing rules with:
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
3. Click **Publish**

### Step 5: Verify
1. Wait 1-2 minutes for changes to propagate
2. Go to your website: https://www.happybirthdaymate.com/onboarding
3. Try uploading a profile picture
4. Check browser console - CORS errors should be gone

## Troubleshooting

### If CORS section is not visible:
- Make sure Storage is initialized (you've created at least one file or bucket)
- Try refreshing the page
- Check if you have proper permissions (Owner or Editor role)

### If upload still fails:
- Clear browser cache
- Wait a few more minutes for CORS to propagate
- Check browser console for specific error messages

## Current Configuration
- **Project ID**: happy-birthday-mate-7f498
- **Storage Bucket**: happy-birthday-mate-7f498.firebasestorage.app
- **Account**: petrinusonuoha@gmail.com

