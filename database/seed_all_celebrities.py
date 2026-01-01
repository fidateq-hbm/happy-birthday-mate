"""
Seed all celebrities from the celebrities_database.py file
This script reads from the database template and populates the database
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
from datetime import date

# Import the celebrities database
from celebrities_database import CELEBRITIES_DATABASE, get_population_stats

def seed_all_celebrities(dry_run: bool = False):
    """
    Seed all celebrities from the database template.
    
    Args:
        dry_run: If True, only shows what would be added without actually adding
    """
    db = SessionLocal()
    
    try:
        stats = get_population_stats()
        print("Celebrity Database Seeder")
        print("=" * 60)
        print(f"Database Status: {stats['populated_dates']}/{stats['total_dates']} dates populated ({stats['percentage_populated']}%)")
        print(f"Total celebrities in template: {stats['total_celebrities']}")
        print()
        
        if dry_run:
            print("DRY RUN MODE - No changes will be made to database")
            print()
        
        total_added = 0
        total_skipped = 0
        total_errors = 0
        
        # Iterate through all dates in the database
        for (month, day), celebrities in CELEBRITIES_DATABASE.items():
            if not celebrities:
                continue  # Skip empty dates
            
            print(f"Processing {month:02d}/{day:02d}... ({len(celebrities)} celebrities)")
            
            for celeb_data in celebrities:
                try:
                    # Check if celebrity already exists for this date
                    existing = db.query(Celebrity).filter(
                        Celebrity.birth_month == month,
                        Celebrity.birth_day == day,
                        Celebrity.name == celeb_data["name"]
                    ).first()
                    
                    if existing:
                        print(f"  [!] {celeb_data['name']} already exists for {month:02d}/{day:02d}, skipping")
                        total_skipped += 1
                        continue
                    
                    if not dry_run:
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
                        print(f"  [+] Added {celeb_data['name']} for {month:02d}/{day:02d}")
                    else:
                        print(f"  [+] Would add {celeb_data['name']} for {month:02d}/{day:02d}")
                    
                    total_added += 1
                    
                except Exception as e:
                    print(f"  [ERROR] Failed to add {celeb_data.get('name', 'Unknown')}: {e}")
                    total_errors += 1
                    continue
            
            if not dry_run:
                db.commit()  # Commit after each date to avoid large transactions
        
        print()
        print("=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Added: {total_added}")
        print(f"Skipped (already exists): {total_skipped}")
        print(f"Errors: {total_errors}")
        
        if dry_run:
            print()
            print("This was a dry run. Run without --dry-run to actually add celebrities.")
        else:
            print()
            print("[SUCCESS] All celebrities have been added to the database!")
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Seed celebrities from database template")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be added without actually adding")
    args = parser.parse_args()
    
    seed_all_celebrities(dry_run=args.dry_run)

