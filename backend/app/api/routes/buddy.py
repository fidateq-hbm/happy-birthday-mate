from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, timedelta

from app.core.database import get_db
from app.models import BirthdayBuddy, User, Room, RoomTypeEnum

router = APIRouter()


class BuddyStatusResponse(BaseModel):
    has_buddy: bool
    buddy_id: Optional[int] = None
    buddy_name: Optional[str] = None
    buddy_photo: Optional[str] = None
    is_accepted: bool = False
    is_revealed: bool = False
    room_id: Optional[int] = None
    expires_at: Optional[datetime] = None


class AcceptBuddyRequest(BaseModel):
    accept: bool


@router.get("/status/{user_id}")
async def get_buddy_status(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user's birthday buddy status"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user has a buddy for their birthday
    today = date.today()
    user_birthday = date(today.year, user.birth_month, user.birth_day)
    
    # Find active buddy pairing
    buddy = db.query(BirthdayBuddy).filter(
        or_(
            and_(BirthdayBuddy.user_1_id == user_id, BirthdayBuddy.birthday_date == user_birthday),
            and_(BirthdayBuddy.user_2_id == user_id, BirthdayBuddy.birthday_date == user_birthday)
        ),
        BirthdayBuddy.is_active == True
    ).first()
    
    if not buddy:
        return BuddyStatusResponse(has_buddy=False)
    
    # Determine which user is the buddy
    if buddy.user_1_id == user_id:
        buddy_user_id = buddy.user_2_id
        is_accepted = buddy.user_1_accepted
    else:
        buddy_user_id = buddy.user_1_id
        is_accepted = buddy.user_2_accepted
    
    buddy_user = db.query(User).filter(User.id == buddy_user_id).first()
    
    return BuddyStatusResponse(
        has_buddy=True,
        buddy_id=buddy_user_id,
        buddy_name=buddy_user.first_name if buddy.is_revealed else None,
        buddy_photo=buddy_user.profile_picture_url if buddy.is_revealed else None,
        is_accepted=is_accepted,
        is_revealed=buddy.is_revealed,
        room_id=buddy.room_id,
        expires_at=buddy.expires_at
    )


@router.post("/match/{user_id}")
async def create_buddy_match(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Create or find a birthday buddy match for the user"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user already has a buddy
    today = date.today()
    user_birthday = date(today.year, user.birth_month, user.birth_day)
    
    existing_buddy = db.query(BirthdayBuddy).filter(
        or_(
            and_(BirthdayBuddy.user_1_id == user_id, BirthdayBuddy.birthday_date == user_birthday),
            and_(BirthdayBuddy.user_2_id == user_id, BirthdayBuddy.birthday_date == user_birthday)
        ),
        BirthdayBuddy.is_active == True
    ).first()
    
    if existing_buddy:
        return {
            "message": "You already have a birthday buddy",
            "buddy_id": existing_buddy.id
        }
    
    # Find another user with the same birthday who doesn't have a buddy
    potential_buddy = db.query(User).filter(
        User.id != user_id,
        User.birth_month == user.birth_month,
        User.birth_day == user.birth_day,
        User.is_active == True
    ).first()
    
    if not potential_buddy:
        # No match found - store as pending
        # In a real system, you might want to queue this for later matching
        return {
            "message": "No birthday buddy found yet. We'll match you when someone else with your birthday joins!",
            "matched": False
        }
    
    # Check if potential buddy already has a buddy
    existing_buddy_for_match = db.query(BirthdayBuddy).filter(
        or_(
            and_(BirthdayBuddy.user_1_id == potential_buddy.id, BirthdayBuddy.birthday_date == user_birthday),
            and_(BirthdayBuddy.user_2_id == potential_buddy.id, BirthdayBuddy.birthday_date == user_birthday)
        ),
        BirthdayBuddy.is_active == True
    ).first()
    
    if existing_buddy_for_match:
        return {
            "message": "No birthday buddy found yet. We'll match you when someone else with your birthday joins!",
            "matched": False
        }
    
    # Create buddy pairing
    new_buddy = BirthdayBuddy(
        user_1_id=user_id,
        user_2_id=potential_buddy.id,
        birthday_date=user_birthday,
        is_active=True,
        user_1_accepted=False,
        user_2_accepted=False,
        is_revealed=False,
        expires_at=datetime.utcnow() + timedelta(days=7)  # Expires in 7 days
    )
    
    db.add(new_buddy)
    db.commit()
    db.refresh(new_buddy)
    
    return {
        "message": "Birthday buddy matched!",
        "buddy_id": new_buddy.id,
        "matched": True
    }


@router.post("/accept/{user_id}")
async def accept_buddy(
    user_id: int,
    request: AcceptBuddyRequest,
    db: Session = Depends(get_db)
):
    """Accept or reject birthday buddy"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    today = date.today()
    user_birthday = date(today.year, user.birth_month, user.birth_day)
    
    # Find buddy pairing
    buddy = db.query(BirthdayBuddy).filter(
        or_(
            and_(BirthdayBuddy.user_1_id == user_id, BirthdayBuddy.birthday_date == user_birthday),
            and_(BirthdayBuddy.user_2_id == user_id, BirthdayBuddy.birthday_date == user_birthday)
        ),
        BirthdayBuddy.is_active == True
    ).first()
    
    if not buddy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No birthday buddy found"
        )
    
    # Update acceptance status
    if buddy.user_1_id == user_id:
        buddy.user_1_accepted = request.accept
    else:
        buddy.user_2_accepted = request.accept
    
    # If both accepted, create room and reveal identities
    if buddy.user_1_accepted and buddy.user_2_accepted:
        # Create 1-on-1 room
        room = Room(
            room_type=RoomTypeEnum.BUDDY,
            room_identifier=f"buddy_{buddy.id}",
            name=f"Birthday Buddy Chat",
            owner_id=None,  # No owner for buddy rooms
            opens_at=datetime.utcnow(),
            closes_at=datetime.utcnow() + timedelta(days=7),
            is_active=True
        )
        
        db.add(room)
        db.flush()  # Get room ID
        
        buddy.room_id = room.id
        buddy.is_revealed = True
    
    db.commit()
    
    return {
        "message": "Buddy " + ("accepted" if request.accept else "rejected"),
        "both_accepted": buddy.user_1_accepted and buddy.user_2_accepted,
        "room_id": buddy.room_id if buddy.user_1_accepted and buddy.user_2_accepted else None
    }

