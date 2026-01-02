"""
Payment webhook handlers
"""
from fastapi import APIRouter, Request, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
import json

from app.core.database import get_db
from app.models import Gift
from app.services.flutterwave_service import FlutterwaveService
from app.services.digital_gift_service import DigitalGiftService

router = APIRouter()


@router.post("/webhook/flutterwave")
async def flutterwave_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Handle Flutterwave webhook events
    """
    try:
        # Get raw body for signature verification
        body = await request.body()
        body_str = body.decode('utf-8')
        
        # Get signature from header
        signature = request.headers.get("verif-hash", "")
        
        # Verify webhook signature
        if not FlutterwaveService.verify_webhook_signature(body_str, signature):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature"
            )
        
        # Parse webhook data
        webhook_data = await request.json()
        event_type = webhook_data.get("event")
        data = webhook_data.get("data", {})
        
        # Handle charge.completed event
        if event_type == "charge.completed":
            tx_ref = data.get("tx_ref")
            transaction_id = data.get("id")
            status = data.get("status")
            
            if status == "successful":
                # Find gift by transaction reference
                gift = db.query(Gift).filter(
                    Gift.payment_intent_id == tx_ref
                ).first()
                
                if gift:
                    # Verify payment with Flutterwave
                    verification = await FlutterwaveService.verify_payment(str(transaction_id))
                    
                    if verification.get("status") == "success":
                        verified_data = verification.get("data", {})
                        
                        # Update gift payment status
                        gift.payment_status = "completed"
                        gift.payment_intent_id = f"{tx_ref}|{transaction_id}"  # Store both refs
                        db.commit()
                        
                        # Activate the gift
                        if not gift.is_delivered:
                            await DigitalGiftService.activate_gift(gift, db)
                        
                        return {"status": "success", "message": "Payment verified and gift activated"}
            
            elif status == "failed":
                # Find and mark gift as failed
                gift = db.query(Gift).filter(
                    Gift.payment_intent_id == tx_ref
                ).first()
                
                if gift:
                    gift.payment_status = "failed"
                    db.commit()
        
        return {"status": "received"}
        
    except Exception as e:
        # Log error but return 200 to prevent Flutterwave from retrying
        print(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}


@router.get("/verify/{gift_id}")
async def verify_payment_status(
    gift_id: int,
    db: Session = Depends(get_db)
):
    """
    Verify payment status for a gift
    """
    gift = db.query(Gift).filter(Gift.id == gift_id).first()
    
    if not gift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gift not found"
        )
    
    # If payment is completed, verify with Flutterwave
    if gift.payment_provider.value == "flutterwave" and gift.payment_status == "pending":
        if gift.payment_intent_id:
            # Extract transaction ID if available
            tx_ref = gift.payment_intent_id.split("|")[0] if "|" in gift.payment_intent_id else gift.payment_intent_id
            
            try:
                # Try to verify payment (this would need transaction ID, which we get from webhook)
                # For now, just return current status
                pass
            except Exception as e:
                print(f"Payment verification error: {str(e)}")
    
    return {
        "gift_id": gift.id,
        "payment_status": gift.payment_status,
        "is_delivered": gift.is_delivered
    }

