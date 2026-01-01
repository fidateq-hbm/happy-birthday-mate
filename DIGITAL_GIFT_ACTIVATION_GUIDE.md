# Digital Gift Activation Guide

## Overview

Our platform offers **5 types of digital gifts** that are owned and controlled by the platform. Unlike third-party gift cards, these gifts are **instant and don't require external APIs**. They activate immediately after payment is confirmed.

## Digital Gift Types

### 1. 💌 Digital Cards
**What it is**: Animated digital birthday cards with personalized messages

**How it works**:
- After payment, the card is delivered to the recipient
- Recipient can view the card in their "Received Gifts" section
- Card includes the sender's message and beautiful animations
- Cards don't expire - they're permanently viewable

**Implementation**:
- Stored in database as a delivered gift
- Frontend displays the card when recipient views their gifts
- Can include animated effects, music, or interactive elements

### 2. ✨ Confetti Effects
**What it is**: Animated confetti effect that appears on the recipient's profile

**How it works**:
- Activates immediately after payment
- Effect appears when someone visits the recipient's profile
- Lasts for **24 hours** from delivery time
- Multiple confetti effects can stack (if multiple people send them)

**Implementation**:
- Check for active confetti effects when displaying profile
- Use `GET /api/gifts/active/{user_id}` to get active effects
- Frontend triggers confetti animation based on active gifts
- Automatically expires after 24 hours

### 3. 🌟 Wall Highlights
**What it is**: Special frame/border around a photo on the recipient's birthday wall

**How it works**:
- If birthday wall exists: Applied to the most recent photo
- If no wall exists: Applied when wall is created
- If no photos exist: Applied to the next uploaded photo
- Highlight lasts for **48 hours** from delivery time

**Implementation**:
- Check for active wall highlights when displaying birthday wall
- Apply special CSS/styling to highlighted photos
- Different highlight types based on gift name (golden, crystal, etc.)
- Automatically expires after 48 hours

### 4. 🏆 Celebrant Badges
**What it is**: Special badge displayed on the recipient's profile

**How it works**:
- Badge appears on profile header/avatar area
- Badge type determined by gift name (golden, diamond, platinum, etc.)
- Lasts for **24 hours** from delivery time
- Multiple badges can be displayed (most recent takes priority)

**Implementation**:
- Check for active badges when displaying profile
- Display badge icon/overlay based on badge type
- Badge types: golden, diamond, platinum, royal, star, legend, champion, superstar, hero, magical
- Automatically expires after 24 hours

### 5. 📌 Featured Messages
**What it is**: Pinned message at the top of the recipient's tribe room

**How it works**:
- Message is pinned at the top of the tribe room
- Includes sender's name and personalized message
- Lasts for **24 hours** from delivery time
- If room doesn't exist yet, message is pinned when room opens

**Implementation**:
- Check for active featured messages when displaying tribe room
- Display pinned message at top of message list
- Show sender info and message content
- Automatically expires after 24 hours

## Activation Flow

### Step 1: Payment Confirmation
When payment is confirmed (via Stripe/PayPal/Paystack webhook):

```python
# Payment webhook handler calls:
POST /api/gifts/activate/{gift_id}
```

### Step 2: Gift Activation
The system automatically:
1. Checks gift type
2. Activates the appropriate effect/feature
3. Marks gift as delivered
4. Sets expiration time (if applicable)

### Step 3: Display
Frontend checks for active gifts:
```typescript
// Get active gifts for a user
GET /api/gifts/active/{user_id}

// Response:
{
  "confetti_effects": [...],
  "badges": [...],
  "wall_highlights": [...],
  "featured_messages": [...],
  "digital_cards": [...]
}
```

## API Endpoints

### Activate Gift (Internal/Webhook)
```
POST /api/gifts/activate/{gift_id}
```
Called by payment webhook after payment confirmation.

