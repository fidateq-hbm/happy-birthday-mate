# Flutterwave Payment Gateway Setup Guide

## Environment Variables Required

Add these to your backend `.env` file and Render environment variables:

```bash
# Flutterwave Configuration
FLUTTERWAVE_PUBLIC_KEY=your_public_key_here
FLUTTERWAVE_SECRET_KEY=your_secret_key_here
FLUTTERWAVE_ENCRYPTION_KEY=your_encryption_key_here  # Optional but recommended
FLUTTERWAVE_WEBHOOK_HASH=your_webhook_hash_here  # For webhook signature verification

# Frontend URL (for payment redirects)
NEXT_PUBLIC_FRONTEND_URL=https://www.happybirthdaymate.com
```

## Getting Your Flutterwave Keys

1. **Log in to Flutterwave Dashboard**: https://dashboard.flutterwave.com
2. **Go to Settings > API Keys**
3. **Copy your keys**:
   - **Public Key**: Used for frontend (if needed)
   - **Secret Key**: Used for backend API calls
   - **Encryption Key**: For additional security (optional)

## Webhook Setup

1. **In Flutterwave Dashboard**: Go to Settings > Webhooks
2. **Add Webhook URL**: 
   ```
   https://your-backend-url.com/api/payments/webhook/flutterwave
   ```
3. **Select Events**: 
   - `charge.completed`
   - `charge.failed`
4. **Copy Webhook Hash**: This is your `FLUTTERWAVE_WEBHOOK_HASH`

## Testing

### Test Mode
- Use Flutterwave test keys for development
- Test cards: https://developer.flutterwave.com/docs/test-cards

### Production Mode
- Switch to live keys in production
- Update webhook URL to production backend

## Payment Flow

1. User selects gift and recipient
2. Backend creates gift transaction
3. Backend initializes Flutterwave payment
4. User redirected to Flutterwave payment page
5. User completes payment
6. Flutterwave redirects to callback page
7. Webhook verifies payment and activates gift
8. User sees success message

## Security Notes

- Never expose secret keys in frontend code
- Always verify webhook signatures
- Use HTTPS in production
- Store keys securely in environment variables

