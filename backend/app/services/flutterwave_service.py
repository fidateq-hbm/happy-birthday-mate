"""
Flutterwave Payment Service
Handles payment processing via Flutterwave API
"""
import os
import hashlib
import hmac
import json
from typing import Dict, Optional
from decimal import Decimal
import httpx
from app.core.config import settings


class FlutterwaveService:
    """Service for handling Flutterwave payments"""
    
    BASE_URL = "https://api.flutterwave.com/v3"
    
    @staticmethod
    def get_headers() -> Dict[str, str]:
        """Get headers for Flutterwave API requests"""
        return {
            "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
            "Content-Type": "application/json"
        }
    
    @staticmethod
    async def initialize_payment(
        amount: Decimal,
        currency: str,
        email: str,
        tx_ref: str,
        customer_name: str,
        redirect_url: str,
        meta_data: Optional[Dict] = None
    ) -> Dict:
        """
        Initialize a payment transaction
        
        Args:
            amount: Payment amount
            currency: Currency code (e.g., USD, NGN, KES)
            email: Customer email
            tx_ref: Unique transaction reference
            customer_name: Customer name
            redirect_url: URL to redirect after payment
            meta_data: Additional metadata
            
        Returns:
            Payment initialization response
        """
        url = f"{FlutterwaveService.BASE_URL}/payments"
        
        payload = {
            "tx_ref": tx_ref,
            "amount": str(amount),
            "currency": currency.upper(),
            "redirect_url": redirect_url,
            "payment_options": "card,account,ussd,banktransfer,mobilemoney",
            "customer": {
                "email": email,
                "name": customer_name
            },
            "customizations": {
                "title": "Happy Birthday Mate - Gift Payment",
                "description": "Payment for birthday gift",
                "logo": "https://www.happybirthdaymate.com/icons/icon-192x192.png"
            }
        }
        
        if meta_data:
            payload["meta"] = meta_data
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers=FlutterwaveService.get_headers(),
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    async def verify_payment(transaction_id: str) -> Dict:
        """
        Verify a payment transaction
        
        Args:
            transaction_id: Flutterwave transaction ID
            
        Returns:
            Transaction verification response
        """
        url = f"{FlutterwaveService.BASE_URL}/transactions/{transaction_id}/verify"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers=FlutterwaveService.get_headers(),
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    def verify_webhook_signature(payload: str, signature: str) -> bool:
        """
        Verify Flutterwave webhook signature
        
        Args:
            payload: Raw webhook payload
            signature: Webhook signature from header
            
        Returns:
            True if signature is valid
        """
        if not settings.FLUTTERWAVE_WEBHOOK_HASH:
            # If webhook hash is not set, skip verification (not recommended for production)
            return True
        
        expected_signature = hashlib.sha256(
            (payload + settings.FLUTTERWAVE_WEBHOOK_HASH).encode()
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    @staticmethod
    def generate_tx_ref(gift_id: int) -> str:
        """Generate unique transaction reference"""
        import secrets
        random_suffix = secrets.token_hex(4)
        return f"HBM-GIFT-{gift_id}-{random_suffix}"

