# Email Configuration Guide for Production

## Overview

Currently, your app uses Firebase's `sendEmailVerification()` which sends emails from Firebase's default sender. For production with your custom domain `www.happybirthdaymate.com`, you have two options:

1. **Configure Firebase to use your custom domain** (Easier, for verification emails)
2. **Use a dedicated email service** (Better control, for all transactional emails)

---

## Option 1: Configure Firebase Custom Domain (Recommended for Start)

### Step 1: Configure Firebase Email Templates

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **happy-birthday-mate-7f498**
3. Go to **Authentication** → **Templates** tab
4. Click on **Email address verification** template
5. Customize (Note: Message/HTML body may be read-only in some Firebase projects):
   - **Sender name**: "Happy Birthday Mate"
   - **Subject**: "Verify your email address - Happy Birthday Mate 🎉"
   - **From**: Click "Customize domain" → Set to `noreply@happybirthdaymate.com`
   - **Reply to**: `support@happybirthdaymate.com` (set this up first - see below)
   - **Email body**: May be read-only - Firebase uses default template with your branding

**Important**: If the message field is not editable, Firebase uses its default template. For full HTML customization, consider using a dedicated email service (Option 2 below).

### Step 2: Set Up Custom Domain in Firebase

1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your domain: `happybirthdaymate.com` and `www.happybirthdaymate.com`
3. This allows Firebase to send emails from your domain

### Step 3: Configure DNS Records for Email Authentication

Add these DNS records to your domain provider (where you bought happybirthdaymate.com):

#### SPF Record (Sender Policy Framework)
```
Type: TXT
Name: @ (or leave blank)
Value: v=spf1 include:_spf.firebase.com ~all
TTL: 3600
```

#### DKIM Record (DomainKeys Identified Mail)
Firebase will provide you with DKIM records. To get them:
1. Go to Firebase Console → **Authentication** → **Settings** → **Email templates**
2. Look for "Domain verification" section
3. Firebase will provide DNS records to add

#### DMARC Record (Domain-based Message Authentication)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@happybirthdaymate.com
TTL: 3600
```

**Note**: Start with `p=none` (monitoring mode), then move to `p=quarantine` or `p=reject` after verifying everything works.

### Step 4: Verify Domain in Firebase

1. After adding DNS records, wait 24-48 hours for propagation
2. In Firebase Console, verify your domain
3. Firebase will send verification emails from your custom domain

---

## Option 2: Dedicated Email Service (Recommended for Scale)

For better control, deliverability, and analytics, use a dedicated email service:

### Recommended Services:

1. **Resend** (Recommended - Modern, Developer-friendly)
   - Free tier: 3,000 emails/month
   - Great API, React Email templates
   - Easy setup

2. **SendGrid** (Popular, reliable)
   - Free tier: 100 emails/day
   - Good deliverability
   - Extensive features

3. **AWS SES** (Cost-effective at scale)
   - Very cheap ($0.10 per 1,000 emails)
   - Requires AWS setup
   - Good for high volume

### Implementation with Resend (Example)

#### Step 1: Install Resend

```bash
cd backend
pip install resend
```

#### Step 2: Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your domain `happybirthdaymate.com`
4. Add DNS records (Resend will provide them)

#### Step 3: Add to Environment Variables

Add to `backend/.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@happybirthdaymate.com
EMAIL_FROM_NAME=Happy Birthday Mate
```

#### Step 4: Create Email Service

Create `backend/app/services/email_service.py`:
```python
import resend
import os
from typing import Optional

resend.api_key = os.getenv("RESEND_API_KEY")

