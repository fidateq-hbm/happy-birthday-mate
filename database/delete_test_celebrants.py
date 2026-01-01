"""
Delete all test celebrants and recreate them with real photos
"""
import sys
from pathlib import Path
import os

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(backend_path / ".env")

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User

def delete_test_celebrants():
    """Delete all test celebrants"""
    db = SessionLocal()
    
    try:
        # Delete all users with firebase_uid starting with "test_celebrant_"
        deleted_count = db.query(User).filter(
            User.firebase_uid.like("test_celebrant_%")
        ).delete(synchronize_session=False)
        
        db.commit()
        print(f"[SUCCESS] Deleted {deleted_count} test celebrants!")
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Deleting test celebrants...")
    print("=" * 60)
    delete_test_celebrants()
    print("\nNow run: python database\\seed_test_celebrants.py")

