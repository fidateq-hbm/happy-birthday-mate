from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from datetime import date, datetime
from typing import Optional
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
import os

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.security import limiter, sanitize_input
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
    
    @validator('first_name', 'country', 'state', 'city')
    def sanitize_strings(cls, v):
        if v:
            return sanitize_input(str(v), max_length=100)
        return v
    
    @validator('firebase_uid')
    def validate_firebase_uid(cls, v):
        if not v or len(v) < 10 or len(v) > 200:
            raise ValueError('Invalid firebase_uid')
        return v


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
@limiter.limit("10/minute")  # Rate limit signups
async def signup(request: Request, signup_data: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user with complete onboarding data.
    Birthday Tribe is automatically assigned based on MM-DD.
    """
    request_data = signup_data
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.firebase_uid == request_data.firebase_uid).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    # Check consent
    if not request_data.consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent must be given to create an account"
        )
    
    # Extract month and day for tribe assignment
    birth_month = request_data.date_of_birth.month
    birth_day = request_data.date_of_birth.day
    tribe_id = f"{birth_month:02d}-{birth_day:02d}"
    
    # Create user
    new_user = User(
        firebase_uid=request_data.firebase_uid,
        email=request_data.email,
        first_name=request_data.first_name,
        date_of_birth=request_data.date_of_birth,
        gender=request_data.gender,
        country=request_data.country,
        state=request_data.state,
        city=request_data.city,
        profile_picture_url=request_data.profile_picture_url,
        birth_month=birth_month,
        birth_day=birth_day,
        tribe_id=tribe_id,
        consent_given=request_data.consent_given,
        is_verified=True,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user profile using Authorization header.
    Returns 404 if user hasn't completed onboarding (expected behavior).
    """
    # current_user is already fetched and validated by get_current_user dependency
    return current_user


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

