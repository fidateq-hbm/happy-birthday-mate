# Firebase Console Configuration Checklist for Password Reset

## CRITICAL SETTINGS TO VERIFY

### 1. Authentication → Settings → Authorized Domains

**Required domains:**
- ✅ `localhost` (for development)
- ✅ `happybirthdaymate.com` (for production)
- ✅ `www.happybirthdaymate.com` (for production)

**How to check:**
1. Go to Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains" section
3. Verify all three domains are listed
4. If missing, click "Add domain" and add them

### 2. Authentication → Templates → Password reset

**Settings to verify:**
1. **Expire after**: Should be set to at least 3 hours (default is 1 hour)
   - Click on "Password reset" template
   - Find "Expire after" dropdown
   - Change to 3 hours or 24 hours
   - Click "Save"

2. **Action URL** (if customizable):
   - Should point to: `http://localhost:3000/auth/action` (development)
   - Or: `https://happybirthdaymate.com/auth/action` (production)
   - Note: This might not be editable in Firebase Console

3. **Email template customization**:
   - Sender name: "Happy Birthday Mate"
   - Subject: Can be customized
   - Message: May be read-only (Firebase default)

### 3. Project Settings → General

**Verify:**
- Project ID matches `NEXT_PUBLIC_FIREBASE_PROJECT_ID` in your `.env.local`
- API key is correct
- Auth domain matches `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`

## HOW TO CHECK YOUR CURRENT SETTINGS

1. **Open Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: happy-birthday-mate-7f498
3. **Go to Authentication → Settings**
4. **Check "Authorized domains"** - Take a screenshot
5. **Go to Authentication → Templates → Password reset**
6. **Check "Expire after"** - Note the current value
7. **Check if "Action URL" is visible/editable** - Take a screenshot

## WHAT TO DO IF SETTINGS ARE WRONG

### If localhost is missing:
1. Authentication → Settings → Authorized domains
2. Click "Add domain"
3. Enter: `localhost`
4. Click "Add"

### If expiration is too short:
1. Authentication → Templates → Password reset
2. Find "Expire after" dropdown
3. Select "3 hours" or "24 hours"
4. Click "Save"

### If Action URL needs to be set:
- Note: Firebase may not allow custom Action URLs for password reset
- The redirect URL is set in code via `actionCodeSettings.url`
- This is already configured in `frontend/src/app/forgot-password/page.tsx`

## TESTING AFTER CONFIGURATION

1. Request a new password reset email
2. Check the email link format
3. Click the link
4. Check browser console for logs
5. Verify code extraction works

## CURRENT CODE CONFIGURATION

The code is already configured to:
- ✅ Use `/auth/action` as the redirect URL
- ✅ Extract code from multiple sources (URL, referrer, sessionStorage)
- ✅ Show manual entry form if code not found
- ✅ Handle errors gracefully

## NEXT STEPS

1. ✅ Verify Firebase Console settings (follow checklist above)
2. ✅ Test with fresh reset email
3. ✅ Check browser console logs
4. ✅ Use manual entry form if automatic extraction fails

