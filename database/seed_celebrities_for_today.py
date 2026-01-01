"""
Add celebrities for today's date dynamically
This script adds famous people celebrating their birthday today
Uses the celebrities_database.py template for data
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
from app.models.admin import Celebrity
from datetime import datetime, date

# Import the celebrities database
from celebrities_database import get_celebrities_for_date

def seed_celebrities_for_today():
    """Add celebrities for today's date"""
    db = SessionLocal()
    
    try:
        today = date.today()
        month = today.month
        day = today.day
        
        print(f"Adding celebrities for {today.strftime('%B %d')} ({month}/{day})...")
        
        # Get celebrities from the database template
        celebrities = get_celebrities_for_date(month, day)
        
        if not celebrities:
            print(f"  [!] No celebrities found in database for {month}/{day}")
            print(f"  [!] Please add celebrities to database/celebrities_database.py")
            return
        
        created_count = 0
        
        for celeb_data in celebrities:
            # Check if celebrity already exists for this date
            existing = db.query(Celebrity).filter(
                Celebrity.birth_month == month,
                Celebrity.birth_day == day,
                Celebrity.name == celeb_data["name"]
            ).first()
            
            if existing:
                print(f"  [!] {celeb_data['name']} already exists for {month}/{day}, skipping")
                continue
            
            celebrity = Celebrity(
                name=celeb_data["name"],
                photo_url=celeb_data["photo_url"],
                description=celeb_data["description"],
                birth_month=month,
                birth_day=day,
                birth_year=celeb_data.get("birth_year"),
                is_active=True,
                priority=100
            )
            
            db.add(celebrity)
            created_count += 1
            print(f"  [+] Added {celeb_data['name']} for {month}/{day}")
        
        db.commit()
        print(f"\n[SUCCESS] Added {created_count} celebrities for {today.strftime('%B %d')}!")
        print(f"These will appear in the celebrity section on the homepage.")
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Happy Birthday Mate - Today's Celebrity Seeder")
    print("=" * 60)
    seed_celebrities_for_today()

