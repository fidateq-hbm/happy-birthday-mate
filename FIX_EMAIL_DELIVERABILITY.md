# Fix Email Deliverability - Emails Going to Spam

## Problem
Firebase emails are sometimes going to inbox, sometimes to spam. This is a common issue with Firebase's default email sending.

## Root Causes

1. **No SPF/DKIM/DMARC Records**: Firebase emails come from `firebaseapp.com` domain, which may not have proper authentication records
2. **Default Firebase Sender**: Using Firebase's default sender domain triggers spam filters
3. **Email Content**: Generic subject lines and content can trigger spam filters
4. **No Reputation**: New Firebase projects have no email reputation

## Solutions

### Solution 1: Configure Firebase Custom Domain (Recommended for Production)

This allows emails to come from your domain (`happybirthdaymate.com`) instead of Firebase's domain.

#### Step 1: Add Authorized Domain
1. Go to Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains"
3. Add: `happybirthdaymate.com` and `www.happybirthdaymate.com`

#### Step 2: Configure DNS Records
Add these DNS records to your domain provider (Namecheap):

**SPF Record:**
```
Type: TXT
Name: @ (or leave blank)
Value: v=spf1 include:_spf.firebase.com ~all
TTL: 3600
```

**DKIM Record:**
Firebase will provide this. Check Firebase Console → Authentication → Settings → Email templates → Customize domain

**DMARC Record (Optional but recommended):**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@happybirthdaymate.com
TTL: 3600
```

#### Step 3: Customize Email Templates
1. Firebase Console → Authentication → Templates
2. Click on "Email address verification" template
3. Customize:
   - **Sender name**: "Happy Birthday Mate" (not "Your project-416302385333 team")
   - **Subject**: Remove "***SPAM***" prefix if present
   - **From**: Set to `noreply@happybirthdaymate.com` (after DNS setup)
   - **Reply to**: `support@happybirthdaymate.com`

### Solution 2: Use Dedicated Email Service (Best for Production)

For better deliverability, use a dedicated email service like **Resend** or **SendGrid**.

#### Using Resend (Recommended)

1. **Sign up**: https://resend.com
2. **Verify domain**: Add DNS records provided by Resend
3. **Get API key**: From Resend dashboard
4. **Update backend**: Use Resend API instead of Firebase emails

**Backend Integration:**
```python
# backend/app/services/email_service.py
import resend

resend.api_key = os.getenv("RESEND_API_KEY")

def send_verification_email(to: str, verification_link: str):
    resend.Emails.send({
        "from": "Happy Birthday Mate <noreply@happybirthdaymate.com>",
        "to": to,
        "subject": "Verify your email - Happy Birthday Mate 🎉",
        "html": f"""
        <h1>Welcome to Happy Birthday Mate!</h1>
        <p>Click the link below to verify your email:</p>
        <a href="{verification_link}">Verify Email</a>
        """
    })
```

### Solution 3: Improve Email Content (Quick Fix)

Even with Firebase, you can improve deliverability:

1. **Customize Subject Line**:
   - Remove "***SPAM***" prefix
   - Use: "Welcome! Verify your email to start celebrating 🎉"
   - Avoid spam trigger words: "free", "urgent", "click here"

2. **Customize Sender Name**:
   - Change from "Your project-416302385333 team"
   - To: "Happy Birthday Mate"

3. **Add Unsubscribe Link** (if required by law in your region)

### Solution 4: Warm Up Email Domain

If using a new domain:
1. Start with low volume
2. Gradually increase email sending
3. Monitor bounce rates
4. Build reputation over time

## Immediate Actions

### 1. Fix Firebase Email Template
1. Go to Firebase Console → Authentication → Templates
2. Click "Email address verification"
3. Change **Sender name** to: "Happy Birthday Mate"
4. Change **Subject** to: "Verify your email - Happy Birthday Mate 🎉"
5. Remove any "***SPAM***" prefixes

### 2. Check Authorized Domains
1. Firebase Console → Authentication → Settings
2. Verify `happybirthdaymate.com` is in authorized domains
3. Add if missing

### 3. Monitor Email Delivery
- Check spam folder regularly
- Ask users to mark as "Not spam" if it goes to junk
- Monitor Firebase Console → Authentication → Users for verification rates

## Long-term Solution

For production, **use Resend or SendGrid**:
- Better deliverability (95%+ inbox rate)
- Custom domain emails
- Better analytics
- More control over email content
- Professional appearance

## Testing

After making changes:
1. Send test verification email
2. Check if it goes to inbox or spam
3. If spam, check email headers for authentication failures
4. Adjust DNS records if needed

## Current Status

✅ **Code**: Email sending works correctly
⚠️ **Deliverability**: Needs DNS configuration or dedicated email service
✅ **Templates**: Can be customized in Firebase Console

## Next Steps

1. **Immediate**: Customize Firebase email templates (remove "***SPAM***", change sender name)
2. **Short-term**: Add SPF/DKIM records for custom domain
3. **Long-term**: Consider Resend/SendGrid for better deliverability

