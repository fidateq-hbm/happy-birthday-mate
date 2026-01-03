from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from pydantic import BaseModel, field_validator
from typing import Optional
import secrets

from app.core.database import get_db
from app.core.auth import get_current_user, get_optional_user
from app.core.security import limiter, sanitize_input
from app.models import Room, RoomParticipant, Message, User, RoomTypeEnum, BirthdayWall, WallPhoto, WallThemeEnum, PhotoReaction, BackgroundAnimationEnum, WallInvitation, WallUpload

router = APIRouter()


class CreatePersonalRoomRequest(BaseModel):
    name: Optional[str] = None


class CreateBirthdayWallRequest(BaseModel):
    title: str = "My Birthday Wall"
    theme: WallThemeEnum = WallThemeEnum.CELEBRATION
    accent_color: str = "#FFD700"
    background_animation: Optional[str] = "celebration"  # Accept string, convert to enum in endpoint
    background_color: Optional[str] = "bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100"
    animation_intensity: Optional[str] = "medium"


class UploadPhotoToWallRequest(BaseModel):
    photo_url: str
    caption: Optional[str] = ""
    frame_style: Optional[str] = "none"  # Frame style for photo


class AddPhotoReactionRequest(BaseModel):
    emoji: str


class UpdatePhotoRequest(BaseModel):
    caption: Optional[str] = None
    frame_style: Optional[str] = None


# EME Phase 1: Invitation and Upload Control Models
class InviteToWallRequest(BaseModel):
    invited_user_id: Optional[int] = None  # For birthday mates
    invited_email: Optional[str] = None  # For guests
    invited_name: Optional[str] = None  # For guests
    invitation_type: str  # 'birthday_mate' or 'guest'


class UpdateUploadControlRequest(BaseModel):
    uploads_enabled: Optional[bool] = None
    upload_permission: Optional[str] = None  # 'none', 'birthday_mates', 'invited_guests', 'both'
    upload_paused: Optional[bool] = None
    is_sealed: Optional[bool] = None  # Final seal


@router.post("/personal")
@limiter.limit("10/hour")  # Rate limit room creation
async def create_personal_birthday_room(
    request: Request,
    room_data: CreatePersonalRoomRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create personal birthday room (only available on birthday day)
    Requires authentication
    """
    user = current_user
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if it's user's birthday
    today = date.today()
    is_birthday = (today.month == user.birth_month and today.day == user.birth_day)
    
    if not is_birthday:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Personal room only available on your birthday"
        )
    
    # Check if room already exists for today
    existing_room = db.query(Room).filter(
        Room.room_type == RoomTypeEnum.PERSONAL,
        Room.owner_id == user.id,
        Room.opens_at >= datetime.combine(today, datetime.min.time())
    ).first()
    
    if existing_room:
        return {
            "room_id": existing_room.id,
            "invite_code": existing_room.invite_code,
            "message": "Room already exists"
        }
    
    # Sanitize room name if provided
    room_name = sanitize_input(room_data.name, max_length=100) if room_data.name else None
    
    # Create room
    opens_at = datetime.combine(today, datetime.min.time())
    closes_at = datetime.combine(today, datetime.max.time())
    invite_code = secrets.token_urlsafe(16)
    
    room = Room(
        room_type=RoomTypeEnum.PERSONAL,
        room_identifier=f"personal_{user.id}_{today.isoformat()}",
        name=request.name or f"{user.first_name}'s Birthday Celebration",
        opens_at=opens_at,
        closes_at=closes_at,
        is_active=True,
        owner_id=user_id,
        invite_code=invite_code,
        max_guests=50
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    
    # Add owner as participant
    participant = RoomParticipant(
        room_id=room.id,
        user_id=user_id,
        is_birthday_mate=True
    )
    db.add(participant)
    db.commit()
    
    return {
        "room_id": room.id,
        "invite_code": invite_code,
        "room_name": room.name,
        "closes_at": closes_at
    }


@router.post("/{room_id}/join")
async def join_room_with_invite(
    room_id: int,
    invite_code: str,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Join a personal birthday room using invite code"""
    
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    if room.invite_code != invite_code:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid invite code"
        )
    
    if not room.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Room is not active"
        )
    
    # Check if already participant
    existing = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == user_id
    ).first()
    
    if existing:
        return {"message": "Already a member"}
    
    # Check guest limit
    guest_count = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id
    ).count()
    
    if guest_count >= room.max_guests:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Room is full"
        )
    
    # Get user info
    user = db.query(User).filter(User.id == user_id).first()
    is_birthday_mate = user and (user.tribe_id == db.query(User).filter(User.id == room.owner_id).first().tribe_id)
    
    # Add as participant
    participant = RoomParticipant(
        room_id=room_id,
        user_id=user_id,
        is_guest=not is_birthday_mate,
        is_birthday_mate=is_birthday_mate
    )
    db.add(participant)
    db.commit()
    
    return {"message": "Joined successfully", "is_birthday_mate": is_birthday_mate}


