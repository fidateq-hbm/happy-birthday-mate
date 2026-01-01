"""
Seed data script for Happy Birthday Mate
Run this after database initialization to populate with sample data
"""
import sys
import os

# Add backend directory to Python path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
sys.path.insert(0, backend_dir)

from app.core.database import SessionLocal, engine, Base
from app.models import Celebrity, GiftCatalog, GiftTypeEnum

# Create all tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Add sample celebrities
    celebrities = [
        Celebrity(
            name="Martin Luther King Jr.",
            photo_url="https://upload.wikimedia.org/wikipedia/commons/0/05/Martin_Luther_King%2C_Jr..jpg",
            description="American civil rights leader",
            birth_month=1,
            birth_day=15,
            birth_year=1929,
            is_active=True,
            priority=100
        ),
        Celebrity(
            name="Oprah Winfrey",
            photo_url="https://example.com/oprah.jpg",
            description="Media mogul and philanthropist",
            birth_month=1,
            birth_day=29,
            birth_year=1954,
            is_active=True,
            priority=100
        ),
        Celebrity(
            name="Rihanna",
            photo_url="https://example.com/rihanna.jpg",
            description="Singer, actress, and entrepreneur",
            birth_month=2,
            birth_day=20,
            birth_year=1988,
            is_active=True,
            priority=100
        ),
    ]
    
    for celeb in celebrities:
        existing = db.query(Celebrity).filter(
            Celebrity.name == celeb.name
        ).first()
        if not existing:
            db.add(celeb)
    
    # Add gift catalog items
    gifts = [
        GiftCatalog(
            gift_type=GiftTypeEnum.DIGITAL_CARD,
            name="Birthday Sparkle Card",
            description="A beautiful animated birthday card with sparkles and confetti",
            price=2.99,
            currency="USD",
            image_url=None,
            display_order=1,
            is_active=True,
            is_featured=True
        ),
        GiftCatalog(
            gift_type=GiftTypeEnum.CONFETTI_EFFECT,
            name="Gold Confetti Blast",
            description="Stunning gold confetti animation that appears in the celebrant's room",
            price=4.99,
            currency="USD",
            image_url=None,
            display_order=2,
            is_active=True,
            is_featured=True
        ),
        GiftCatalog(
            gift_type=GiftTypeEnum.WALL_HIGHLIGHT,
            name="Birthday Wall Highlight",
            description="Feature a special photo at the top of the birthday wall",
            price=3.99,
            currency="USD",
            image_url=None,
            display_order=3,
            is_active=True,
            is_featured=False
        ),
        GiftCatalog(
            gift_type=GiftTypeEnum.CELEBRANT_BADGE,
            name="VIP Birthday Badge",
            description="Special VIP badge displayed next to name for 24 hours",
            price=5.99,
            currency="USD",
            image_url=None,
            display_order=4,
            is_active=True,
            is_featured=False
        ),
        GiftCatalog(
            gift_type=GiftTypeEnum.FEATURED_MESSAGE,
            name="Featured Message Spotlight",
            description="Pin your birthday message at the top of the room",
            price=4.99,
            currency="USD",
            image_url=None,
            display_order=5,
            is_active=True,
            is_featured=False
        ),
    ]
    
    for gift in gifts:
        existing = db.query(GiftCatalog).filter(
            GiftCatalog.name == gift.name
        ).first()
        if not existing:
            db.add(gift)
    
    db.commit()
    print("✅ Database seeded successfully!")
    print(f"✅ Added {len(celebrities)} celebrities")
    print(f"✅ Added {len(gifts)} gift catalog items")

except Exception as e:
    print(f"❌ Error seeding database: {e}")
    db.rollback()
finally:
    db.close()

