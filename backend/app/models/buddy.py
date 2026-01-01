from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class BirthdayBuddy(Base):
    __tablename__ = "birthday_buddies"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Pairing (automatic, one per birthday)
    user_1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_2_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Pairing date
    birthday_date = Column(Date, nullable=False)
    
    # Room for 1-on-1 chat
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    user_1_accepted = Column(Boolean, default=False)
    user_2_accepted = Column(Boolean, default=False)
    
    # Reveal status (anonymous until first message)
    is_revealed = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    
    def __repr__(self):
        return f"<BirthdayBuddy {self.user_1_id} & {self.user_2_id}>"


class CelebrantVisibility(Base):
    __tablename__ = "celebrant_visibility"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Visibility date
    visibility_date = Column(Date, nullable=False)
    
    # Location
    state = Column(String, nullable=False)
    country = Column(String, nullable=False)
    
    # Settings
    is_visible = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    
    def __repr__(self):
        return f"<CelebrantVisibility user={self.user_id} state={self.state}>"