@router.post("/birthday-wall")
async def create_birthday_wall(
    request: CreateBirthdayWallRequest,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Create birthday wall (opens 24h before birthday, closes 48h after)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if wall already exists for this birthday cycle
    today = date.today()
    existing_wall = db.query(BirthdayWall).filter(
        BirthdayWall.owner_id == user_id,
        BirthdayWall.closes_at > datetime.utcnow()
    ).first()
    
    if existing_wall:
        return {
            "wall_id": existing_wall.id,
            "public_url_code": existing_wall.public_url_code,
            "message": "Wall already exists"
        }
    
    # Calculate lifecycle dates
    birthday_this_year = date(today.year, user.birth_month, user.birth_day)
    if birthday_this_year < today:
        birthday_this_year = date(today.year + 1, user.birth_month, user.birth_day)
    
    opens_at = datetime.combine(birthday_this_year - timedelta(days=1), datetime.min.time())
    closes_at = datetime.combine(birthday_this_year + timedelta(days=2), datetime.max.time())
    
    # ENFORCE: Wall can only be created within 24 hours before birthday
    now = datetime.utcnow()
    if now < opens_at:
        hours_until_open = (opens_at - now).total_seconds() / 3600
        if hours_until_open > 24:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Birthday Wall can only be created within 24 hours before your birthday. Your wall will open in {int(hours_until_open)} hours."
            )
    
    # Generate public URL code
    public_url_code = secrets.token_urlsafe(12)
    
    # Validate and normalize background_animation string
    bg_animation = request.background_animation or "celebration"
    bg_animation = bg_animation.lower()
    
    # Validate it's a valid enum value
    valid_animations = [e.value for e in BackgroundAnimationEnum]
    if bg_animation not in valid_animations:
        bg_animation = "celebration"
    
    wall = BirthdayWall(
        owner_id=user_id,
        title=request.title,
        theme=request.theme,
        accent_color=request.accent_color,
        background_animation=bg_animation,  # Store as string
        background_color=request.background_color or "bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100",
        animation_intensity=request.animation_intensity or "medium",
        opens_at=opens_at,
        closes_at=closes_at,
        birthday_year=birthday_this_year.year,  # Store year for archive
        is_active=True,
        public_url_code=public_url_code
    )
    db.add(wall)
    db.commit()
    db.refresh(wall)
    
    return {
        "wall_id": wall.id,
        "public_url_code": public_url_code,
        "opens_at": opens_at,
        "closes_at": closes_at
    }


