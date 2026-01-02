from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
import os

from app.core.database import get_db
from app.models import User, GenderEnum
from app.core.config import settings

router = APIRouter()

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    try:
        # Try environment variable first (for Render/cloud deployments)
        if settings.FIREBASE_CREDENTIALS:
            import json
            cred_dict = json.loads(settings.FIREBASE_CREDENTIALS)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        # Fallback to file path (for local development)
        elif os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
        else:
            print(f"Warning: Firebase credentials not found. Set FIREBASE_CREDENTIALS env var or {settings.FIREBASE_CREDENTIALS_PATH} file.")
    except Exception as e:
        print(f"Warning: Firebase Admin SDK not initialized: {e}")


class SignupRequest(BaseModel):
    firebase_uid: str
    email: EmailStr
    first_name: str
    date_of_birth: date
    gender: GenderEnum
    country: str
    state: str
    city: Optional[str] = None
    profile_picture_url: str
    consent_given: bool


class UserResponse(BaseModel):
    id: int
    firebase_uid: str
    email: str
    first_name: str
    date_of_birth: date
    birth_month: int
    birth_day: int
    gender: str
    country: str
    state: str
    city: Optional[str]
    profile_picture_url: str
    tribe_id: str
    state_visibility_enabled: bool
    is_admin: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


@router.post("/signup", response_model=UserResponse)
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user with complete onboarding data.
    Birthday Tribe is automatically assigned based on MM-DD.
    """
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.firebase_uid == request.firebase_uid).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    # Check consent
    if not request.consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent must be given to create an account"
        )
    
    # Extract month and day for tribe assignment
    birth_month = request.date_of_birth.month
    birth_day = request.date_of_birth.day
    tribe_id = f"{birth_month:02d}-{birth_day:02d}"
    
    # Create user
    new_user = User(
        firebase_uid=request.firebase_uid,
        email=request.email,
        first_name=request.first_name,
        date_of_birth=request.date_of_birth,
        gender=request.gender,
        country=request.country,
        state=request.state,
        city=request.city,
        profile_picture_url=request.profile_picture_url,
        birth_month=birth_month,
        birth_day=birth_day,
        tribe_id=tribe_id,
        consent_given=request.consent_given,
        is_verified=True,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.get("/me", response_model=UserResponse)
async def get_current_user(firebase_uid: str, db: Session = Depends(get_db)):
    """
    Get current user profile.
    Returns 404 if user hasn't completed onboarding (expected behavior).
    """
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        # 404 is expected for users who haven't completed onboarding
        # This is not an error, just means they need to complete signup
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found - may need to complete onboarding"
        )
    return user


@router.get("/verify-token")
async def verify_firebase_token(token: str):
    """Verify Firebase ID token"""
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return {
            "valid": True,
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

