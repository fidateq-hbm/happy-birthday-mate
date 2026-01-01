from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pathlib import Path
import shutil
import uuid
from datetime import datetime
import os

router = APIRouter()

# Create uploads directories if they don't exist
PROFILE_PICTURES_DIR = Path("uploads/profile_pictures")
PROFILE_PICTURES_DIR.mkdir(parents=True, exist_ok=True)

BIRTHDAY_WALLS_DIR = Path("uploads/birthday_walls")
BIRTHDAY_WALLS_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    """
    Upload profile picture to local storage.
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
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{user_id}_{uuid.uuid4().hex}{file_extension}"
    file_path = PROFILE_PICTURES_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    # Return URL (accessible via FastAPI static files)
    file_url = f"/uploads/profile_pictures/{unique_filename}"
    
    return {
        "url": file_url,
        "filename": unique_filename,
        "size": len(contents),
        "uploaded_at": datetime.utcnow().isoformat()
    }


@router.post("/birthday-wall-photo")
async def upload_birthday_wall_photo(
    file: UploadFile = File(...),
    wall_id: int = Form(...),
    user_id: int = Form(...)
):
    """
    Upload photo to birthday wall.
    For production, this should be moved to a proper storage service.
    """
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
    
    # Create wall-specific directory
    wall_dir = BIRTHDAY_WALLS_DIR / str(wall_id)
    wall_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{user_id}_{uuid.uuid4().hex}{file_extension}"
    file_path = wall_dir / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    # Return full URL (prepend API URL if available)
    # For production, use NEXT_PUBLIC_API_URL or API_URL from env
    api_url = os.getenv("API_URL", os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000"))
    file_url = f"{api_url}/uploads/birthday_walls/{wall_id}/{unique_filename}"
    
    return {
        "url": file_url,
        "filename": unique_filename,
        "size": len(contents),
        "uploaded_at": datetime.utcnow().isoformat()
    }


@router.delete("/profile-picture/{filename}")
async def delete_profile_picture(filename: str):
    """Delete a profile picture"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_path.unlink()
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