@router.get("/birthday-wall/user/{user_id}")
async def get_user_birthday_wall(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's active birthday wall - requires authentication"""
    # Verify user can only access their own wall
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own birthday wall"
        )
    
    today = date.today()
    
    # Find active wall (not closed yet)
    wall = db.query(BirthdayWall).filter(
        BirthdayWall.owner_id == user_id,
        BirthdayWall.closes_at > datetime.utcnow()
    ).first()
    
    if not wall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active birthday wall found"
        )
    
    # Get photos (owner can see all photos including unapproved)
    photos = db.query(WallPhoto).filter(
        WallPhoto.wall_id == wall.id
    ).order_by(WallPhoto.display_order).all()
    
    # Get reactions for each photo
    photo_data = []
    for photo in photos:
        reactions = db.query(PhotoReaction).filter(PhotoReaction.photo_id == photo.id).all()
        
        reaction_counts = {
            "❤️": 0,
            "👍": 0,
            "😊": 0,
        }
        
        user_reactions = set()
        for reaction in reactions:
            if reaction.emoji == "❤️":
                reaction_counts["❤️"] += 1
            elif reaction.emoji == "👍":
                reaction_counts["👍"] += 1
            elif reaction.emoji == "😊":
                reaction_counts["😊"] += 1
            
            if reaction.user_id == user_id:
                user_reactions.add(reaction.emoji)
        
        photo_data.append({
            "id": photo.id,
            "photo_url": photo.photo_url,
            "caption": photo.caption,
            "uploaded_by": photo.uploaded_by_name,
            "uploaded_by_user_id": photo.uploaded_by_user_id,  # Include for ownership check
            "created_at": photo.created_at,
            "frame_style": photo.frame_style or "none",
            "reactions": reaction_counts,
            "user_reacted": list(user_reactions)
        })
    
    # Check if wall is open
    now = datetime.utcnow()
    is_open = wall.opens_at <= now <= wall.closes_at
    is_archived = now > wall.closes_at
    
    return {
        "wall_id": wall.id,
        "public_url_code": wall.public_url_code,
        "title": wall.title,
        "theme": wall.theme,
        "accent_color": wall.accent_color,
        "background_animation": wall.background_animation,
        "background_color": wall.background_color,
        "animation_intensity": wall.animation_intensity,
        "is_active": wall.is_active,
        "is_open": is_open,
        "is_archived": is_archived,
        "birthday_year": wall.birthday_year,
        "opens_at": wall.opens_at,
        "closes_at": wall.closes_at,
        "photos": photo_data,
        # EME Phase 1: Upload control info
        "uploads_enabled": wall.uploads_enabled,
        "upload_permission": wall.upload_permission,
        "upload_paused": wall.upload_paused,
        "is_sealed": wall.is_sealed
    }


