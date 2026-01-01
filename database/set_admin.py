"""
Set a user as admin
Usage: python database/set_admin.py <email>
"""
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from dotenv import load_dotenv
load_dotenv(backend_path / ".env")

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User

def set_admin(email: str):
    """Set a user as admin by email"""
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ User with email '{email}' not found!")
            return False
        
        user.is_admin = True
        db.commit()
        
        print(f"✅ User '{user.first_name}' ({user.email}) is now an admin!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python database/set_admin.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    set_admin(email)

