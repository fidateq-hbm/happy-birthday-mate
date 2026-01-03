#!/usr/bin/env python3
"""
Quick script to check if all dependencies can be imported
Run this locally before deploying to catch import errors early
"""
import sys

def check_imports():
    """Check if all critical imports work"""
    errors = []
    
    try:
        from PIL import Image
        print("[OK] PIL/Pillow import successful")
    except ImportError as e:
        errors.append(f"[ERROR] PIL/Pillow import failed: {e}")
    
    try:
        import fastapi
        print("[OK] FastAPI import successful")
    except ImportError as e:
        errors.append(f"[ERROR] FastAPI import failed: {e}")
    
    try:
        import sqlalchemy
        print("[OK] SQLAlchemy import successful")
    except ImportError as e:
        errors.append(f"[ERROR] SQLAlchemy import failed: {e}")
    
    try:
        from app.core.database import get_db
        print("[OK] Database imports successful")
    except ImportError as e:
        errors.append(f"[ERROR] Database imports failed: {e}")
    
    try:
        from app.api.routes.upload import router
        print("[OK] Upload routes import successful")
    except ImportError as e:
        errors.append(f"[ERROR] Upload routes import failed: {e}")
    
    if errors:
        print("\n[ERROR] Import errors found:")
        for error in errors:
            print(f"  {error}")
        sys.exit(1)
    else:
        print("\n[SUCCESS] All imports successful! Ready for deployment.")

if __name__ == "__main__":
    check_imports()