@router.get("/birthday-wall/{wall_code}")
async def get_birthday_wall(
    wall_code: str, 
    user_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Get birthday wall by public URL code (accessible even after close for archive viewing)"""
    
    wall = db.query(BirthdayWall).filter(
        BirthdayWall.public_url_code == wall_code
    ).first()
    
    if not wall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Birthday wall not found"
        )
    
    # Check if wall is open (for uploads/reactions)
    now = datetime.utcnow()
    is_open = wall.opens_at <= now <= wall.closes_at
    is_archived = now > wall.closes_at
    
    # ENFORCEMENT: If wall is archived, only the owner can access it
    if is_archived:
        # Get requesting user ID from authenticated user or query param
        requesting_user_id = current_user.id if current_user else user_id
        
        if not requesting_user_id or requesting_user_id != wall.owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="After closure, the Birthday Wall becomes archived and visible only to the celebrant."
            )
    
    # Get photos (include unapproved for owner, approved for others)
    if user_id and wall.owner_id == user_id:
        # Owner can see all photos including unapproved
        photos = db.query(WallPhoto).filter(
            WallPhoto.wall_id == wall.id
        ).order_by(WallPhoto.display_order).all()
    else:
        # Others only see approved photos
        photos = db.query(WallPhoto).filter(
            WallPhoto.wall_id == wall.id,
            WallPhoto.is_approved == True
        ).order_by(WallPhoto.display_order).all()
    
    # Increment view count (only if not owner viewing their own wall, and not archived)
    if (not user_id or wall.owner_id != user_id) and not is_archived:
        wall.view_count += 1
        db.commit()
    
    # Get owner info
    owner = db.query(User).filter(User.id == wall.owner_id).first()
    
    # Get reactions for each photo
    photo_data = []
    for photo in photos:
        reactions = db.query(PhotoReaction).filter(PhotoReaction.photo_id == photo.id).all()
        
        # Count reactions by emoji type
        reaction_counts = {
            "❤️": 0,  # Heart
            "👍": 0,  # ThumbsUp
            "😊": 0,  # Smile
        }
        
        user_reactions = set()  # Track which reactions the current user has made
        
        for reaction in reactions:
            # Count reactions
            if reaction.emoji == "❤️":
                reaction_counts["❤️"] += 1
            elif reaction.emoji == "👍":
                reaction_counts["👍"] += 1
            elif reaction.emoji == "😊":
                reaction_counts["😊"] += 1
            
            # Track user's reactions
            if user_id and reaction.user_id == user_id:
                user_reactions.add(reaction.emoji)
        
        photo_data.append({
            "id": photo.id,
            "photo_url": photo.photo_url,
            "caption": photo.caption,
            "uploaded_by": photo.uploaded_by_name,
            "uploaded_by_user_id": photo.uploaded_by_user_id,  # Include for ownership check
            "created_at": photo.created_at,
            "frame_style": photo.frame_style or "none",
            "reactions": reaction_counts,
            "user_reacted": list(user_reactions)
        })
    
    return {
        "wall_id": wall.id,
        "title": wall.title,
        "theme": wall.theme,
        "accent_color": wall.accent_color,
        "background_animation": wall.background_animation,
        "background_color": wall.background_color,
        "animation_intensity": wall.animation_intensity,
        "owner_name": owner.first_name if owner else "Unknown",
        "is_active": wall.is_active,
        "is_open": is_open,
        "is_archived": is_archived,
        "birthday_year": wall.birthday_year,
        "opens_at": wall.opens_at,
        "closes_at": wall.closes_at,
        "photos": photo_data,
        # EME Phase 1: Upload control info
        "uploads_enabled": wall.uploads_enabled,
        "upload_permission": wall.upload_permission,
        "upload_paused": wall.upload_paused,
        "is_sealed": wall.is_sealed
    }


@router.post("/birthday-wall/{wall_id}/photos")
async def upload_photo_to_wall(
    wall_id: int,
    request: UploadPhotoToWallRequest,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Upload photo to birthday wall (only allowed when wall is open)"""
    
    wall = db.query(BirthdayWall).filter(BirthdayWall.id == wall_id).first()
    if not wall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Birthday wall not found"
        )
    
    # Check if wall is open (enforce time-based access)
    now = datetime.utcnow()
    if now < wall.opens_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Birthday wall is not open yet. It will open 24 hours before your birthday."
        )
    
    if now > wall.closes_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Birthday wall is closed. It closed 48 hours after your birthday and is now archived."
        )
    
    if not wall.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Birthday wall is not active"
        )
    
    # EME Phase 1: Check upload permissions
    if wall.is_sealed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This wall is sealed and no longer accepts uploads."
        )
    
    if not wall.uploads_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Uploads are not enabled for this wall. The celebrant must enable uploads first."
        )
    
    if wall.upload_paused:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Uploads are currently paused by the celebrant."
        )
    
    # Check if user has permission to upload
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check invitation/permission
    has_permission = False
    is_birthday_mate = False
    is_invited = False
    
    # Check if user is birthday mate (same tribe)
    if wall.owner_id != user_id:
        owner = db.query(User).filter(User.id == wall.owner_id).first()
        if owner and owner.tribe_id == user.tribe_id:
            is_birthday_mate = True
        
        # Check if user has accepted invitation
        invitation = db.query(WallInvitation).filter(
            WallInvitation.wall_id == wall_id,
            WallInvitation.invited_user_id == user_id,
            WallInvitation.is_accepted == True
        ).first()
        if invitation:
            is_invited = True
    
    # Determine permission based on upload_permission setting
    if wall.upload_permission == "none":
        has_permission = False
    elif wall.upload_permission == "birthday_mates" and is_birthday_mate:
        has_permission = True
    elif wall.upload_permission == "invited_guests" and is_invited:
        has_permission = True
    elif wall.upload_permission == "both" and (is_birthday_mate or is_invited):
        has_permission = True
    
    # Owner can always upload
    if wall.owner_id == user_id:
        has_permission = True
    
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to upload to this wall. You need to be invited by the celebrant."
        )
    
    # EME Phase 1: Check upload limit (1 upload per person)
    existing_upload = db.query(WallUpload).filter(
        WallUpload.wall_id == wall_id,
        WallUpload.uploader_user_id == user_id,
        WallUpload.upload_type == "photo"
    ).first()
    
    if existing_upload:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You have already uploaded to this wall. Each person can only upload once."
        )
    
    # Check photo limit
    photo_count = db.query(WallPhoto).filter(WallPhoto.wall_id == wall_id).count()
    if photo_count >= wall.max_photos:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Photo limit reached"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    # Validate frame style
    valid_frames = ["none", "classic", "elegant", "vintage", "modern", "gold", "rainbow", "polaroid"]
    frame_style = request.frame_style or "none"
    if frame_style not in valid_frames:
        frame_style = "none"
    
    photo = WallPhoto(
        wall_id=wall_id,
        photo_url=request.photo_url,
        caption=request.caption,
        uploaded_by_user_id=user_id,
        uploaded_by_name=user.first_name if user else "Guest",
        display_order=photo_count,
        frame_style=frame_style,
        is_approved=True  # Auto-approve photos uploaded by the wall owner
    )
    db.add(photo)
    
    # EME Phase 1: Track upload to enforce limit
    wall_upload = WallUpload(
        wall_id=wall_id,
        uploader_user_id=user_id,
        uploader_email=user.email if user else None,
        uploader_name=user.first_name if user else "Guest",
        upload_type="photo",
        upload_count=1,
        last_upload_at=datetime.utcnow()
    )
    db.add(wall_upload)
    
    db.commit()
    db.refresh(photo)
    
    return {
        "photo_id": photo.id,
        "message": "Photo uploaded successfully"
    }


