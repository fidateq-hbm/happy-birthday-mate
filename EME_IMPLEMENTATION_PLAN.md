# Emotional Memory Economy (EME) - Implementation Plan

## Overview
This document outlines the implementation plan for transforming the Birthday Wall into the world's first Emotional Memory Economy (EME) platform.

## Current State Analysis
- ✅ Basic wall creation with themes
- ✅ Photo uploads (currently open to anyone with link)
- ✅ Photo reactions
- ✅ Wall archiving by year
- ❌ No invitation system
- ❌ No upload controls
- ❌ No drag-and-drop positioning
- ❌ No coin system
- ❌ No digital cards on walls
- ❌ No permanent gift objects

## Proposed Implementation Phases

### PHASE 1: Access Control & Upload Management (CRITICAL)
**Goal:** Implement opt-in upload model and invitation system

**Database Changes:**
1. Add to `BirthdayWall` model:
   - `uploads_enabled` (Boolean, default=False)
   - `upload_permission` (Enum: 'none', 'birthday_mates', 'invited_guests', 'both')
   - `is_sealed` (Boolean, default=False) - for immutability
   - `upload_paused` (Boolean, default=False)

2. Create `WallInvitation` model:
   - `wall_id` (ForeignKey)
   - `invited_user_id` (ForeignKey, nullable for guests)
   - `invited_email` (String, nullable for registered users)
   - `invitation_type` (Enum: 'birthday_mate', 'guest')
   - `invitation_code` (String, unique)
   - `invited_by_user_id` (ForeignKey)
   - `accepted_at` (DateTime, nullable)
   - `created_at` (DateTime)

3. Create `WallUpload` model (to track upload limits):
   - `wall_id` (ForeignKey)
   - `uploader_id` (ForeignKey, nullable for guests)
   - `uploader_email` (String, nullable)
   - `upload_type` (Enum: 'photo', 'card', 'gift')
   - `upload_count` (Integer, default=1)
   - `last_upload_at` (DateTime)

**API Endpoints:**
- `POST /api/rooms/birthday-wall/{wall_id}/invite` - Send invitation
- `GET /api/rooms/birthday-wall/{wall_id}/invitations` - List invitations
- `PATCH /api/rooms/birthday-wall/{wall_id}/upload-control` - Enable/pause/close uploads
- `GET /api/rooms/birthday-wall/{wall_id}/upload-status` - Check upload permissions
- `POST /api/rooms/birthday-wall/invite/accept/{code}` - Accept invitation

**Frontend Changes:**
- Wall Control Panel component (for celebrant)
- Invitation management UI
- Upload permission checks before allowing uploads

**Questions for You:**
1. Should birthday mates be automatically invited, or must celebrant explicitly invite each one?
2. How should invitations be sent? (Email, in-app notification, both?)
3. Should there be a limit on number of invitations?

---

### PHASE 2: Drag-and-Drop Canvas Interface
**Goal:** Transform wall into free-form creative canvas

**Database Changes:**
1. Add to `WallPhoto` model:
   - `position_x` (Float) - X coordinate on canvas
   - `position_y` (Float) - Y coordinate on canvas
   - `rotation` (Float, default=0) - Rotation angle in degrees
   - `scale` (Float, default=1.0) - Scale factor
   - `z_index` (Integer, default=0) - Layer order
   - `width` (Integer) - Display width in pixels
   - `height` (Integer) - Display height in pixels

**API Endpoints:**
- `PATCH /api/rooms/birthday-wall/{wall_id}/photos/{photo_id}/position` - Update position/rotation/scale
- `PATCH /api/rooms/birthday-wall/{wall_id}/photos/{photo_id}/layer` - Update z-index

**Frontend Changes:**
- Implement drag-and-drop using `react-draggable` or `@dnd-kit/core`
- Add rotation handles
- Add resize handles
- Save position on drag end
- Visual feedback during dragging

**Questions for You:**
1. Should only the celebrant be able to move items, or can uploaders move their own items?
2. Should there be snap-to-grid option, or completely free-form?
3. What should be the canvas size/dimensions?

---

### PHASE 3: Digital Cards System
**Goal:** Add interactive digital cards as wall objects

**Database Changes:**
1. Create `WallCard` model:
   - `wall_id` (ForeignKey)
   - `sender_id` (ForeignKey)
   - `sender_name` (String)
   - `card_type` (Enum: 'birthday', 'celebration', 'custom')
   - `message` (Text)
   - `card_design` (JSON) - Stores card visual design
   - `position_x` (Float)
   - `position_y` (Float)
   - `rotation` (Float)
   - `scale` (Float)
   - `z_index` (Integer)
   - `is_opened` (Boolean, default=False)
   - `opened_at` (DateTime, nullable)
   - `coins_attached` (Integer, default=0)
   - `created_at` (DateTime)

**API Endpoints:**
- `POST /api/rooms/birthday-wall/{wall_id}/cards` - Send/create card
- `GET /api/rooms/birthday-wall/{wall_id}/cards` - Get all cards
   - `PATCH /api/rooms/birthday-wall/{wall_id}/cards/{card_id}/open` - Mark as opened
   - `PATCH /api/rooms/birthday-wall/{wall_id}/cards/{card_id}/position` - Update position

**Frontend Changes:**
- Card creation UI
- Card display component (closed/opened states)
- Card opening animation
- Card positioning on wall

**Questions for You:**
1. Should cards be sent from the Gifts page, or directly from wall?
2. What card designs/templates should be available?
3. Should cards have animations when opened?

