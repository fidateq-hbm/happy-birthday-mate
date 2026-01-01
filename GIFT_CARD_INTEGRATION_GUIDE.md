# Gift Card Integration Guide

## Current Status

**⚠️ IMPORTANT**: The gift cards in the catalog are **NOT REAL** yet. They are placeholders. The system is set up to handle real gift cards, but you need to integrate with a gift card API provider.

## How Gift Cards Work

When a user purchases a gift card gift:
1. User selects a gift card (e.g., "Amazon Gift Card $25")
2. User completes payment via Stripe/PayPal/Paystack
3. **After payment confirmation**, the system should:
   - Call a gift card API to purchase the actual gift card
   - Receive the gift card code and redemption URL
   - Store the code in the database
   - Deliver it to the recipient

## Integration Options

### Option 1: Tango Card API (Recommended)
**Best for**: Multiple brands, easy integration, good documentation

- **Website**: https://www.tangocard.com/
- **Pros**: 
  - Supports 1000+ brands (Amazon, Netflix, Spotify, etc.)
  - Simple API
  - Good documentation
  - Sandbox environment for testing
- **Cons**: 
  - Requires business verification
  - Minimum funding requirements
- **Pricing**: Pay-as-you-go, typically 3-5% markup
- **Setup**:
  1. Sign up for Tango Card account
  2. Complete business verification
  3. Get API credentials
  4. Fund your account
  5. Implement integration in `backend/app/services/gift_card_service.py`

### Option 2: Giftbit API
**Best for**: Flexible gift card marketplace

- **Website**: https://www.giftbit.com/
- **Pros**: 
  - Good API documentation
  - Multiple brands
  - Webhook support
- **Cons**: 
  - Business verification required
  - May have higher fees
- **Pricing**: Varies by brand, typically 5-10% markup

### Option 3: Direct Provider APIs
**Best for**: Specific brands only

Some providers offer direct APIs:
- **Amazon**: Amazon Pay Gift Cards API (requires Amazon Pay merchant account)
- **Netflix**: No public API (must use aggregators)
- **Spotify**: No public API (must use aggregators)
- **Apple**: Apple Gift Card API (requires Apple Developer Enterprise account)

**Note**: Most providers don't offer direct APIs, so aggregators are usually the best option.

### Option 4: Manual Fulfillment (Not Recommended)
**Best for**: Testing only

- Manually purchase gift cards
- Store codes in database
- Manually send to recipients
- **Not scalable** for production

## Implementation Steps

### Step 1: Choose a Provider
Recommendation: **Tango Card** for the best balance of features, pricing, and ease of integration.

### Step 2: Sign Up and Get Credentials
1. Create account with chosen provider
2. Complete business verification
3. Get API keys/credentials
4. Test in sandbox environment

### Step 3: Add Credentials to Environment
Add to `backend/.env`:
```env
# Tango Card (example)
TANGO_CARD_API_KEY=your_api_key
TANGO_CARD_PLATFORM_NAME=your_platform_name
TANGO_CARD_PLATFORM_KEY=your_platform_key
TANGO_CARD_ENV=sandbox  # or 'production'
```

### Step 4: Install SDK/Dependencies
```bash
# For Tango Card
pip install tangocard-sdk

# Or use requests for REST API
pip install requests
```

### Step 5: Implement Gift Card Service
Update `backend/app/services/gift_card_service.py` with actual API calls.

### Step 6: Integrate with Payment Flow
Update `backend/app/api/routes/gifts.py` to call the gift card service after payment confirmation.

### Step 7: Add Webhook Handler
Set up webhooks to receive delivery status updates from the gift card provider.

### Step 8: Test Thoroughly
- Test in sandbox environment
- Test various gift card amounts
- Test error handling
- Test delivery to recipients

## Current Database Structure

The database is already set up to store gift card information:

```python
# Gift model has these fields:
gift_card_code = Column(String, nullable=True)  # The actual gift card code
gift_card_provider = Column(String, nullable=True)  # e.g., "amazon", "netflix"
```

## Example Integration Code (Tango Card)

```python
from tangocard import TangoCardClient
import os

class GiftCardService:
    def __init__(self):
        self.client = TangoCardClient(
            api_key=os.getenv("TANGO_CARD_API_KEY"),
            platform_name=os.getenv("TANGO_CARD_PLATFORM_NAME"),
            platform_key=os.getenv("TANGO_CARD_PLATFORM_KEY"),
            environment=os.getenv("TANGO_CARD_ENV", "sandbox")
        )
    
    async def purchase_gift_card(self, provider, amount, recipient_email, message):
        # Map provider to Tango Card catalog item
        catalog_map = {
            "amazon": "amazon-egift",
            "netflix": "netflix-egift",
            "spotify": "spotify-egift",
            # ... etc
        }
        
        catalog_item = catalog_map.get(provider.value)
        if not catalog_item:
            return {"success": False, "error": f"Provider {provider} not supported"}
        
        # Create order
        try:
            order = await self.client.create_order(
                account_identifier=catalog_item,
                amount=int(amount * 100),  # Convert to cents
                recipient_email=recipient_email,
                message=message
            )
            
            return {
                "success": True,
                "gift_card_code": order.gift_card_code,
                "gift_card_url": order.gift_card_url,
                "provider_reference": order.order_id
            }
        except Exception as e:
            logger.error(f"Failed to purchase gift card: {e}")
            return {"success": False, "error": str(e)}
```

## Cost Considerations

- **Gift Card Markup**: Most providers charge 3-10% markup on gift card value
- **Example**: $25 Amazon gift card might cost you $26.25
- **Pricing Strategy**: 
  - Option A: Pass markup to customer (charge $26.25 for $25 card)
  - Option B: Absorb markup (charge $25, you pay $26.25)
  - Option C: Add service fee on top

## Security Considerations

1. **Never expose gift card codes in API responses** - only send via secure email
2. **Validate recipient email** before purchasing
3. **Implement rate limiting** to prevent abuse
4. **Log all transactions** for audit purposes
5. **Handle refunds** properly if gift card purchase fails

## Next Steps

1. **For Development/Testing**: 
   - Use sandbox environment
   - Test with small amounts
   - Verify delivery flow

2. **For Production**:
   - Complete business verification
   - Fund provider account
   - Set up webhooks
   - Monitor transactions
   - Implement error handling and retries

## Questions?

- Check provider documentation
- Contact provider support
- Review `backend/app/services/gift_card_service.py` for implementation structure