@router.post("/birthday-wall/{wall_id}/photos/{photo_id}/reactions")
async def add_photo_reaction(
    wall_id: int,
    photo_id: int,
    request: AddPhotoReactionRequest,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Add or remove a reaction to a photo"""
    
    # Validate emoji
    allowed_emojis = ["❤️", "👍", "😊"]
    if request.emoji not in allowed_emojis:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid emoji. Allowed: {', '.join(allowed_emojis)}"
        )
    
    # Verify photo exists and belongs to wall
    photo = db.query(WallPhoto).filter(
        WallPhoto.id == photo_id,
        WallPhoto.wall_id == wall_id
    ).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Check if user already reacted with this emoji
    existing_reaction = db.query(PhotoReaction).filter(
        PhotoReaction.photo_id == photo_id,
        PhotoReaction.user_id == user_id,
        PhotoReaction.emoji == request.emoji
    ).first()
    
    if existing_reaction:
        # Remove reaction (toggle off)
        db.delete(existing_reaction)
        db.commit()
        return {
            "message": "Reaction removed",
            "action": "removed"
        }
    else:
        # Remove any other reaction from this user on this photo (one reaction per user)
        db.query(PhotoReaction).filter(
            PhotoReaction.photo_id == photo_id,
            PhotoReaction.user_id == user_id
        ).delete()
        
        # Add new reaction
        reaction = PhotoReaction(
            photo_id=photo_id,
            user_id=user_id,
            emoji=request.emoji
        )
        db.add(reaction)
        db.commit()
        db.refresh(reaction)
        
        return {
            "message": "Reaction added",
            "action": "added",
            "reaction_id": reaction.id
        }


@router.delete("/birthday-wall/{wall_id}/photos/{photo_id}")
async def delete_photo_from_wall(
    wall_id: int,
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a photo from birthday wall (only wall owner or photo uploader can delete)"""
    
    # Verify photo exists and belongs to wall
    photo = db.query(WallPhoto).filter(
        WallPhoto.id == photo_id,
        WallPhoto.wall_id == wall_id
    ).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Verify wall exists
    wall = db.query(BirthdayWall).filter(BirthdayWall.id == wall_id).first()
    if not wall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Birthday wall not found"
        )
    
    # Check permissions: wall owner OR photo uploader can delete
    is_wall_owner = wall.owner_id == current_user.id
    is_photo_uploader = photo.uploaded_by_user_id == current_user.id
    
    if not (is_wall_owner or is_photo_uploader):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own photos or photos from your wall"
        )
    
    # Delete photo reactions first (cascade should handle this, but explicit is better)
    db.query(PhotoReaction).filter(PhotoReaction.photo_id == photo_id).delete()
    
    # Delete photo
    db.delete(photo)
    db.commit()
    
    return {
        "message": "Photo deleted successfully",
        "photo_id": photo_id
    }


