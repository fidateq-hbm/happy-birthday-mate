from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class WallThemeEnum(str, enum.Enum):
    CELEBRATION = "celebration"
    ELEGANT = "elegant"
    VIBRANT = "vibrant"
    MINIMAL = "minimal"
    GOLD = "gold"
    RAINBOW = "rainbow"


class BackgroundAnimationEnum(str, enum.Enum):
    CELEBRATION = "celebration"
    AUTUMN = "autumn"
    SPRING = "spring"
    WINTER = "winter"
    OCEAN = "ocean"
    GALAXY = "galaxy"
    CONFETTI = "confetti"


class PhotoFrameEnum(str, enum.Enum):
    NONE = "none"
    CLASSIC = "classic"
    ELEGANT = "elegant"
    VINTAGE = "vintage"
    MODERN = "modern"
    GOLD = "gold"
    RAINBOW = "rainbow"
    POLAROID = "polaroid"


class BirthdayWall(Base):
    __tablename__ = "birthday_walls"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Wall metadata
    title = Column(String, default="My Birthday Wall")
    theme = Column(Enum(WallThemeEnum), default=WallThemeEnum.CELEBRATION)
    accent_color = Column(String, default="#FFD700")
    
    # Background customization
    background_animation = Column(String, default="celebration")  # Store as string, validate in API
    background_color = Column(String, default="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100")
    animation_intensity = Column(String, default="medium")  # low, medium, high
    
    # Lifecycle (opens 24h before, closes 48h after birthday)
    opens_at = Column(DateTime, nullable=False)
    closes_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Archive: Store the year this wall belongs to for archive viewing
    birthday_year = Column(Integer, nullable=False)  # Year of the birthday this wall celebrates
    
    # Sharing
    public_url_code = Column(String, unique=True, nullable=False)
    is_public = Column(Boolean, default=True)
    view_count = Column(Integer, default=0)
    
    # Settings
    max_photos = Column(Integer, default=50)
    allow_reactions = Column(Boolean, default=True)
    
    # Upload Control (EME Phase 1)
    uploads_enabled = Column(Boolean, default=False)  # Opt-in model: default no uploads
    upload_permission = Column(String, default="none")  # 'none', 'birthday_mates', 'invited_guests', 'both'
    upload_paused = Column(Boolean, default=False)  # Temporary pause without closing
    is_sealed = Column(Boolean, default=False)  # Final seal - immutable
    sealed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="birthday_walls")
    photos = relationship("WallPhoto", back_populates="wall", cascade="all, delete-orphan")
    invitations = relationship("WallInvitation", back_populates="wall", cascade="all, delete-orphan")
    upload_tracking = relationship("WallUpload", back_populates="wall", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<BirthdayWall {self.id} for user {self.owner_id}>"


class WallPhoto(Base):
    __tablename__ = "wall_photos"
    
    id = Column(Integer, primary_key=True, index=True)
    wall_id = Column(Integer, ForeignKey("birthday_walls.id"), nullable=False)
    
    # Photo data
    photo_url = Column(String, nullable=False)
    caption = Column(Text, nullable=True)
    
    # Uploaded by
    uploaded_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    uploaded_by_name = Column(String, nullable=True)  # For guests
    
    # Display order
    display_order = Column(Integer, default=0)
    
    # Beautification
    frame_style = Column(String, default="none")  # Frame style for photo
    
    # Moderation
    is_approved = Column(Boolean, default=True)
    is_flagged = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    wall = relationship("BirthdayWall", back_populates="photos")
    reactions = relationship("PhotoReaction", back_populates="photo", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<WallPhoto {self.id}>"


class PhotoReaction(Base):
    __tablename__ = "photo_reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    photo_id = Column(Integer, ForeignKey("wall_photos.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    emoji = Column(String, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    photo = relationship("WallPhoto", back_populates="reactions")
    
    def __repr__(self):
        return f"<PhotoReaction {self.emoji}>"


class WallInvitation(Base):
    """Track invitations to Birthday Walls (EME Phase 1)"""
    __tablename__ = "wall_invitations"
    
    id = Column(Integer, primary_key=True, index=True)
    wall_id = Column(Integer, ForeignKey("birthday_walls.id"), nullable=False)
    
    # Invited user (for birthday mates or registered guests)
    invited_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # For non-registered guests
    invited_email = Column(String, nullable=True)
    invited_name = Column(String, nullable=True)  # Guest name
    
    # Invitation details
    invitation_type = Column(String, nullable=False)  # 'birthday_mate', 'guest'
    invitation_code = Column(String, unique=True, nullable=False, index=True)
    
    # Who sent the invitation
    invited_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Status
    accepted_at = Column(DateTime, nullable=True)
    is_accepted = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # Optional expiration
    
    # Relationships
    wall = relationship("BirthdayWall", back_populates="invitations")
    invited_user = relationship("User", foreign_keys=[invited_user_id])
    invited_by = relationship("User", foreign_keys=[invited_by_user_id])
    
    def __repr__(self):
        return f"<WallInvitation {self.id} for wall {self.wall_id}>"


class WallUpload(Base):
    """Track uploads to enforce 1 upload per person limit (EME Phase 1)"""
    __tablename__ = "wall_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    wall_id = Column(Integer, ForeignKey("birthday_walls.id"), nullable=False)
    
    # Uploader identification
    uploader_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # For registered users
    uploader_email = Column(String, nullable=True)  # For guests
    uploader_name = Column(String, nullable=True)  # For guests
    
    # Upload tracking
    upload_type = Column(String, nullable=False)  # 'photo', 'card', 'gift'
    upload_count = Column(Integer, default=1)  # Should always be 1, but track for safety
    last_upload_at = Column(DateTime, default=datetime.utcnow)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    wall = relationship("BirthdayWall", back_populates="upload_tracking")
    uploader = relationship("User", foreign_keys=[uploader_user_id])
    
    def __repr__(self):
        return f"<WallUpload {self.id} on wall {self.wall_id}>"

