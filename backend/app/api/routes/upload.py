from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends, Request
from pathlib import Path
import shutil
import uuid
from datetime import datetime
import os
from sqlalchemy.orm import Session
from PIL import Image
import io

from app.core.auth import get_current_user
from app.core.database import get_db
from app.core.security import limiter, validate_file_content
from app.models import User, BirthdayWall

router = APIRouter()

# Create uploads directories if they don't exist
PROFILE_PICTURES_DIR = Path("uploads/profile_pictures")
PROFILE_PICTURES_DIR.mkdir(parents=True, exist_ok=True)

BIRTHDAY_WALLS_DIR = Path("uploads/birthday_walls")
BIRTHDAY_WALLS_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/profile-picture")
@limiter.limit("20/hour")  # Rate limit uploads
async def upload_profile_picture(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload profile picture to local storage.
    Requires authentication - users can only upload their own profile picture.
    For production, this should be moved to a proper storage service.
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only images are allowed."
        )
    
    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB."
        )
    
    # Validate file content (actual file validation, not just MIME type)
    is_valid, error_msg = validate_file_content(contents, allowed_types)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=error_msg or "Invalid image file"
        )
    
    # Generate unique filename using authenticated user's ID
    file_extension = Path(file.filename).suffix
    unique_filename = f"{current_user.id}_{uuid.uuid4().hex}{file_extension}"
    file_path = PROFILE_PICTURES_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    # Construct URL from request to ensure correct protocol and domain
    # This works in both development and production without needing env vars
    base_url = str(request.base_url).rstrip('/')
    # Use /api/uploads to match the static files mount path
    file_url = f"{base_url}/api/uploads/profile_pictures/{unique_filename}"
    
    return {
        "url": file_url,
        "filename": unique_filename,
        "size": len(contents),
        "uploaded_at": datetime.utcnow().isoformat()
    }


@router.post("/birthday-wall-photo")
@limiter.limit("20/hour")  # Rate limit uploads
async def upload_birthday_wall_photo(
    request: Request,
    file: UploadFile = File(...),
    wall_id: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload photo to birthday wall.
    Requires authentication and verifies wall ownership/access.
    For production, this should be moved to a proper storage service.
    """
    # Verify wall exists and user has access
    wall = db.query(BirthdayWall).filter(BirthdayWall.id == wall_id).first()
    if not wall:
        raise HTTPException(
            status_code=404,
            detail="Birthday wall not found"
        )
    
    # Check if wall is open (users can only upload when wall is active)
    now = datetime.utcnow()
    if now < wall.opens_at or now > wall.closes_at:
        raise HTTPException(
            status_code=403,
            detail="Birthday wall is not open for uploads"
        )
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only images are allowed."
        )
    
    # Validate file size (max 10MB for wall photos)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB."
        )
    
    # Validate file content (actual file validation, not just MIME type)
    is_valid, error_msg = validate_file_content(contents, allowed_types)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=error_msg or "Invalid image file"
        )
    
    # Create wall-specific directory
    wall_dir = BIRTHDAY_WALLS_DIR / str(wall_id)
    wall_dir.mkdir(parents=True, exist_ok=True)
    
    # Resize image to standard portrait size (3:4 aspect ratio)
    # Standard size: 600x800 pixels (portrait orientation)
    TARGET_WIDTH = 600
    TARGET_HEIGHT = 800
    
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(contents))
        
        # Convert RGBA to RGB if necessary (for PNG with transparency)
        if image.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            rgb_image = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = rgb_image
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Calculate resize dimensions maintaining aspect ratio
        # Crop to center and resize to target dimensions
        original_width, original_height = image.size
        target_aspect = TARGET_WIDTH / TARGET_HEIGHT
        original_aspect = original_width / original_height
        
        if original_aspect > target_aspect:
            # Image is wider - crop width
            new_width = int(original_height * target_aspect)
            left = (original_width - new_width) // 2
            image = image.crop((left, 0, left + new_width, original_height))
        else:
            # Image is taller - crop height
            new_height = int(original_width / target_aspect)
            top = (original_height - new_height) // 2
            image = image.crop((0, top, original_width, top + new_height))
        
        # Resize to target dimensions
        image = image.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
        
        # Save resized image to bytes
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=85, optimize=True)
        contents = output.getvalue()
        file_extension = '.jpg'  # Always save as JPEG after processing
    except Exception as e:
        # If image processing fails, use original (but log the error)
        print(f"Warning: Image resize failed, using original: {str(e)}")
        file_extension = Path(file.filename).suffix
    
    # Generate unique filename using authenticated user's ID
    if 'file_extension' not in locals():
        file_extension = Path(file.filename).suffix
    unique_filename = f"{current_user.id}_{uuid.uuid4().hex}{file_extension}"
    file_path = wall_dir / unique_filename
    
    # Save resized file
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    # Construct URL from request to ensure correct protocol and domain
    # This works in both development and production without needing env vars
    base_url = str(request.base_url).rstrip('/')
    # Use /api/uploads to match the static files mount path
    file_url = f"{base_url}/api/uploads/birthday_walls/{wall_id}/{unique_filename}"
    
    return {
        "url": file_url,
        "filename": unique_filename,
        "size": len(contents),
        "uploaded_at": datetime.utcnow().isoformat()
    }


@router.delete("/profile-picture/{filename}")
async def delete_profile_picture(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a profile picture - requires authentication and ownership"""
    # Verify filename belongs to current user
    if not filename.startswith(f"{current_user.id}_"):
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own profile pictures"
        )
    
    file_path = PROFILE_PICTURES_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_path.unlink()
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

