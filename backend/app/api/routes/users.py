from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

from app.core.database import get_db
from app.models import User

router = APIRouter()


class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    city: Optional[str] = None
    state_visibility_enabled: Optional[bool] = None


class UpdateProfilePictureRequest(BaseModel):
    profile_picture_url: str


@router.get("/{user_id}")
async def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Get user profile by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": user.id,
        "first_name": user.first_name,
        "profile_picture_url": user.profile_picture_url,
        "tribe_id": user.tribe_id,
        "country": user.country,
        "state": user.state,
        "city": user.city,
    }


@router.patch("/{user_id}")
async def update_user_profile(
    user_id: int,
    request: UpdateProfileRequest,
    db: Session = Depends(get_db)
):
    """Update user profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if request.first_name is not None:
        user.first_name = request.first_name
    if request.city is not None:
        user.city = request.city
    if request.state_visibility_enabled is not None:
        user.state_visibility_enabled = request.state_visibility_enabled
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return {"message": "Profile updated successfully"}


@router.put("/{user_id}/profile-picture")
async def update_profile_picture(
    user_id: int,
    request: UpdateProfilePictureRequest,
    db: Session = Depends(get_db)
):
    """Update profile picture"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update profile picture
    user.profile_picture_url = request.profile_picture_url
    user.last_profile_picture_change = datetime.utcnow()
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "Profile picture updated successfully",
        "profile_picture_url": user.profile_picture_url
    }


@router.get("/tribe/{tribe_id}/members")
async def get_tribe_members(
    tribe_id: str,
    limit: int = 30,
    random_sample: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get members of a birthday tribe
    
    Args:
        tribe_id: The tribe ID (format: MM-DD)
        limit: Maximum number of members to return (default: 30, max: 100)
        random_sample: If True, returns random members instead of sequential
    """
    # Cap the limit to prevent abuse
    limit = min(limit, 100)
    
    # Get total count
    total_count = db.query(User).filter(
        User.tribe_id == tribe_id,
        User.is_active == True
    ).count()
    
    # Get members
    query = db.query(User).filter(
        User.tribe_id == tribe_id,
        User.is_active == True
    )
    
    if random_sample:
        # Use ORDER BY RANDOM() for PostgreSQL (or RAND() for MySQL)
        from sqlalchemy import func
        query = query.order_by(func.random())
    
    members = query.limit(limit).all()
    
    return {
        "tribe_id": tribe_id,
        "total_count": total_count,
        "returned_count": len(members),
        "members": [
            {
                "id": m.id,
                "first_name": m.first_name,
                "profile_picture_url": m.profile_picture_url,
                "country": m.country,
                "state": m.state,
                "date_of_birth": m.date_of_birth.isoformat() if m.date_of_birth else None,
            }
            for m in members
        ]
    }

