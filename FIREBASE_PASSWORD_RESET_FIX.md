# Firebase Password Reset Fix - Comprehensive Solution

## Issue Summary
Firebase password reset links are not preserving the `oobCode` parameter when redirecting to our application, causing "invalid or already used" errors.

## Root Cause Analysis

Based on Firebase documentation and web search results, the issue is:
1. **Firebase Action Handler Location**: Firebase's action handler is on `firebaseapp.com` domain, not ours
2. **Redirect Behavior**: When `handleCodeInApp: false`, Firebase redirects to `continueUrl` but doesn't reliably append `oobCode`
3. **Code Consumption**: The reset code is single-use and can be consumed prematurely

## Solution Implemented

### 1. Firebase Console Configuration Checklist

**CRITICAL: Verify these settings in Firebase Console:**

1. **Authentication → Settings → Authorized domains**
   - ✅ Ensure `localhost` is listed (for development)
   - ✅ Ensure your production domain is listed (e.g., `happybirthdaymate.com`, `www.happybirthdaymate.com`)

2. **Authentication → Templates → Password reset**
   - ✅ Check "Expire after" setting (default: 1 hour, consider increasing to 3-24 hours)
   - ✅ Verify the email template is using the correct format
   - ✅ Check if "Customize action URL" is enabled (should point to your app)

3. **Project Settings → General**
   - ✅ Verify your Firebase project ID matches `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - ✅ Check that the API key is correct

### 2. Code Implementation Status

✅ **Frontend Firebase Config** (`frontend/src/lib/firebase.ts`)
- Uses environment variables correctly
- Validates configuration on load

✅ **Forgot Password Page** (`frontend/src/app/forgot-password/page.tsx`)
- Uses `sendPasswordResetEmail` with `actionCodeSettings`
- Redirects to `/auth/action` handler
- `handleCodeInApp: false` (correct for web apps)

✅ **Action Handler Page** (`frontend/src/app/auth/action/page.tsx`)
- Extracts code from URL params
- Checks `document.referrer` for code
- Falls back to sessionStorage
- Shows manual entry form if code not found

✅ **Reset Password Page** (`frontend/src/app/reset-password/page.tsx`)
- Extracts code from multiple sources
- Does NOT call `verifyPasswordResetCode` (prevents code consumption)
- Only uses code when user submits form

### 3. Environment Variables Required

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`.env`):
```env
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
```

### 4. Firebase Console Action URL Configuration

**IMPORTANT**: Check Firebase Console → Authentication → Templates → Password reset:

1. **Action URL**: Should be set to your app's domain
   - Development: `http://localhost:3000/auth/action`
   - Production: `https://happybirthdaymate.com/auth/action` or `https://www.happybirthdaymate.com/auth/action`

2. **Customize action URL**: If enabled, ensure it matches your redirect URL

### 5. Testing Steps

1. **Verify Environment Variables**:
   ```bash
   # Frontend
   cd frontend
   # Check if .env.local exists and has all Firebase variables
   
   # Backend  
   cd backend
   # Check if .env exists and has FIREBASE_CREDENTIALS_PATH
   ```

2. **Test Password Reset Flow**:
   - Request password reset email
   - Click the link immediately
   - Check browser console for logs
   - Verify code extraction works
   - Submit new password

3. **Check Firebase Console**:
   - Go to Authentication → Users
   - Verify user exists
   - Check if password was reset successfully

### 6. Known Limitations & Workarounds

**Limitation**: Firebase doesn't reliably append `oobCode` to redirect URLs when `handleCodeInApp: false`

**Workarounds Implemented**:
1. ✅ Manual code entry form (fallback)
2. ✅ Code extraction from `document.referrer`
3. ✅ SessionStorage backup
4. ✅ Multiple extraction methods

### 7. Alternative Solution (If Still Not Working)

If the current solution doesn't work, consider:

**Option A: Use Firebase Admin SDK (Backend)**
- Generate password reset links server-side
- More control over the link format
- Requires backend endpoint

**Option B: Custom Email Service**
- Use Resend, SendGrid, or similar
- Generate custom reset links
- Full control over the flow

**Option C: Increase Expiration Time**
- Firebase Console → Authentication → Templates → Password reset
- Set "Expire after" to 24 hours
- Gives users more time to use the link

## Next Steps

1. ✅ Verify Firebase Console settings (Action URL, Authorized domains)
2. ✅ Check environment variables are set correctly
3. ✅ Test with fresh reset email
4. ✅ Check browser console logs
5. ✅ If still failing, use manual entry form as fallback

## Files Modified

- `frontend/src/app/forgot-password/page.tsx` - Password reset request
- `frontend/src/app/auth/action/page.tsx` - Code extraction handler
- `frontend/src/app/reset-password/page.tsx` - Password reset form
- `frontend/src/lib/firebase.ts` - Firebase configuration

## Debugging Commands

```bash
# Check if Firebase config is loaded
# Open browser console and check for Firebase initialization logs

# Check environment variables
# Frontend: Check .env.local file exists
# Backend: Check .env file exists

# Test password reset
# 1. Request reset email
# 2. Check email for link
# 3. Click link and check console logs
# 4. Verify code extraction
```

