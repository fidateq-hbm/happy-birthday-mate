from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Numeric, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class GiftTypeEnum(str, enum.Enum):
    DIGITAL_CARD = "digital_card"
    CONFETTI_EFFECT = "confetti_effect"
    WALL_HIGHLIGHT = "wall_highlight"
    CELEBRANT_BADGE = "celebrant_badge"
    FEATURED_MESSAGE = "featured_message"
    GIFT_CARD = "gift_card"


class PaymentProviderEnum(str, enum.Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    PAYSTACK = "paystack"


class Gift(Base):
    __tablename__ = "gifts"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Transaction
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Gift details
    gift_type = Column(Enum(GiftTypeEnum), nullable=False)
    gift_name = Column(String, nullable=False)
    gift_description = Column(Text, nullable=True)
    
    # Pricing
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="USD")
    
    # Payment
    payment_provider = Column(Enum(PaymentProviderEnum), nullable=False)
    payment_intent_id = Column(String, unique=True, nullable=True)
    payment_status = Column(String, default="pending")  # pending, completed, failed, refunded
    
    # Gift card specifics (for third-party gift cards)
    gift_card_code = Column(String, nullable=True)
    gift_card_provider = Column(String, nullable=True)  # Amazon, Netflix, Spotify, etc.
    
    # Personal message
    message = Column(Text, nullable=True)
    
    # Delivery
    is_delivered = Column(Boolean, default=False)
    delivered_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="gifts_sent")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="gifts_received")
    
    def __repr__(self):
        return f"<Gift {self.gift_type} from {self.sender_id} to {self.recipient_id}>"


class GiftCatalog(Base):
    __tablename__ = "gift_catalog"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Catalog item
    gift_type = Column(Enum(GiftTypeEnum), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    
    # Pricing
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="USD")
    
    # Display
    image_url = Column(String, nullable=True)
    preview_url = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    
    # Availability
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<GiftCatalogItem {self.name}>"

