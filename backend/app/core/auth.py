"""
Authentication and authorization utilities
"""
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
import firebase_admin
from firebase_admin import auth as firebase_auth

from app.core.database import get_db
from app.models import User


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from Firebase token in Authorization header.
    
    Usage:
        @router.get("/protected")
        async def protected_endpoint(user: User = Depends(get_current_user)):
            ...
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract token from "Bearer <token>"
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid authorization scheme")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Use: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify Firebase token
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found - may need to complete onboarding"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


async def require_admin(
    user: User = Depends(get_current_user)
) -> User:
    """
    Require admin privileges.
    
    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(admin_user: User = Depends(require_admin)):
            ...
    """
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user


async def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if authenticated, otherwise return None.
    Useful for endpoints that work for both authenticated and anonymous users.
    """
    if not authorization:
        return None
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
    except ValueError:
        return None
    
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
        user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
        return user if user and user.is_active else None
    except Exception:
        return None

