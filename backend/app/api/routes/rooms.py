from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from pydantic import BaseModel, field_validator
from typing import Optional
import secrets

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.security import limiter, sanitize_input
from app.models import Room, RoomParticipant, Message, User, RoomTypeEnum, BirthdayWall, WallPhoto, WallThemeEnum, PhotoReaction, BackgroundAnimationEnum

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
    db: Session = Depends(get_db)
):
    """Get user's active birthday wall"""
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
        "photos": photo_data
    }


@router.get("/birthday-wall/{wall_code}")
async def get_birthday_wall(
    wall_code: str, 
    user_id: Optional[int] = None,
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
        "photos": photo_data
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

