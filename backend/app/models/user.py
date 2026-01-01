from sqlalchemy import Column, String, Integer, DateTime, Boolean, Date, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class GenderEnum(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum(GenderEnum), nullable=False)
    country = Column(String, nullable=False)
    state = Column(String, nullable=False)
    city = Column(String, nullable=True)
    profile_picture_url = Column(String, nullable=False)
    
    # Birthday tribe (auto-assigned based on MM-DD)
    birth_month = Column(Integer, nullable=False)  # 1-12
    birth_day = Column(Integer, nullable=False)    # 1-31
    tribe_id = Column(String, index=True, nullable=False)  # Format: "MM-DD"
    
    # Privacy settings
    state_visibility_enabled = Column(Boolean, default=False)
    
    # Profile picture change tracking
    last_profile_picture_change = Column(DateTime, nullable=True)
    profile_picture_change_count = Column(Integer, default=0)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    consent_given = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = relationship("Message", back_populates="user")
    gifts_sent = relationship("Gift", foreign_keys="Gift.sender_id", back_populates="sender")
    gifts_received = relationship("Gift", foreign_keys="Gift.recipient_id", back_populates="recipient")
    birthday_walls = relationship("BirthdayWall", back_populates="owner")
    
    def __repr__(self):
        return f"<User {self.first_name} ({self.email})>"

