from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.security import limiter, sanitize_input
from app.models import User, Room, RoomParticipant, Message, RoomTypeEnum

router = APIRouter()


class TribeInfo(BaseModel):
    tribe_id: str
    member_count: int
    is_active: bool
    opens_at: datetime
    closes_at: datetime


@router.get("/{tribe_id}")
async def get_tribe_info(tribe_id: str, db: Session = Depends(get_db)):
    """Get information about a birthday tribe"""
    
    # Get member count
    member_count = db.query(User).filter(User.tribe_id == tribe_id).count()
    
    # Check if tribe is active (it's their birthday)
    today = date.today()
    month, day = map(int, tribe_id.split("-"))
    is_birthday = (today.month == month and today.day == day)
    
    # Calculate opens/closes times
    if is_birthday:
        opens_at = datetime.combine(today, datetime.min.time())
        closes_at = datetime.combine(today, datetime.max.time())
    else:
        next_birthday = date(today.year, month, day)
        if next_birthday < today:
            next_birthday = date(today.year + 1, month, day)
        opens_at = datetime.combine(next_birthday, datetime.min.time())
        closes_at = datetime.combine(next_birthday, datetime.max.time())
    
    return {
        "tribe_id": tribe_id,
        "member_count": member_count,
        "is_active": is_birthday,
        "opens_at": opens_at,
        "closes_at": closes_at,
    }


@router.get("/{tribe_id}/room")
@limiter.limit("30/minute")  # Rate limit
async def get_tribe_room(
    request: Request,
    tribe_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get or create the birthday tribe room.
    Only accessible on the birthday day.
    Requires authentication.
    """
    
    # Verify user belongs to this tribe
    user = current_user
    if user.tribe_id != tribe_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't belong to this tribe"
        )
    
    # Check if it's the birthday
    today = date.today()
    month, day = map(int, tribe_id.split("-"))
    is_birthday = (today.month == month and today.day == day)
    
    if not is_birthday:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tribe room only opens on your birthday"
        )
    
    # Find or create tribe room for today
    room = db.query(Room).filter(
        Room.room_type == RoomTypeEnum.TRIBE,
        Room.room_identifier == tribe_id,
        Room.opens_at >= datetime.combine(today, datetime.min.time())
    ).first()
    
    if not room:
        # Create room
        opens_at = datetime.combine(today, datetime.min.time())
        closes_at = datetime.combine(today, datetime.max.time())
        
        room = Room(
            room_type=RoomTypeEnum.TRIBE,
            room_identifier=tribe_id,
            name=f"Birthday Tribe {tribe_id}",
            opens_at=opens_at,
            closes_at=closes_at,
            is_active=True,
        )
        db.add(room)
        db.commit()
        db.refresh(room)
    
    # Add user as participant if not already
    participant = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room.id,
        RoomParticipant.user_id == user.id
    ).first()
    
    if not participant:
        participant = RoomParticipant(
            room_id=room.id,
            user_id=user.id,
            is_birthday_mate=True
        )
        db.add(participant)
        db.commit()
    
    return {
        "room_id": room.id,
        "tribe_id": tribe_id,
        "is_active": room.is_active,
        "closes_at": room.closes_at,
    }


class SendTribeMessageRequest(BaseModel):
    message: str
    
    @validator('message')
    def sanitize_message(cls, v):
        if v:
            return sanitize_input(str(v), max_length=1000)
        return v


@router.post("/{tribe_id}/room/{room_id}/messages")
@limiter.limit("60/minute")  # Rate limit messages
async def send_tribe_message(
    request: Request,
    tribe_id: str,
    room_id: int,
    message_data: SendTribeMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message in the tribe room (text only) - requires authentication"""
    
    # Verify room exists and is active
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    if not room.is_active or room.is_read_only:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Room is not active"
        )
    
    # Verify user is participant
    participant = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == current_user.id
    ).first()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    
    # Create message
    new_message = Message(
        room_id=room_id,
        user_id=current_user.id,
        content=message_data.message
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return {
        "message_id": new_message.id,
        "content": new_message.content,
        "created_at": new_message.created_at
    }


@router.get("/{tribe_id}/room/{room_id}/messages")
@limiter.limit("100/minute")  # Rate limit message fetching
async def get_tribe_messages(
    request: Request,
    tribe_id: str,
    room_id: int,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get messages from tribe room - requires authentication"""
    
    # Verify user is participant
    participant = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == current_user.id
    ).first()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this room"
        )
    
    # Get messages
    messages = db.query(Message).filter(
        Message.room_id == room_id,
        Message.is_deleted == False
    ).order_by(Message.created_at.desc()).limit(limit).all()
    
    return {
        "messages": [
            {
                "id": msg.id,
                "user_id": msg.user_id,
                "content": msg.content,
                "created_at": msg.created_at,
                "updated_at": getattr(msg, 'updated_at', None),
                "is_edited": hasattr(msg, 'updated_at') and msg.updated_at is not None and msg.updated_at != msg.created_at
            }
            for msg in reversed(messages)
        ]
    }


@router.put("/{tribe_id}/room/{room_id}/messages/{message_id}")
@limiter.limit("30/minute")  # Rate limit edits
async def edit_tribe_message(
    request: Request,
    tribe_id: str,
    room_id: int,
    message_id: int,
    message_data: SendTribeMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Edit a message in the tribe room (only by the sender) - requires authentication"""
    
    # Get the message
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Verify message belongs to this room
    if message.room_id != room_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Message does not belong to this room"
        )
    
    # Verify user is the sender
    if message.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own messages"
        )
    
    # Verify message is not deleted
    if message.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit a deleted message"
        )
    
    # Verify room is still active
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room or not room.is_active or room.is_read_only:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Room is not active"
        )
    
    # Update message
    message.content = message_data.message
    message.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(message)
    
    return {
        "message_id": message.id,
        "content": message.content,
        "updated_at": message.updated_at
    }


@router.delete("/{tribe_id}/room/{room_id}/messages/{message_id}")
async def delete_tribe_message(
    tribe_id: str,
    room_id: int,
    message_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Delete a message in the tribe room (only by the sender)"""
    
    # Get the message
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Verify message belongs to this room
    if message.room_id != room_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Message does not belong to this room"
        )
    
    # Verify user is the sender
    if message.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own messages"
        )
    
    # Soft delete
    message.is_deleted = True
    message.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "message_id": message.id,
        "deleted": True
    }

