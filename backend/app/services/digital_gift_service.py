"""
Digital Gift Service - Handles activation and delivery of platform-owned digital gifts

This service manages the activation of digital gifts that are owned by the platform:
- Digital Cards: Display/show to recipient
- Confetti Effects: Activate on recipient's profile
- Wall Highlights: Apply frame to birthday wall photo
- Celebrant Badges: Display badge on profile
- Featured Messages: Pin message in tribe room

These gifts are instant and don't require third-party APIs.
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from app.models import Gift, GiftTypeEnum, User, BirthdayWall, WallPhoto, Room, Message
import logging

logger = logging.getLogger(__name__)


class DigitalGiftService:
    """Service for activating and managing digital gifts"""
    
    @staticmethod
    async def activate_gift(
        gift: Gift,
        db: Session
    ) -> Dict[str, Any]:
        """
        Activate a digital gift after payment is confirmed
        
        Args:
            gift: The Gift object to activate
            db: Database session
            
        Returns:
            Dict with activation status and details
        """
        
        recipient = db.query(User).filter(User.id == gift.recipient_id).first()
        if not recipient:
            return {
                "success": False,
                "error": "Recipient not found"
            }
        
        try:
            if gift.gift_type == GiftTypeEnum.DIGITAL_CARD:
                return await DigitalGiftService._activate_digital_card(gift, recipient, db)
            
            elif gift.gift_type == GiftTypeEnum.CONFETTI_EFFECT:
                return await DigitalGiftService._activate_confetti_effect(gift, recipient, db)
            
            elif gift.gift_type == GiftTypeEnum.WALL_HIGHLIGHT:
                return await DigitalGiftService._activate_wall_highlight(gift, recipient, db)
            
            elif gift.gift_type == GiftTypeEnum.CELEBRANT_BADGE:
                return await DigitalGiftService._activate_celebrant_badge(gift, recipient, db)
            
            elif gift.gift_type == GiftTypeEnum.FEATURED_MESSAGE:
                return await DigitalGiftService._activate_featured_message(gift, recipient, db)
            
            else:
                return {
                    "success": False,
                    "error": f"Unknown gift type: {gift.gift_type}"
                }
                
        except Exception as e:
            logger.error(f"Error activating gift {gift.id}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    async def _activate_digital_card(
        gift: Gift,
        recipient: User,
        db: Session
    ) -> Dict[str, Any]:
        """
        Activate a digital card gift
        - Mark as delivered
        - Card can be viewed by recipient in their received gifts
        """
        gift.is_delivered = True
        gift.delivered_at = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "message": "Digital card delivered",
            "action": "view_card",  # Recipient can view the card
            "card_id": gift.id
        }
    
    @staticmethod
    async def _activate_confetti_effect(
        gift: Gift,
        recipient: User,
        db: Session
    ) -> Dict[str, Any]:
        """
        Activate confetti effect on recipient's profile
        - Effect lasts for 24 hours
        - Stored in gift record (expires_at calculated)
        """
        gift.is_delivered = True
        gift.delivered_at = datetime.utcnow()
        # Confetti effect expires in 24 hours
        # We'll check this when displaying the profile
        db.commit()
        
        return {
            "success": True,
            "message": "Confetti effect activated",
            "action": "show_confetti",
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
    
    @staticmethod
    async def _activate_wall_highlight(
        gift: Gift,
        recipient: User,
        db: Session
    ) -> Dict[str, Any]:
        """
        Activate wall highlight on recipient's birthday wall
        - Find recipient's active birthday wall
        - Apply highlight frame to a photo (or next uploaded photo)
        - Highlight lasts for 48 hours
        """
        # Find recipient's active birthday wall
        wall = db.query(BirthdayWall).filter(
            BirthdayWall.user_id == recipient.id,
            BirthdayWall.is_active == True
        ).first()
        
        if not wall:
            # If no wall exists, the highlight will be applied when wall is created
            # Store this in a pending highlights table or in gift metadata
            gift.is_delivered = True
            gift.delivered_at = datetime.utcnow()
            db.commit()
            
            return {
                "success": True,
                "message": "Wall highlight will be applied when birthday wall is created",
                "action": "pending_wall_highlight",
                "wall_id": None
            }
        
        # Apply highlight to the most recent photo or first photo
        photo = db.query(WallPhoto).filter(
            WallPhoto.wall_id == wall.id
        ).order_by(WallPhoto.created_at.desc()).first()
        
        if photo:
            # Store highlight info (we'll add a highlights table or use gift metadata)
            # For now, we'll mark the gift as delivered
            # The frontend will check for active highlights when displaying photos
            gift.is_delivered = True
            gift.delivered_at = datetime.utcnow()
            db.commit()
            
            return {
                "success": True,
                "message": "Wall highlight applied",
                "action": "highlight_photo",
                "photo_id": photo.id,
                "wall_id": wall.id,
                "expires_at": (datetime.utcnow() + timedelta(hours=48)).isoformat()
            }
        else:
            # No photos yet, will apply when photo is uploaded
            gift.is_delivered = True
            gift.delivered_at = datetime.utcnow()
            db.commit()
            
            return {
                "success": True,
                "message": "Wall highlight will be applied to next uploaded photo",
                "action": "pending_photo_highlight",
                "wall_id": wall.id
            }
    
    @staticmethod
    async def _activate_celebrant_badge(
        gift: Gift,
        recipient: User,
        db: Session
    ) -> Dict[str, Any]:
        """
        Activate celebrant badge on recipient's profile
        - Badge displays on profile for 24 hours
        - Badge type stored in gift metadata
        """
        gift.is_delivered = True
        gift.delivered_at = datetime.utcnow()
        db.commit()
        
        # Extract badge type from gift name (e.g., "Golden Birthday Badge" -> "golden")
        badge_type = "default"
        gift_name_lower = gift.gift_name.lower()
        if "golden" in gift_name_lower:
            badge_type = "golden"
        elif "diamond" in gift_name_lower:
            badge_type = "diamond"
        elif "platinum" in gift_name_lower:
            badge_type = "platinum"
        elif "royal" in gift_name_lower or "royalty" in gift_name_lower:
            badge_type = "royal"
        elif "star" in gift_name_lower:
            badge_type = "star"
        elif "legend" in gift_name_lower:
            badge_type = "legend"
        elif "champion" in gift_name_lower:
            badge_type = "champion"
        elif "superstar" in gift_name_lower:
            badge_type = "superstar"
        elif "hero" in gift_name_lower:
            badge_type = "hero"
        elif "magical" in gift_name_lower:
            badge_type = "magical"
        
        return {
            "success": True,
            "message": "Celebrant badge activated",
            "action": "show_badge",
            "badge_type": badge_type,
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
    
    @staticmethod
    async def _activate_featured_message(
        gift: Gift,
        recipient: User,
        db: Session
    ) -> Dict[str, Any]:
        """
        Activate featured message in recipient's tribe room
        - Pin the message at the top of the tribe room
        - Message stays featured for 24 hours
        """
        # Find recipient's tribe room (personal birthday room)
        room = db.query(Room).filter(
            Room.user_id == recipient.id,
            Room.room_type == "personal",
            Room.is_active == True
        ).first()
        
        if not room:
            # Room will be created on birthday, message will be featured then
            gift.is_delivered = True
            gift.delivered_at = datetime.utcnow()
            db.commit()
            
            return {
                "success": True,
                "message": "Featured message will be pinned when tribe room opens",
                "action": "pending_featured_message",
                "room_id": None
            }
        
        # Create the featured message in the room
        # Note: We might need to create a message record or store it differently
        # For now, we'll mark the gift as delivered
        # The frontend will check for featured messages when displaying the room
        gift.is_delivered = True
        gift.delivered_at = datetime.utcnow()
        db.commit()
        
        return {
            "success": True,
            "message": "Featured message pinned",
            "action": "pin_message",
            "room_id": room.id,
            "message_text": gift.message or "Happy Birthday!",
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
    
    @staticmethod
    def get_active_gifts_for_user(
        user_id: int,
        db: Session
    ) -> Dict[str, Any]:
        """
        Get all active digital gifts for a user
        - Confetti effects (within 24 hours)
        - Badges (within 24 hours)
        - Wall highlights (within 48 hours)
        - Featured messages (within 24 hours)
        """
        now = datetime.utcnow()
        active_gifts = {
            "confetti_effects": [],
            "badges": [],
            "wall_highlights": [],
            "featured_messages": [],
            "digital_cards": []
        }
        
        # Get all delivered gifts for this user
        gifts = db.query(Gift).filter(
            Gift.recipient_id == user_id,
            Gift.is_delivered == True,
            Gift.payment_status == "completed"
        ).all()
        
        for gift in gifts:
            if not gift.delivered_at:
                continue
                
            delivered_at = gift.delivered_at
            hours_since_delivery = (now - delivered_at).total_seconds() / 3600
            
            if gift.gift_type == GiftTypeEnum.CONFETTI_EFFECT:
                if hours_since_delivery < 24:
                    active_gifts["confetti_effects"].append({
                        "gift_id": gift.id,
                        "gift_name": gift.gift_name,
                        "delivered_at": delivered_at.isoformat(),
                        "expires_at": (delivered_at + timedelta(hours=24)).isoformat()
                    })
            
            elif gift.gift_type == GiftTypeEnum.CELEBRANT_BADGE:
                if hours_since_delivery < 24:
                    badge_type = "default"
                    gift_name_lower = gift.gift_name.lower()
                    if "golden" in gift_name_lower:
                        badge_type = "golden"
                    elif "diamond" in gift_name_lower:
                        badge_type = "diamond"
                    elif "platinum" in gift_name_lower:
                        badge_type = "platinum"
                    elif "royal" in gift_name_lower or "royalty" in gift_name_lower:
                        badge_type = "royal"
                    elif "star" in gift_name_lower:
                        badge_type = "star"
                    elif "legend" in gift_name_lower:
                        badge_type = "legend"
                    elif "champion" in gift_name_lower:
                        badge_type = "champion"
                    elif "superstar" in gift_name_lower:
                        badge_type = "superstar"
                    elif "hero" in gift_name_lower:
                        badge_type = "hero"
                    elif "magical" in gift_name_lower:
                        badge_type = "magical"
                    
                    active_gifts["badges"].append({
                        "gift_id": gift.id,
                        "gift_name": gift.gift_name,
                        "badge_type": badge_type,
                        "delivered_at": delivered_at.isoformat(),
                        "expires_at": (delivered_at + timedelta(hours=24)).isoformat()
                    })
            
            elif gift.gift_type == GiftTypeEnum.WALL_HIGHLIGHT:
                if hours_since_delivery < 48:
                    active_gifts["wall_highlights"].append({
                        "gift_id": gift.id,
                        "gift_name": gift.gift_name,
                        "delivered_at": delivered_at.isoformat(),
                        "expires_at": (delivered_at + timedelta(hours=48)).isoformat()
                    })
            
            elif gift.gift_type == GiftTypeEnum.FEATURED_MESSAGE:
                if hours_since_delivery < 24:
                    active_gifts["featured_messages"].append({
                        "gift_id": gift.id,
                        "gift_name": gift.gift_name,
                        "message": gift.message,
                        "sender_id": gift.sender_id,
                        "delivered_at": delivered_at.isoformat(),
                        "expires_at": (delivered_at + timedelta(hours=24)).isoformat()
                    })
            
            elif gift.gift_type == GiftTypeEnum.DIGITAL_CARD:
                # Digital cards don't expire, they're always viewable
                active_gifts["digital_cards"].append({
                    "gift_id": gift.id,
                    "gift_name": gift.gift_name,
                    "message": gift.message,
                    "sender_id": gift.sender_id,
                    "delivered_at": delivered_at.isoformat()
                })
        
        return active_gifts

