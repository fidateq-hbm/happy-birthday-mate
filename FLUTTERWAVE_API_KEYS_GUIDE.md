# How to Get Your Flutterwave API Keys - Step-by-Step Guide

## Prerequisites
- A Flutterwave account (sign up at https://dashboard.flutterwave.com if you don't have one)
- Your account must be verified and approved

---

## Step 1: Log in to Flutterwave Dashboard

1. Go to **https://dashboard.flutterwave.com**
2. Enter your email and password
3. Click **"Log in"**

---

## Step 2: Navigate to API Keys Section

### Option A: Via Settings Menu
1. Click on your **profile icon** (top right corner)
2. Select **"Settings"** from the dropdown menu
3. In the left sidebar, click on **"API Keys"**

### Option B: Direct Navigation
1. Look for **"Settings"** in the main navigation menu
2. Click on **"Settings"**
3. Click on **"API Keys"** in the sidebar

---

## Step 3: Choose Your Environment

Flutterwave provides two sets of keys:

### 🔵 Test Mode (Sandbox)
- Use for **development and testing**
- No real money is processed
- Perfect for testing your integration

### 🟢 Live Mode (Production)
- Use for **real transactions**
- Processes actual payments
- Only use after thorough testing

**Important:** You'll see a toggle or tabs to switch between "Test" and "Live" modes.

---

## Step 4: Get Your API Keys

Once you're in the API Keys section, you'll see the following keys:

### 1. **Public Key** (`FLUTTERWAVE_PUBLIC_KEY`)
- **Location:** Usually displayed as "Public Key" or "Public API Key"
- **Format:** Starts with `FLWPUBK-` (test) or `FLWPUBK-` (live)
- **Example:** `FLWPUBK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Usage:** Can be used in frontend (though we use it in backend for some operations)

### 2. **Secret Key** (`FLUTTERWAVE_SECRET_KEY`) ⚠️ **MOST IMPORTANT**
- **Location:** Usually displayed as "Secret Key" or "Secret API Key"
- **Format:** Starts with `FLWSECK-` (test) or `FLWSECK-` (live)
- **Example:** `FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Usage:** Used for backend API calls - **NEVER expose this publicly!**

### 3. **Encryption Key** (`FLUTTERWAVE_ENCRYPTION_KEY`) - Optional
- **Location:** May be under "Security" or "Encryption" section
- **Format:** Usually a long string
- **Usage:** For additional security (optional but recommended)

### 4. **Webhook Hash** (`FLUTTERWAVE_WEBHOOK_HASH`) - For Webhooks
- **Location:** Go to **Settings > Webhooks**
- **Format:** A hash string
- **Usage:** For verifying webhook signatures

---

## Step 5: Copy Your Keys

1. **Click the "Copy" button** next to each key (or click to reveal, then copy)
2. **Store them securely** - you'll need them for your environment variables

---

## Step 6: Set Up Webhook (For Payment Verification)

### 6.1 Navigate to Webhooks
1. Go to **Settings > Webhooks** (or **Developers > Webhooks**)
2. Click **"Add Webhook"** or **"Create Webhook"**

### 6.2 Configure Webhook
1. **Webhook URL:** Enter your backend webhook endpoint:
   ```
   https://your-backend-url.com/api/payments/webhook/flutterwave
   ```
   - For Render: `https://your-app-name.onrender.com/api/payments/webhook/flutterwave`
   - For local testing: Use a tool like ngrok to expose your local server

2. **Select Events:** Check the following events:
   - ✅ `charge.completed` - When payment is successful
   - ✅ `charge.failed` - When payment fails

3. **Secret Hash:** After creating, Flutterwave will generate a secret hash
   - Copy this as your `FLUTTERWAVE_WEBHOOK_HASH`

### 6.3 Save Webhook
- Click **"Save"** or **"Create Webhook"**
- Your webhook is now active

---

## Step 7: Add Keys to Your Project

### For Local Development (.env file)

Create or update `backend/.env`:

```bash
# Flutterwave Configuration - TEST MODE
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=your_encryption_key_here
FLUTTERWAVE_WEBHOOK_HASH=your_webhook_hash_here

# Frontend URL (for payment redirects)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### For Production (Render Environment Variables)

1. Go to your **Render Dashboard**
2. Select your **backend service**
3. Go to **Environment** tab
4. Click **"Add Environment Variable"**
5. Add each variable:

```
FLUTTERWAVE_PUBLIC_KEY = FLWPUBK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY = FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY = your_encryption_key_here
FLUTTERWAVE_WEBHOOK_HASH = your_webhook_hash_here
NEXT_PUBLIC_FRONTEND_URL = https://www.happybirthdaymate.com
```

**Important:** 
- Use **TEST keys** for development
- Use **LIVE keys** for production
- Never commit keys to Git!

---

## Step 8: Verify Your Setup

### Test Your Integration

1. **Start your backend server**
2. **Try to send a gift** from your frontend
3. **Check the payment flow:**
   - You should be redirected to Flutterwave payment page
   - Complete a test payment
   - Verify webhook receives the event

### Test Cards (Test Mode Only)

Flutterwave provides test cards for testing:
- **Successful Payment:** `5531886652142950`
- **CVV:** `564`
- **Expiry:** Any future date (e.g., `12/25`)
- **Pin:** `3310`
- **OTP:** `123456`

**Test Card Details:** https://developer.flutterwave.com/docs/test-cards

---

## Security Best Practices

### ✅ DO:
- Store keys in environment variables only
- Use different keys for test and production
- Rotate keys periodically
- Verify webhook signatures
- Use HTTPS in production
- Keep secret keys secret!

### ❌ DON'T:
- Commit keys to Git
- Share keys publicly
- Use production keys in development
- Expose secret keys in frontend code
- Hardcode keys in your source code

---

## Troubleshooting

### Issue: "Invalid API Key"
- **Solution:** Check that you copied the entire key (no spaces, no extra characters)
- Verify you're using the correct environment (test vs live)

### Issue: "Webhook not receiving events"
- **Solution:** 
  - Verify webhook URL is correct and accessible
  - Check that webhook is enabled in Flutterwave dashboard
  - Ensure your backend endpoint is publicly accessible (use ngrok for local testing)

### Issue: "Payment redirect not working"
- **Solution:**
  - Verify `NEXT_PUBLIC_FRONTEND_URL` is set correctly
  - Check that redirect URL in payment initialization matches your frontend URL

### Issue: "Cannot find API Keys section"
- **Solution:**
  - Ensure your account is fully verified
  - Check that you have the correct permissions
  - Contact Flutterwave support if needed

---

## Additional Resources

- **Flutterwave Documentation:** https://developer.flutterwave.com/docs
- **API Reference:** https://developer.flutterwave.com/reference
- **Support:** support@flutterwave.com
- **Status Page:** https://status.flutterwave.com

---

## Quick Checklist

- [ ] Logged into Flutterwave Dashboard
- [ ] Navigated to Settings > API Keys
- [ ] Copied Public Key
- [ ] Copied Secret Key
- [ ] Copied Encryption Key (optional)
- [ ] Set up Webhook
- [ ] Copied Webhook Hash
- [ ] Added keys to `.env` file (local)
- [ ] Added keys to Render environment variables (production)
- [ ] Tested payment flow
- [ ] Verified webhook is working

---

## Need Help?

If you encounter any issues:
1. Check Flutterwave documentation
2. Review your environment variables
3. Check backend logs for error messages
4. Contact Flutterwave support

**Remember:** Always test thoroughly in test mode before switching to live mode!