@router.patch("/birthday-wall/{wall_id}/photos/{photo_id}")
async def update_photo(
    wall_id: int,
    photo_id: int,
    request: UpdatePhotoRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update photo caption or frame style (only wall owner or photo uploader can update)"""
    
    # Verify photo exists and belongs to wall
    photo = db.query(WallPhoto).filter(
        WallPhoto.id == photo_id,
        WallPhoto.wall_id == wall_id
    ).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    # Verify wall exists
    wall = db.query(BirthdayWall).filter(BirthdayWall.id == wall_id).first()
    if not wall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Birthday wall not found"
        )
    
    # Check permissions: wall owner OR photo uploader can update
    is_wall_owner = wall.owner_id == current_user.id
    is_photo_uploader = photo.uploaded_by_user_id == current_user.id
    
    if not (is_wall_owner or is_photo_uploader):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own photos or photos from your wall"
        )
    
    # Update caption if provided
    if request.caption is not None:
        photo.caption = sanitize_input(request.caption, max_length=500) if request.caption else None
    
    # Update frame style if provided
    if request.frame_style is not None:
        valid_frames = ["none", "classic", "elegant", "vintage", "modern", "gold", "rainbow", "polaroid"]
        if request.frame_style in valid_frames:
            photo.frame_style = request.frame_style
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid frame style. Allowed: {', '.join(valid_frames)}"
            )
    
    db.commit()
    db.refresh(photo)
    
    return {
        "message": "Photo updated successfully",
        "photo_id": photo.id,
        "caption": photo.caption,
        "frame_style": photo.frame_style
    }


@router.get("/birthday-wall/user/{user_id}/archive")
async def get_user_wall_archive(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all birthday walls for a user, grouped by year (archive)"""
    
    walls = db.query(BirthdayWall).filter(
        BirthdayWall.owner_id == user_id
    ).order_by(BirthdayWall.birthday_year.desc(), BirthdayWall.created_at.desc()).all()
    
    # Group walls by year
    archive_by_year = {}
    for wall in walls:
        year = wall.birthday_year
        if year not in archive_by_year:
            archive_by_year[year] = []
        
        # Get photo count
        photo_count = db.query(WallPhoto).filter(
            WallPhoto.wall_id == wall.id,
            WallPhoto.is_approved == True
        ).count()
        
        # Check status
        now = datetime.utcnow()
        is_open = wall.opens_at <= now <= wall.closes_at
        is_archived = now > wall.closes_at
        
        archive_by_year[year].append({
            "wall_id": wall.id,
            "public_url_code": wall.public_url_code,
            "title": wall.title,
            "theme": wall.theme,
            "accent_color": wall.accent_color,
            "birthday_year": wall.birthday_year,
            "photo_count": photo_count,
            "is_open": is_open,
            "is_archived": is_archived,
            "created_at": wall.created_at,
            "opens_at": wall.opens_at,
            "closes_at": wall.closes_at
        })
    
    # Convert to list format sorted by year (descending)
    archive_list = [
        {
            "year": year,
            "walls": walls_data
        }
        for year, walls_data in sorted(archive_by_year.items(), reverse=True)
    ]
    
    return {
        "archive": archive_list,
        "total_walls": len(walls)
    }


# ========== EME Phase 1: Invitation and Upload Control Endpoints ==========

@router.post("/birthday-wall/{wall_id}/invite")
async def invite_to_wall(
    wall_id: int,
    invite_request: InviteToWallRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Invite a birthday mate or guest to upload to the wall (EME Phase 1)"""
    
    wall = db.query(BirthdayWall).filter(BirthdayWall.id == wall_id).first()
    if not wall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Birthday wall not found"
        )
    
    # Only wall owner can invite
    if wall.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the wall owner can send invitations"
        )
    
    # Validate invitation type
    if invite_request.invitation_type not in ['birthday_mate', 'guest']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid invitation type. Must be 'birthday_mate' or 'guest'"
        )
    
    # For birthday mates, require user_id
    if invite_request.invitation_type == 'birthday_mate':
        if not invite_request.invited_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="invited_user_id is required for birthday mate invitations"
            )
        
        # Verify user is a birthday mate (same tribe)
        invited_user = db.query(User).filter(User.id == invite_request.invited_user_id).first()
        if not invited_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invited user not found"
            )
        
        if invited_user.tribe_id != current_user.tribe_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a birthday mate (different birthday)"
            )
        
        # Check if already invited
        existing = db.query(WallInvitation).filter(
            WallInvitation.wall_id == wall_id,
            WallInvitation.invited_user_id == invite_request.invited_user_id
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User has already been invited to this wall"
            )
    
    # For guests, require email
    elif invite_request.invitation_type == 'guest':
        if not invite_request.invited_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="invited_email is required for guest invitations"
            )
        
        # Check if email already invited
        existing = db.query(WallInvitation).filter(
            WallInvitation.wall_id == wall_id,
            WallInvitation.invited_email == invite_request.invited_email
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email has already been invited to this wall"
            )
    
    # Generate invitation code
    invitation_code = secrets.token_urlsafe(16)
    
    # Create invitation
    invitation = WallInvitation(
        wall_id=wall_id,
        invited_user_id=invite_request.invited_user_id,
        invited_email=invite_request.invited_email,
        invited_name=invite_request.invited_name,
        invitation_type=invite_request.invitation_type,
        invitation_code=invitation_code,
        invited_by_user_id=current_user.id,
        is_accepted=False
    )
    
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    
    return {
        "invitation_id": invitation.id,
        "invitation_code": invitation_code,
        "message": "Invitation sent successfully"
    }


@router.get("/birthday-wall/{wall_id}/invitations")
async def get_wall_invitations(
    wall_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all invitations for a wall (owner only)"""
    
    wall = db.query(BirthdayWall).filter(BirthdayWall.id == wall_id).first()
    if not wall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Birthday wall not found"
        )
    
    # Only wall owner can view invitations
    if wall.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the wall owner can view invitations"
        )
    
    invitations = db.query(WallInvitation).filter(
        WallInvitation.wall_id == wall_id
    ).order_by(WallInvitation.created_at.desc()).all()
    
    return {
        "invitations": [
            {
                "id": inv.id,
                "invited_user_id": inv.invited_user_id,
                "invited_email": inv.invited_email,
                "invited_name": inv.invited_name,
                "invitation_type": inv.invitation_type,
                "is_accepted": inv.is_accepted,
                "accepted_at": inv.accepted_at.isoformat() if inv.accepted_at else None,
                "created_at": inv.created_at.isoformat()
            }
            for inv in invitations
        ]
    }


