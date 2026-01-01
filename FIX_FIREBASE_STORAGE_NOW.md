# FIXING FIREBASE STORAGE CORS ERROR - MANDATORY STEPS

## The Problem
Firebase Storage CORS error is blocking profile picture uploads because:
1. Firebase Storage might not be enabled
2. Storage security rules aren't configured
3. CORS policy isn't set for localhost

## SOLUTION - Follow These Steps Exactly:

### Step 1: Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **happy-birthday-mate-7f498**
3. Click **Storage** in the left sidebar
4. If you see "Get Started", click it
5. Click **Start in production mode** (we'll secure it next)
6. Choose a location (any location works)
7. Click **Done**

### Step 2: Configure Storage Security Rules

1. In Firebase Console → Storage
2. Click the **Rules** tab at the top
3. Replace ALL the rules with this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures
    match /profile_pictures/{userId}/{fileName} {
      // Anyone can read profile pictures
      allow read: if true;
      // Only authenticated users can upload their own profile picture
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Birthday wall photos
    match /birthday_walls/{wallId}/{fileName} {
      // Anyone can read birthday wall photos
      allow read: if true;
      // Only authenticated users can upload
      allow write: if request.auth != null;
    }
    
    // Deny everything else
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

4. Click **Publish**

### Step 3: Verify Storage Bucket Name

1. In Firebase Console → Storage
2. Look at the bucket URL at the top - it should be:
   `gs://happy-birthday-mate-7f498.firebasestorage.app`

3. **Check your `.env.local` file** - make sure `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` matches exactly:

```env
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=happy-birthday-mate-7f498.firebasestorage.app
```

### Step 4: Restart the Frontend Server

After making these changes:

```powershell
# Stop the frontend dev server (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

### Step 5: Clear Browser Cache

In your browser:
1. Press **Ctrl + Shift + Delete**
2. Select **Cached images and files**
3. Click **Clear data**
4. Refresh the page: **Ctrl + Shift + R**

### Step 6: Test the Upload

1. Go back to Step 1 in onboarding
2. Upload a profile picture
3. Fill in all other details
4. Complete the signup

## If It Still Doesn't Work

If you still get CORS errors after following ALL steps above:

### Option A: Check Firebase Console Storage Tab
- Make sure you see the Storage bucket created
- Try uploading a test file manually from the Firebase Console
- Check if the file appears

### Option B: Verify Authentication
Make sure you're logged in with Google before uploading:
- You should see your Google account in the top right
- The error happens because Firebase needs authentication to upload

## Expected Behavior After Fix

✅ Profile picture uploads successfully  
✅ You see a preview of your uploaded image  
✅ No CORS errors in console  
✅ Signup completes and redirects to dashboard  

## Why This Happened

Firebase Storage requires explicit configuration:
1. **Storage must be enabled** - It's not enabled by default
2. **Rules must allow uploads** - Default rules deny everything
3. **Authentication required** - Users must be signed in to upload

This is a **one-time setup** - once configured, it works forever!

