"""
Seed test celebrants for the celebrant spiral demo
Creates users celebrating today, tomorrow, and the next day
"""
import sys
from pathlib import Path
from datetime import datetime, timedelta
import os

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(backend_path / ".env")

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User, GenderEnum
import random

# Fun names and corresponding photos for test users (50+ entries)
TEST_CELEBRANTS = [
    {"name": "Sarah", "photo": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"},
    {"name": "Michael", "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"},
    {"name": "Emma", "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop"},
    {"name": "James", "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"},
    {"name": "Olivia", "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop"},
    {"name": "William", "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"},
    {"name": "Ava", "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"},
    {"name": "Benjamin", "photo": "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop"},
    {"name": "Sophia", "photo": "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop"},
    {"name": "Lucas", "photo": "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop"},
    {"name": "Isabella", "photo": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop"},
    {"name": "Mason", "photo": "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop"},
    {"name": "Mia", "photo": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop"},
    {"name": "Ethan", "photo": "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop"},
    {"name": "Charlotte", "photo": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop"},
    {"name": "Alexander", "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop"},
    {"name": "Amelia", "photo": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400&h=400&fit=crop"},
    {"name": "Daniel", "photo": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop"},
    {"name": "Harper", "photo": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop"},
    {"name": "Matthew", "photo": "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=400&fit=crop"},
    {"name": "Evelyn", "photo": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop"},
    {"name": "Jackson", "photo": "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop"},
    {"name": "Abigail", "photo": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop"},
    {"name": "David", "photo": "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=400&fit=crop"},
    {"name": "Emily", "photo": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&sat=-100"},
    {"name": "Logan", "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"},
    {"name": "Elizabeth", "photo": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&h=400&fit=crop"},
    {"name": "Sebastian", "photo": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop"},
    {"name": "Sofia", "photo": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop"},
    {"name": "Aiden", "photo": "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=400&h=400&fit=crop"},
    {"name": "Camila", "photo": "https://images.unsplash.com/photo-1532074205216-d0e1f4b87368?w=400&h=400&fit=crop"},
    {"name": "Samuel", "photo": "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400&h=400&fit=crop"},
    {"name": "Avery", "photo": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop"},
    {"name": "Joseph", "photo": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop"},
    {"name": "Ella", "photo": "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&h=400&fit=crop"},
    {"name": "John", "photo": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop"},
    {"name": "Scarlett", "photo": "https://images.unsplash.com/photo-1551843073-4a9a5b6fcd5f?w=400&h=400&fit=crop"},
    {"name": "Christopher", "photo": "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=400&fit=crop"},
    {"name": "Victoria", "photo": "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop"},
    {"name": "Andrew", "photo": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop"},
    {"name": "Madison", "photo": "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=400&h=400&fit=crop"},
    {"name": "Joshua", "photo": "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=400&h=400&fit=crop"},
    {"name": "Luna", "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"},
    {"name": "Ryan", "photo": "https://images.unsplash.com/photo-1557862921-37829c790f19?w=400&h=400&fit=crop"},
    {"name": "Grace", "photo": "https://images.unsplash.com/photo-1541271696563-3be2f555fc4e?w=400&h=400&fit=crop"},
    {"name": "Nathan", "photo": "https://images.unsplash.com/photo-1542178243-bc20204b769f?w=400&h=400&fit=crop"},
    {"name": "Chloe", "photo": "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=400&fit=crop"},
    {"name": "Gabriel", "photo": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop"},
    {"name": "Lily", "photo": "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=400&h=400&fit=crop"},
    {"name": "Aaron", "photo": "https://images.unsplash.com/photo-1590086782792-42dd2350140d?w=400&h=400&fit=crop"},
    {"name": "Zoey", "photo": "https://images.unsplash.com/photo-1616091093714-c64882e9ab55?w=400&h=400&fit=crop"},
    {"name": "Christian", "photo": "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=400&h=400&fit=crop"},
    {"name": "Penelope", "photo": "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=400&h=400&fit=crop"},
    {"name": "Thomas", "photo": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&brightness=10"},
    {"name": "Riley", "photo": "https://images.unsplash.com/photo-1619895092538-128341789043?w=400&h=400&fit=crop"},
]

COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia", "Nigeria", 
    "Germany", "France", "India", "Brazil", "Japan", "South Africa", "Mexico"
]

STATES = [
    "California", "Texas", "New York", "Florida", "Illinois", "Pennsylvania",
    "Lagos", "London", "Ontario", "Queensland", "Berlin", "Paris"
]

def generate_profile_picture_url(name: str) -> str:
    """Generate a profile picture URL using UI Avatars (fallback)"""
    colors = ["667eea", "764ba2", "f093fb", "4facfe", "43e97b", "fa709a", "fee140", "30cfd0"]
    color = random.choice(colors)
    return f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&size=200&background={color}&color=fff&bold=true"

def create_celebrant(db: Session, first_name: str, birth_date: datetime, firebase_uid: str, photo_url: str):
    """Create a test celebrant"""
    country = random.choice(COUNTRIES)
    state = random.choice(STATES)
    gender = random.choice(["male", "female", "prefer_not_to_say"])
    
    # Generate tribe_id from birth date
    month = birth_date.month
    day = birth_date.day
    tribe_id = f"{month:02d}-{day:02d}"
    
    user = User(
        firebase_uid=firebase_uid,
        email=f"{first_name.lower()}_{firebase_uid[-6:]}@test.com",
        first_name=first_name,
        date_of_birth=birth_date.date(),
        birth_month=month,
        birth_day=day,
        gender=gender,
        country=country,
        state=state,
        city=f"{state} City",
        profile_picture_url=photo_url,
        tribe_id=tribe_id,
        consent_given=True,
        is_verified=True,
        is_active=True,
        state_visibility_enabled=True
    )
    
    db.add(user)
    return user

def seed_celebrants():
    """Seed test celebrants for today, tomorrow, and next day"""
    db = SessionLocal()
    
    try:
        # Get today, tomorrow, and next day
        today = datetime.now()
        tomorrow = today + timedelta(days=1)
        next_day = today + timedelta(days=2)
        
        dates = [
            (today, "Today"),
            (tomorrow, "Tomorrow"),
            (next_day, "Day After Tomorrow")
        ]
        
        created_count = 0
        celebrant_index = 0  # Track which celebrant data to use
        
        for date, label in dates:
            print(f"\n[*] Creating celebrants for {label} ({date.strftime('%B %d')})")
            
            # Create 17 celebrants for today, 17 for tomorrow, 16 for next day = 50 total
            celebrants_for_this_day = 17 if date in [today, tomorrow] else 16
            
            for i in range(celebrants_for_this_day):
                # Get celebrant data (cycle through if we run out)
                celebrant_data = TEST_CELEBRANTS[celebrant_index % len(TEST_CELEBRANTS)]
                first_name = celebrant_data["name"]
                photo_url = celebrant_data["photo"]
                celebrant_index += 1
                
                # Set birth year to random year in the past
                birth_year = random.randint(1970, 2005)
                birth_date = date.replace(year=birth_year)
                
                # Generate unique firebase_uid
                firebase_uid = f"test_celebrant_{date.strftime('%m%d')}_{i}_{random.randint(1000, 9999)}"
                
                # Check if user already exists
                existing = db.query(User).filter(User.firebase_uid == firebase_uid).first()
                if existing:
                    print(f"  [!] {first_name} already exists, skipping")
                    continue
                
                user = create_celebrant(db, first_name, birth_date, firebase_uid, photo_url)
                created_count += 1
                print(f"  [+] Created {first_name} (Tribe: {user.tribe_id})")
        
        db.commit()
        print(f"\n[SUCCESS] Created {created_count} test celebrants!")
        print(f"\n[SUMMARY]")
        print(f"   - Today ({today.strftime('%m-%d')}): Check your homepage")
        print(f"   - Tomorrow ({tomorrow.strftime('%m-%d')}): Change system date to test")
        print(f"   - Next day ({next_day.strftime('%m-%d')}): Change system date to test")
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Happy Birthday Mate - Test Celebrants Seeder")
    print("=" * 60)
    seed_celebrants()