@router.post("/birthday-wall/invite/accept/{invitation_code}")
async def accept_wall_invitation(
    invitation_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept a wall invitation (in-app for birthday mates)"""
    
    invitation = db.query(WallInvitation).filter(
        WallInvitation.invitation_code == invitation_code
    ).first()
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    # Check if already accepted
    if invitation.is_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has already been accepted"
        )
    
    # For birthday mates, verify user matches
    if invitation.invitation_type == 'birthday_mate':
        if invitation.invited_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This invitation is not for you"
            )
    
    # Accept invitation
    invitation.is_accepted = True
    invitation.accepted_at = datetime.utcnow()
    
    # If guest invitation, link to user account if they register
    if invitation.invitation_type == 'guest' and not invitation.invited_user_id:
        # Check if email matches current user
        if current_user.email == invitation.invited_email:
            invitation.invited_user_id = current_user.id
    
    db.commit()
    
    # Get wall info
    wall = db.query(BirthdayWall).filter(BirthdayWall.id == invitation.wall_id).first()
    
    return {
        "message": "Invitation accepted successfully",
        "wall_id": wall.id,
        "public_url_code": wall.public_url_code
    }


@router.patch("/birthday-wall/{wall_id}/upload-control")
async def update_upload_control(
    wall_id: int,
    control_request: UpdateUploadControlRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update wall upload control settings (owner only)"""
    
    wall = db.query(BirthdayWall).filter(BirthdayWall.id == wall_id).first()
    if not wall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Birthday wall not found"
        )
    
    # Only wall owner can update settings
    if wall.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the wall owner can update upload settings"
        )
    
    # Update fields if provided
    if control_request.uploads_enabled is not None:
        wall.uploads_enabled = control_request.uploads_enabled
    
    if control_request.upload_permission is not None:
        valid_permissions = ['none', 'birthday_mates', 'invited_guests', 'both']
        if control_request.upload_permission not in valid_permissions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid upload_permission. Must be one of: {', '.join(valid_permissions)}"
            )
        wall.upload_permission = control_request.upload_permission
    
    if control_request.upload_paused is not None:
        wall.upload_paused = control_request.upload_paused
    
    if control_request.is_sealed is not None:
        if control_request.is_sealed and not wall.is_sealed:
            # Sealing the wall
            wall.is_sealed = True
            wall.sealed_at = datetime.utcnow()
            wall.uploads_enabled = False  # Disable uploads when sealed
        elif not control_request.is_sealed:
            # Unsealing (only if not past close date)
            now = datetime.utcnow()
            if now > wall.closes_at:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot unseal a wall that has passed its close date"
                )
            wall.is_sealed = False
            wall.sealed_at = None
    
    db.commit()
    db.refresh(wall)
    
    return {
        "message": "Upload control updated successfully",
        "uploads_enabled": wall.uploads_enabled,
        "upload_permission": wall.upload_permission,
        "upload_paused": wall.upload_paused,
        "is_sealed": wall.is_sealed
    }