---

### PHASE 4: Celebration Gifts as Permanent Objects
**Goal:** Convert animated gifts into permanent wall objects

**Database Changes:**
1. Create `WallGift` model:
   - `wall_id` (ForeignKey)
   - `gift_id` (ForeignKey to Gift model)
   - `sender_id` (ForeignKey)
   - `gift_type` (String) - 'confetti', 'balloon', 'firework', etc.
   - `gift_visual` (JSON) - Stores visual representation
   - `position_x` (Float)
   - `position_y` (Float)
   - `rotation` (Float)
   - `scale` (Float)
   - `z_index` (Integer)
   - `coins_attached` (Integer, default=0)
   - `created_at` (DateTime)

**API Endpoints:**
- `POST /api/rooms/birthday-wall/{wall_id}/gifts` - Add gift to wall
- `GET /api/rooms/birthday-wall/{wall_id}/gifts` - Get all gifts
- `PATCH /api/rooms/birthday-wall/{wall_id}/gifts/{gift_id}/position` - Update position

**Frontend Changes:**
- Convert gift animations to static objects
- Gift positioning on wall
- Visual representation of each gift type

**Questions for You:**
1. Should gifts automatically appear on wall when sent, or require celebrant approval?
2. What visual style should each gift type have? (e.g., confetti = scattered particles, balloon = balloon icon)

---

### PHASE 5: Birthday Coins System
**Goal:** Implement Emotional Currency

**Database Changes:**
1. Create `CoinWallet` model:
   - `user_id` (ForeignKey, unique)
   - `balance` (Decimal, default=0)
   - `total_earned` (Decimal, default=0)
   - `total_withdrawn` (Decimal, default=0)
   - `created_at` (DateTime)
   - `updated_at` (DateTime)

2. Create `CoinTransaction` model:
   - `wallet_id` (ForeignKey)
   - `transaction_type` (Enum: 'gift', 'earned', 'withdrawal', 'conversion')
   - `amount` (Decimal)
   - `related_wall_id` (ForeignKey, nullable)
   - `related_card_id` (ForeignKey, nullable)
   - `related_gift_id` (ForeignKey, nullable)
   - `sender_id` (ForeignKey, nullable)
   - `recipient_id` (ForeignKey, nullable)
   - `status` (Enum: 'pending', 'completed', 'failed')
   - `created_at` (DateTime)

3. Create `CoinWithdrawal` model:
   - `wallet_id` (ForeignKey)
   - `amount` (Decimal)
   - `payout_method` (Enum: 'bank_transfer', 'paypal', 'crypto', etc.)
   - `payout_details` (JSON) - Stores account info
   - `status` (Enum: 'pending', 'processing', 'completed', 'failed')
   - `transaction_id` (String, nullable)
   - `created_at` (DateTime)

**API Endpoints:**
- `GET /api/coins/wallet` - Get user's wallet
- `POST /api/coins/gift` - Gift coins to celebrant
- `POST /api/coins/attach` - Attach coins to card/gift
- `POST /api/coins/withdraw` - Request withdrawal
- `GET /api/coins/transactions` - Get transaction history

**Frontend Changes:**
- Wallet display component
- Coin gifting UI
- Withdrawal request form
- Transaction history

**Questions for You:**
1. What should be the coin-to-cash conversion rate?
2. What payout methods should be supported initially?
3. Should there be minimum withdrawal amounts?
4. Should coins expire, or accumulate indefinitely?

---

### PHASE 6: Wall Sealing & Immutability
**Goal:** Make archived walls truly immutable

**Database Changes:**
1. Add to `BirthdayWall`:
   - `sealed_at` (DateTime, nullable)
   - `sealed_by_user_id` (ForeignKey, nullable)

**API Changes:**
- Enforce read-only for sealed walls
- Block all modifications (position, delete, etc.)

**Frontend Changes:**
- Visual indicator for sealed walls
- Disable all editing controls

---

## Implementation Order Recommendation

**Priority 1 (Core Functionality):**
1. Phase 1: Access Control & Upload Management
2. Phase 6: Wall Sealing (simple to implement)

**Priority 2 (User Experience):**
3. Phase 2: Drag-and-Drop Canvas
4. Phase 3: Digital Cards

**Priority 3 (Monetization):**
5. Phase 5: Coin System
6. Phase 4: Gifts as Objects

---

## Technical Considerations

1. **Performance:** Canvas with many draggable objects needs optimization
2. **Mobile:** Drag-and-drop must work well on touch devices
3. **Data Integrity:** Position data must be validated and sanitized
4. **Security:** All position updates must verify ownership/permissions
5. **Scalability:** Coin transactions need proper transaction handling

---

## Questions for Approval

Before I start implementation, please confirm:

1. **Phase 1 - Invitations:**
   - Should birthday mates be auto-invited or manual?
   - Invitation delivery method?

2. **Phase 2 - Canvas:**
   - Who can move items? (Celebrant only, or uploaders too?)
   - Canvas dimensions?

3. **Phase 3 - Cards:**
   - Card creation flow?
   - Design templates needed?

4. **Phase 5 - Coins:**
   - Conversion rate?
   - Payout methods?
   - Minimum withdrawal?

5. **General:**
   - Should I implement all phases, or start with specific ones?
   - Any features you want to modify or skip?

---

## Next Steps

Once you approve the plan and answer the questions, I'll begin implementation starting with Phase 1 (Access Control), as it's the foundation for all other features.

