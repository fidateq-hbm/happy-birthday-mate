from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

from app.core.database import get_db
from app.core.auth import get_current_user, get_optional_user
from app.models import User, ContactSubmission

router = APIRouter()


class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    city: Optional[str] = None
    state_visibility_enabled: Optional[bool] = None


class UpdateProfilePictureRequest(BaseModel):
    profile_picture_url: str


@router.get("/{user_id}")
async def get_user_profile(
    user_id: int,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get user profile by ID.
    Public endpoint - returns limited profile info.
    Authenticated users can see more details.
    """
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # If viewing own profile or authenticated, return full details
    if current_user and (current_user.id == user_id or current_user.is_admin):
        return {
            "id": user.id,
            "first_name": user.first_name,
            "profile_picture_url": user.profile_picture_url,
            "tribe_id": user.tribe_id,
            "country": user.country,
            "state": user.state,
            "city": user.city if user.state_visibility_enabled else None,
        }
    
    # Public profile - limited info
    return {
        "id": user.id,
        "first_name": user.first_name,
        "profile_picture_url": user.profile_picture_url,
        "tribe_id": user.tribe_id,
        "country": user.country,
        "state": user.state if user.state_visibility_enabled else None,
        "city": None,  # City only visible to authenticated users
    }


@router.patch("/{user_id}")
async def update_user_profile(
    user_id: int,
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile - requires authentication and ownership"""
    # Users can only update their own profile (unless admin)
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate input
    if request.first_name is not None:
        if len(request.first_name.strip()) < 1 or len(request.first_name) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="First name must be between 1 and 100 characters"
            )
        user.first_name = request.first_name.strip()
    
    if request.city is not None:
        if len(request.city) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="City name too long"
            )
        user.city = request.city.strip() if request.city else None
    
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile picture - requires authentication and ownership"""
    # Users can only update their own profile picture (unless admin)
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile picture"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate URL
    if not request.profile_picture_url.startswith(('http://', 'https://', '/')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid profile picture URL"
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


class ContactFormRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    user_id: Optional[int] = None


@router.post("/contact")
async def submit_contact_form(
    request: ContactFormRequest,
    db: Session = Depends(get_db)
):
    """Submit a contact form message"""
    
    # Validate subject
    valid_subjects = ['account', 'technical', 'feature', 'feedback', 'gift', 'wall', 'tribe', 'other']
    if request.subject not in valid_subjects:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid subject. Must be one of: {', '.join(valid_subjects)}"
        )
    
    # Create contact submission
    submission = ContactSubmission(
        name=request.name,
        email=request.email,
        subject=request.subject,
        message=request.message,
        user_id=request.user_id,
        status="pending"
    )
    
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    # TODO: Send email notification to support team
    # TODO: Send auto-reply confirmation email to user
    
    return {
        "message": "Contact form submitted successfully",
        "submission_id": submission.id,
        "status": "pending"
    }

