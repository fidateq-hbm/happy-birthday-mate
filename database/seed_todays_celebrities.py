"""
Add celebrities for today's date (December 27)
This adds famous people celebrating their birthday today to appear in the center of the spiral
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
from datetime import datetime

def seed_todays_celebrities():
    """Add celebrities for December 27"""
    db = SessionLocal()
    
    try:
        today = datetime.now()
        month = today.month
        day = today.day
        
        print(f"Adding celebrities for {today.strftime('%B %d')}...")
        
        # Famous people born on December 27
        celebrities = [
            {
                "name": "Timothée Chalamet",
                "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
                "description": "American-French actor known for Call Me by Your Name and Dune",
                "birth_year": 1995
            },
            {
                "name": "Gerard Depardieu",
                "photo_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
                "description": "French actor and one of the most prolific character actors in film history",
                "birth_year": 1948
            },
            {
                "name": "Salman Khan",
                "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
                "description": "Indian actor, film producer, and television personality",
                "birth_year": 1965
            }
        ]
        
        created_count = 0
        
        for celeb_data in celebrities:
            # Check if celebrity already exists
            existing = db.query(Celebrity).filter(
                Celebrity.name == celeb_data["name"]
            ).first()
            
            if existing:
                print(f"  [!] {celeb_data['name']} already exists, skipping")
                continue
            
            celebrity = Celebrity(
                name=celeb_data["name"],
                photo_url=celeb_data["photo_url"],
                description=celeb_data["description"],
                birth_month=month,
                birth_day=day,
                birth_year=celeb_data["birth_year"],
                is_active=True,
                priority=100
            )
            
            db.add(celebrity)
            created_count += 1
            print(f"  [+] Added {celeb_data['name']}")
        
        db.commit()
        print(f"\n[SUCCESS] Added {created_count} celebrities for today!")
        print(f"These will appear in the center of your celebrant spiral.")
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Happy Birthday Mate - Today's Celebrity Seeder")
    print("=" * 60)
    seed_todays_celebrities()

