from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text, Enum
from datetime import datetime
import enum
from app.core.database import Base


class ModerationActionEnum(str, enum.Enum):
    WARNING = "warning"
    CONTENT_REMOVED = "content_removed"
    USER_SUSPENDED = "user_suspended"
    USER_BANNED = "user_banned"
    CONTENT_APPROVED = "content_approved"


class ContentTypeEnum(str, enum.Enum):
    MESSAGE = "message"
    PHOTO = "photo"
    PROFILE_PICTURE = "profile_picture"
    USER_PROFILE = "user_profile"


class ModerationLog(Base):
    __tablename__ = "moderation_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Moderation details
    moderator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Action
    action = Column(Enum(ModerationActionEnum), nullable=False)
    content_type = Column(Enum(ContentTypeEnum), nullable=True)
    content_id = Column(Integer, nullable=True)
    
    # Reason
    reason = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<ModerationLog {self.action} by {self.moderator_id}>"


class FlaggedContent(Base):
    __tablename__ = "flagged_content"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Content details
    content_type = Column(Enum(ContentTypeEnum), nullable=False)
    content_id = Column(Integer, nullable=False)
    reported_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Report details
    reason = Column(Text, nullable=False)
    status = Column(String, default="pending")  # pending, reviewed, action_taken, dismissed
    
    # Review
    reviewed_by_moderator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    moderator_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<FlaggedContent {self.content_type}:{self.content_id}>"


class Celebrity(Base):
    __tablename__ = "celebrities"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Celebrity info
    name = Column(String, nullable=False)
    photo_url = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Birthday
    birth_month = Column(Integer, nullable=False)
    birth_day = Column(Integer, nullable=False)
    birth_year = Column(Integer, nullable=True)
    
    # Display
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=0)  # Higher priority shown first
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Celebrity {self.name}>"

