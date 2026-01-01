# Firebase Storage Setup

## The Issue
Firebase Storage CORS error when uploading profile pictures. This happens when Firebase Storage rules aren't configured.

## Quick Fix (What I Did)
Made profile picture upload optional with a fallback to generated avatars using ui-avatars.com API.

## To Enable Firebase Storage (Optional)

### 1. Configure Storage Rules

Go to Firebase Console → Storage → Rules, and update to:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_pictures/{userId}/{fileName} {
      // Allow authenticated users to upload their own profile pictures
      allow write: if request.auth != null && request.auth.uid == userId;
      // Allow anyone to read profile pictures
      allow read: if true;
    }
    
    match /birthday_walls/{wallId}/{fileName} {
      // Allow authenticated users to upload to birthday walls
      allow write: if request.auth != null;
      // Allow anyone to read birthday wall photos
      allow read: if true;
    }
  }
}
```

Click **Publish**.

### 2. Configure CORS (If Needed)

If issues persist, add CORS configuration:

1. Install Google Cloud SDK
2. Create `cors.json`:

```json
[
  {
    "origin": ["http://localhost:3000", "https://yourdomain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

3. Run:
```bash
gsutil cors set cors.json gs://happy-birthday-mate-7f498.firebasestorage.app
```

### 3. Test Upload

After configuring, users can upload custom profile pictures. If upload fails, the app will automatically use a generated avatar.

## Current Behavior

✅ **Profile picture is now optional**  
✅ **Default avatars are generated** using the user's name  
✅ **No CORS errors block signup**  
✅ **Users can complete onboarding** without uploading a picture

Users can always update their profile picture later from settings!

