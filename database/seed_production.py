"""
Production seed script for Happy Birthday Mate
Run this after migrations to populate production database with essential data
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

def seed_production():
    """Seed all essential production data"""
    print("=" * 60)
    print("Happy Birthday Mate - Production Data Seeding")
    print("=" * 60)
    
    # Import seed functions
    from seed_gift_catalog import seed_gift_catalog
    from seed_celebrities_for_today import seed_celebrities_for_today
    
    try:
        print("\n1. Seeding gift catalog...")
        seed_gift_catalog()
        print("✅ Gift catalog seeded")
        
        print("\n2. Seeding celebrities for today...")
        seed_celebrities_for_today()
        print("✅ Celebrities seeded")
        
        print("\n" + "=" * 60)
        print("🎉 Production data seeding complete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error seeding data: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    seed_production()

