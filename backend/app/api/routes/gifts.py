from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.config import settings
from app.models import Gift, GiftCatalog, GiftTypeEnum, PaymentProviderEnum, User
from app.services.flutterwave_service import FlutterwaveService

router = APIRouter()


class SendGiftRequest(BaseModel):
    recipient_id: int
    gift_catalog_id: int
    payment_provider: PaymentProviderEnum
    message: Optional[str] = None


@router.get("/catalog")
async def get_gift_catalog(db: Session = Depends(get_db)):
    """Get all available gifts in catalog"""
    
    gifts = db.query(GiftCatalog).filter(
        GiftCatalog.is_active == True
    ).order_by(GiftCatalog.display_order).all()
    
    return {
        "gifts": [
            {
                "id": gift.id,
                "name": gift.name,
                "description": gift.description,
                "gift_type": gift.gift_type,
                "price": float(gift.price),
                "currency": gift.currency,
                "image_url": gift.image_url,
                "is_featured": gift.is_featured
            }
            for gift in gifts
        ]
    }


@router.post("/send")
async def send_gift(
    gift_request: SendGiftRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a digital gift to a celebrant - requires authentication"""
    
    sender = current_user
    sender_id = current_user.id
    
    # Verify recipient
    recipient = db.query(User).filter(User.id == gift_request.recipient_id).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )
    
    # Get gift from catalog
    catalog_item = db.query(GiftCatalog).filter(
        GiftCatalog.id == gift_request.gift_catalog_id
    ).first()
    
    if not catalog_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gift not found in catalog"
        )
    
    # Generate transaction reference
    tx_ref = FlutterwaveService.generate_tx_ref(0)  # Will update after gift creation
    
    # Create gift transaction
    gift = Gift(
        sender_id=sender_id,
        recipient_id=gift_request.recipient_id,
        gift_type=catalog_item.gift_type,
        gift_name=catalog_item.name,
        gift_description=catalog_item.description,
        amount=catalog_item.price,
        currency=catalog_item.currency,
        payment_provider=gift_request.payment_provider,
        message=gift_request.message,
        payment_status="pending",
        payment_intent_id=tx_ref  # Store tx_ref as payment_intent_id
    )
    
    # If this is a gift card, extract provider name from gift name
    if catalog_item.gift_type == GiftTypeEnum.GIFT_CARD:
        # Extract provider from name (e.g., "Amazon Gift Card $25" -> "amazon")
        gift_name_lower = catalog_item.name.lower()
        if "amazon" in gift_name_lower:
            gift.gift_card_provider = "amazon"
        elif "netflix" in gift_name_lower:
            gift.gift_card_provider = "netflix"
        elif "spotify" in gift_name_lower:
            gift.gift_card_provider = "spotify"
        elif "apple" in gift_name_lower or "app store" in gift_name_lower:
            gift.gift_card_provider = "apple"
        elif "google play" in gift_name_lower:
            gift.gift_card_provider = "google_play"
        elif "uber eats" in gift_name_lower:
            gift.gift_card_provider = "uber_eats"
        elif "starbucks" in gift_name_lower:
            gift.gift_card_provider = "starbucks"
        elif "airbnb" in gift_name_lower:
            gift.gift_card_provider = "airbnb"
        elif "steam" in gift_name_lower:
            gift.gift_card_provider = "steam"
        elif "disney" in gift_name_lower:
            gift.gift_card_provider = "disney_plus"
        elif "sephora" in gift_name_lower:
            gift.gift_card_provider = "sephora"
        elif "nike" in gift_name_lower:
            gift.gift_card_provider = "nike"
        elif "uber" in gift_name_lower and "eats" not in gift_name_lower:
            gift.gift_card_provider = "uber"
        elif "doordash" in gift_name_lower:
            gift.gift_card_provider = "doordash"
        elif "masterclass" in gift_name_lower:
            gift.gift_card_provider = "masterclass"
    
    db.add(gift)
    db.commit()
    db.refresh(gift)
    
    # Update tx_ref with actual gift ID
    tx_ref = FlutterwaveService.generate_tx_ref(gift.id)
    gift.payment_intent_id = tx_ref
    db.commit()
    
    # Initialize payment if Flutterwave is selected
    payment_data = None
    if gift_request.payment_provider == PaymentProviderEnum.FLUTTERWAVE:
        if not settings.FLUTTERWAVE_SECRET_KEY:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Flutterwave is not configured"
            )
        
        # Get redirect URL (frontend will handle payment completion)
        api_url = os.getenv("API_URL", os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000"))
        frontend_url = os.getenv("NEXT_PUBLIC_FRONTEND_URL", "http://localhost:3000")
        redirect_url = f"{frontend_url}/gifts/payment/callback?gift_id={gift.id}"
        
        try:
            payment_response = await FlutterwaveService.initialize_payment(
                amount=catalog_item.price,
                currency=catalog_item.currency or "USD",
                email=sender.email,
                tx_ref=tx_ref,
                customer_name=sender.first_name,
                redirect_url=redirect_url,
                meta_data={
                    "gift_id": gift.id,
                    "sender_id": sender_id,
                    "recipient_id": gift_request.recipient_id
                }
            )
            
            payment_data = {
                "payment_url": payment_response.get("data", {}).get("link"),
                "tx_ref": tx_ref
            }
        except Exception as e:
            # If payment initialization fails, still return gift but mark as failed
            gift.payment_status = "failed"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to initialize payment: {str(e)}"
            )
    
    return {
        "gift_id": gift.id,
        "status": "pending",
        "message": "Gift created. Complete payment to deliver.",
        "payment_data": payment_data
    }


@router.post("/activate/{gift_id}")
async def activate_gift_after_payment(
    gift_id: int,
    db: Session = Depends(get_db)
):
    """
    Activate a gift after payment is confirmed
    This endpoint should be called by the payment webhook handler
    """
    from app.services.digital_gift_service import DigitalGiftService
    
    gift = db.query(Gift).filter(Gift.id == gift_id).first()
    if not gift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gift not found"
        )
    
    # For placeholder: Allow activation even if payment_status is pending
    # In production, webhook will set payment_status to "completed" first
    # For now, we'll update payment status to completed as part of activation
    if gift.payment_status == "pending":
        # PLACEHOLDER: In production, payment webhook sets this to "completed"
        # For now, we'll update it here to simulate successful payment
        gift.payment_status = "completed"
        db.commit()
    
    # Only activate if payment is completed
    if gift.payment_status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment not completed"
        )
    
    # If already delivered, return current status
    if gift.is_delivered:
        return {
            "success": True,
            "message": "Gift already activated",
            "gift_id": gift.id
        }
    
    # Activate the gift based on type
    if gift.gift_type == GiftTypeEnum.GIFT_CARD:
        # For gift cards, we need to call the gift card service
        # TODO: Implement gift card API integration
        return {
            "success": False,
            "message": "Gift card activation requires API integration",
            "gift_id": gift.id
        }
    else:
        # For digital gifts (our own), activate immediately
        result = await DigitalGiftService.activate_gift(gift, db)
        return result


@router.get("/active/{user_id}")
async def get_active_gifts(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all active digital gifts for a user
    Returns confetti effects, badges, wall highlights, featured messages, and digital cards
    """
    from app.services.digital_gift_service import DigitalGiftService
    
    active_gifts = DigitalGiftService.get_active_gifts_for_user(user_id, db)
    return active_gifts


@router.get("/received")
async def get_received_gifts(user_id: int, db: Session = Depends(get_db)):
    """Get gifts received by user"""
    
    gifts = db.query(Gift).filter(
        Gift.recipient_id == user_id,
        Gift.payment_status == "completed"
    ).order_by(Gift.created_at.desc()).all()
    
    return {
        "gifts": [
            {
                "id": gift.id,
                "gift_name": gift.gift_name,
                "gift_type": gift.gift_type,
                "sender_id": gift.sender_id,
                "message": gift.message,
                "received_at": gift.delivered_at,
                "amount": float(gift.amount)
            }
            for gift in gifts
        ]
    }


@router.get("/sent")
async def get_sent_gifts(user_id: int, db: Session = Depends(get_db)):
    """Get gifts sent by user"""
    
    gifts = db.query(Gift).filter(
        Gift.sender_id == user_id
    ).order_by(Gift.created_at.desc()).all()
    
    return {
        "gifts": [
            {
                "id": gift.id,
                "gift_name": gift.gift_name,
                "gift_type": gift.gift_type,
                "recipient_id": gift.recipient_id,
                "payment_status": gift.payment_status,
                "sent_at": gift.created_at,
                "amount": float(gift.amount)
            }
            for gift in gifts
        ]
    }