class EmailService:
    @staticmethod
    async def send_verification_email(
        email: str,
        verification_link: str,
        user_name: str
    ):
        """Send email verification email"""
        try:
            params = {
                "from": f"{os.getenv('EMAIL_FROM_NAME')} <{os.getenv('EMAIL_FROM')}>",
                "to": [email],
                "subject": "Verify your email address - Happy Birthday Mate",
                "html": f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .button {{ display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }}
                        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Welcome to Happy Birthday Mate! 🎉</h1>
                        <p>Hi {user_name},</p>
                        <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
                        <a href="{verification_link}" class="button">Verify Email Address</a>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #6366f1;">{verification_link}</p>
                        <p>This link will expire in 24 hours.</p>
                        <div class="footer">
                            <p>If you didn't create an account, please ignore this email.</p>
                            <p>© 2024 Happy Birthday Mate. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
            }
            email_response = resend.Emails.send(params)
            return {"success": True, "id": email_response["id"]}
        except Exception as e:
            print(f"Error sending email: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    async def send_birthday_notification(email: str, user_name: str):
        """Send birthday notification email"""
        # Similar implementation
        pass
    
    @staticmethod
    async def send_gift_notification(email: str, sender_name: str, gift_name: str):
        """Send gift received notification"""
        # Similar implementation
        pass
```

#### Step 5: Update Backend to Use Email Service

For email verification, you'll need to generate verification links using Firebase Admin SDK and send via Resend.

---

## Current Implementation Status

### ✅ What's Working:
- Firebase `sendEmailVerification()` sends emails (from Firebase's default domain)
- Emails reach recipients' inboxes
- Email verification flow works

### ⚠️ What Needs Configuration:
- Custom domain branding (emails come from Firebase domain, not yours)
- Email templates customization
- DNS records for email authentication (SPF, DKIM, DMARC)

---

## Quick Start: Firebase Custom Domain Setup

**Minimum steps to get custom domain emails working:**

1. **Add authorized domain in Firebase:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add: `happybirthdaymate.com` and `www.happybirthdaymate.com`

2. **Add SPF record to your DNS:**
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.firebase.com ~all
   ```

3. **Customize email templates:**
   - Firebase Console → Authentication → Templates
   - Customize "Email address verification" template
   - Add your branding, colors, logo

4. **Wait 24-48 hours** for DNS propagation

5. **Test:** Create a new account and verify the email comes from your domain

---

## For Vercel & Railway Deployment

### Vercel (Frontend):
- No email configuration needed on Vercel
- Emails are sent from Firebase/Resend servers
- Just ensure environment variables are set:
  ```env
  NEXT_PUBLIC_FIREBASE_API_KEY=...
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
  # etc.
  ```

### Railway (Backend):
- Set environment variables in Railway dashboard:
  ```env
  RESEND_API_KEY=... (if using Resend)
  EMAIL_FROM=noreply@happybirthdaymate.com
  EMAIL_FROM_NAME=Happy Birthday Mate
  ```
- No special email configuration needed
- Backend sends emails via API (Resend/SendGrid/etc.)

---

## Setting Up support@happybirthdaymate.com

You need email hosting for your domain to receive replies. Here are your options:

### Option 1: Email Forwarding (Simplest - Free)
1. Go to your domain registrar (where you bought happybirthdaymate.com)
2. Look for "Email Forwarding" or "Email Aliases" in DNS/Email settings
3. Create forward: `support@happybirthdaymate.com` → `your-personal-email@gmail.com`
4. Replies will forward to your personal email

### Option 2: Zoho Mail (Free Tier - Recommended)
1. Sign up at [zoho.com/mail](https://www.zoho.com/mail/)
2. Choose "Mail for Your Domain"
3. Add domain: `happybirthdaymate.com`
4. Verify domain (add DNS records they provide)
5. Create email account: `support@happybirthdaymate.com`
6. Access via webmail or configure email client

**Free tier includes**: 5GB storage, 5 email accounts

### Option 3: Google Workspace (Paid - $6/user/month)
- Professional Gmail for your domain
- More features and storage
- Sign up at [workspace.google.com](https://workspace.google.com/)

### Option 4: Microsoft 365 (Paid)
- Outlook-based email hosting
- Similar to Google Workspace

**Quick Start**: Use email forwarding (Option 1) for now, upgrade to Zoho Mail later if needed.

---

## Testing Email Delivery

1. **Check spam folder** - New domains often go to spam initially
2. **Use email testing tools:**
   - [Mail Tester](https://www.mail-tester.com/) - Test email deliverability
   - [MXToolbox](https://mxtoolbox.com/) - Check DNS records
3. **Monitor email logs:**
   - Firebase Console → Authentication → Users → Check email logs
   - Resend Dashboard → Emails → View delivery status

---

## Next Steps

1. **Immediate:** Configure Firebase custom domain (Option 1)
2. **Short-term:** Add DNS records (SPF, DKIM, DMARC)
3. **Long-term:** Consider migrating to Resend/SendGrid for better control

---

## Support

If emails aren't reaching inboxes:
1. Check DNS records are correct (use MXToolbox)
2. Verify domain in Firebase/Resend
3. Check spam folder
4. Test with different email providers (Gmail, Outlook, etc.)
5. Review email service logs for delivery issues

