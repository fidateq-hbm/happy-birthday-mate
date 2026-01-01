# Fixing Password Reset Link Expiration Issue

## The Problem

Password reset links are expiring immediately or very quickly after being sent.

## Root Causes

1. **Code Storage Issue** ✅ FIXED - Code wasn't being stored properly, causing re-reads
2. **Firebase Expiration Settings** - May need adjustment in Firebase Console
3. **Link Format** - Need to ensure correct redirect URL

## Solutions Applied

### 1. Code Storage Fix (✅ Implemented)

- Store `oobCode` in state immediately when page loads
- Use stored code for reset (not re-reading from URL)
- Prevent multiple verifications

### 2. Firebase Console Configuration

**Check Password Reset Template Expiration:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **happy-birthday-mate-7f498**
3. Go to **Authentication** → **Templates** tab
4. Click on **Password reset** template
5. Look for **"Expire after"** setting
6. **Increase it to at least 3 hours** (or 24 hours for better UX)
7. Click **Save**

**Default expiration is often 1 hour** - this might be too short if users don't check email immediately.

### 3. Verify Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Make sure your domain is listed:
   - `localhost` (for development)
   - `happybirthdaymate.com` (for production)
   - `www.happybirthdaymate.com` (for production)

### 4. Check Action Code Settings

The reset link should redirect to:
- Development: `http://localhost:3000/reset-password`
- Production: `https://happybirthdaymate.com/reset-password` or `https://www.happybirthdaymate.com/reset-password`

## Testing Steps

1. Request password reset
2. **Immediately** click the link in email
3. Enter new password
4. Should work without expiration error

## If Still Expiring

### Option A: Increase Expiration Time
- Firebase Console → Authentication → Templates → Password reset
- Set "Expire after" to **24 hours** or longer

### Option B: Check Email Link Format
- The link should contain `oobCode` and `mode=resetPassword`
- Format: `https://your-domain.com/reset-password?oobCode=...&mode=resetPassword`

### Option C: Verify Domain Authorization
- Make sure your production domain is in authorized domains
- Unauthorized domains can cause immediate expiration

## Common Issues

1. **Link clicked twice** - Firebase links are single-use
2. **Wrong domain** - Link must match authorized domain
3. **Expiration too short** - Increase in Firebase Console
4. **Code re-read** - Fixed by storing code in state

## Quick Fix Checklist

- [x] Store oobCode in state (✅ Fixed in code)
- [ ] Increase expiration time in Firebase Console (3+ hours)
- [ ] Verify authorized domains include production domain
- [ ] Test with fresh reset link
- [ ] Check email link format is correct