@router.get("/birthday-wall/{wall_id}/upload-status")
async def get_upload_status(
    wall_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """Get upload status and permissions for current user"""
    
    wall = db.query(BirthdayWall).filter(BirthdayWall.id == wall_id).first()
    if not wall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Birthday wall not found"
        )
    
    # Check if user has uploaded already
    has_uploaded = False
    if current_user:
        existing_upload = db.query(WallUpload).filter(
            WallUpload.wall_id == wall_id,
            WallUpload.uploader_user_id == current_user.id
        ).first()
        has_uploaded = existing_upload is not None
    
    # Check if user has invitation
    has_invitation = False
    is_invitation_accepted = False
    if current_user:
        invitation = db.query(WallInvitation).filter(
            WallInvitation.wall_id == wall_id,
            WallInvitation.invited_user_id == current_user.id
        ).first()
        if invitation:
            has_invitation = True
            is_invitation_accepted = invitation.is_accepted
    
    # Check if user is birthday mate
    is_birthday_mate = False
    if current_user and wall.owner_id != current_user.id:
        owner = db.query(User).filter(User.id == wall.owner_id).first()
        if owner and owner.tribe_id == current_user.tribe_id:
            is_birthday_mate = True
    
    # Determine if user can upload
    can_upload = False
    if current_user:
        if wall.owner_id == current_user.id:
            can_upload = True  # Owner can always upload
        elif wall.uploads_enabled and not wall.upload_paused and not wall.is_sealed:
            if wall.upload_permission == "birthday_mates" and is_birthday_mate:
                can_upload = True
            elif wall.upload_permission == "invited_guests" and is_invitation_accepted:
                can_upload = True
            elif wall.upload_permission == "both" and (is_birthday_mate or is_invitation_accepted):
                can_upload = True
    
    return {
        "uploads_enabled": wall.uploads_enabled,
        "upload_permission": wall.upload_permission,
        "upload_paused": wall.upload_paused,
        "is_sealed": wall.is_sealed,
        "can_upload": can_upload,
        "has_uploaded": has_uploaded,
        "has_invitation": has_invitation,
        "is_invitation_accepted": is_invitation_accepted,
        "is_birthday_mate": is_birthday_mate,
        "is_owner": current_user and wall.owner_id == current_user.id if current_user else False
    }