**Response**:
```json
{
  "success": true,
  "message": "Confetti effect activated",
  "action": "show_confetti",
  "expires_at": "2024-01-02T12:00:00Z"
}
```

### Get Active Gifts
```
GET /api/gifts/active/{user_id}
```
Returns all currently active digital gifts for a user.

**Response**:
```json
{
  "confetti_effects": [
    {
      "gift_id": 123,
      "gift_name": "Golden Confetti Blast",
      "delivered_at": "2024-01-01T12:00:00Z",
      "expires_at": "2024-01-02T12:00:00Z"
    }
  ],
  "badges": [
    {
      "gift_id": 124,
      "gift_name": "Diamond Celebrant Badge",
      "badge_type": "diamond",
      "delivered_at": "2024-01-01T12:00:00Z",
      "expires_at": "2024-01-02T12:00:00Z"
    }
  ],
  "wall_highlights": [...],
  "featured_messages": [...],
  "digital_cards": [...]
}
```

## Frontend Integration

### Displaying Active Gifts

#### 1. Confetti Effects
```typescript
// In profile page
const { data: activeGifts } = await api.get(`/api/gifts/active/${userId}`);

if (activeGifts.confetti_effects.length > 0) {
  // Trigger confetti animation
  triggerConfettiAnimation(activeGifts.confetti_effects);
}
```

#### 2. Badges
```typescript
// In profile header
const activeBadges = activeGifts.badges;
if (activeBadges.length > 0) {
  const latestBadge = activeBadges[0]; // Most recent
  return <BadgeIcon type={latestBadge.badge_type} />;
}
```

#### 3. Wall Highlights
```typescript
// In birthday wall photo grid
const highlightedPhotoIds = activeGifts.wall_highlights.map(h => h.photo_id);
photos.map(photo => (
  <Photo
    key={photo.id}
    highlighted={highlightedPhotoIds.includes(photo.id)}
    highlightType={getHighlightType(photo.id)}
  />
));
```

#### 4. Featured Messages
```typescript
// In tribe room
const featuredMessages = activeGifts.featured_messages;
return (
  <div>
    {featuredMessages.map(msg => (
      <FeaturedMessage key={msg.gift_id} message={msg} />
    ))}
    {regularMessages.map(msg => (
      <Message key={msg.id} message={msg} />
    ))}
  </div>
);
```

#### 5. Digital Cards
```typescript
// In received gifts page
const digitalCards = activeGifts.digital_cards;
return (
  <div>
    {digitalCards.map(card => (
      <DigitalCard key={card.gift_id} card={card} />
    ))}
  </div>
);
```

## Expiration Handling

All time-limited gifts automatically expire:
- **Confetti Effects**: 24 hours
- **Badges**: 24 hours
- **Wall Highlights**: 48 hours
- **Featured Messages**: 24 hours
- **Digital Cards**: Never expire

The backend automatically filters out expired gifts when calling `GET /api/gifts/active/{user_id}`.

## Cost Structure

Unlike gift cards (which require purchasing from third parties), digital gifts are **100% profit**:
- No external API costs
- No third-party fees
- Pure platform revenue
- Instant delivery
- No inventory management

## Next Steps

1. **Payment Integration**: Connect payment webhooks to call `/api/gifts/activate/{gift_id}`
2. **Frontend Display**: Implement UI components for each gift type
3. **Animations**: Create beautiful animations for confetti, badges, etc.
4. **Email Notifications**: Send email when digital gifts are received
5. **Analytics**: Track which gifts are most popular

## Summary

**Our digital gifts are instant and require no external APIs!** They activate immediately after payment and are displayed through the platform's own features. This makes them:
- ✅ Fast to deliver
- ✅ 100% profit margin
- ✅ No third-party dependencies
- ✅ Fully customizable
- ✅ Instant activation

The only gifts that require external APIs are the **third-party gift cards** (Amazon, Netflix, etc.), which need integration with services like Tango Card.

