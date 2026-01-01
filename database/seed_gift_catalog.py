import sys
import os

# Add backend directory to Python path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
sys.path.insert(0, backend_dir)

from app.core.database import SessionLocal, engine, Base
from app.models import GiftCatalog, GiftTypeEnum

# Ensure all tables are created
Base.metadata.create_all(bind=engine)

def seed_gift_catalog():
    db = SessionLocal()
    try:
        print("Happy Birthday Mate - Gift Catalog Seeder")
        print("=" * 60)

        # Check if gifts already exist
        existing_count = db.query(GiftCatalog).count()
        if existing_count > 0:
            print(f"[INFO] Found {existing_count} existing gifts in catalog.")
            print("[INFO] This will add 50 new beautiful gifts to your catalog.")
            response = input("Do you want to proceed? (y/n): ").strip().lower()
            if response != 'y':
                print("[SKIP] Seeding cancelled.")
                return

        # Define gift catalog items - 50 Beautiful Unique Gifts
        gifts = [
            # Digital Cards (10)
            {
                "gift_type": GiftTypeEnum.DIGITAL_CARD,
                "name": "Starlight Birthday Card",
                "description": "A mesmerizing animated card with twinkling stars and personalized constellation",
                "price": 3.99,
                "currency": "USD",
                "display_order": 1,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.DIGITAL_CARD,
                "name": "Golden Hour Card",
                "description": "Elegant card with golden sunset animations and warm wishes",
                "price": 4.99,
                "currency": "USD",
                "display_order": 2,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.DIGITAL_CARD,
                "name": "Aurora Birthday Card",
                "description": "Stunning northern lights effect with flowing colors and magical atmosphere",
                "price": 5.99,
                "currency": "USD",
                "display_order": 3,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.DIGITAL_CARD,
                "name": "Butterfly Garden Card",
                "description": "Delicate animated butterflies in a blooming garden scene",
                "price": 3.49,
                "currency": "USD",
                "display_order": 4,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.DIGITAL_CARD,
                "name": "Ocean Waves Card",
                "description": "Serene animated ocean with gentle waves and beach sunset",
                "price": 4.49,
                "currency": "USD",
                "display_order": 5,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.DIGITAL_CARD,
                "name": "Cosmic Celebration Card",
                "description": "Space-themed card with planets, nebulas, and shooting stars",
                "price": 5.49,
                "currency": "USD",
                "display_order": 6,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.DIGITAL_CARD,
                "name": "Cherry Blossom Card",
                "description": "Beautiful spring card with falling cherry blossoms and soft pink tones",
                "price": 3.99,
                "currency": "USD",
                "display_order": 7,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.DIGITAL_CARD,
                "name": "Diamond Sparkle Card",
                "description": "Luxurious card with diamond-like sparkles and elegant animations",
                "price": 6.99,
                "currency": "USD",
                "display_order": 8,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.DIGITAL_CARD,
                "name": "Forest Magic Card",
                "description": "Enchanted forest scene with fireflies and mystical glow",
                "price": 4.99,
                "currency": "USD",
                "display_order": 9,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.DIGITAL_CARD,
                "name": "Rainbow Bridge Card",
                "description": "Vibrant rainbow arch with animated colors and joyful energy",
                "price": 3.99,
                "currency": "USD",
                "display_order": 10,
                "is_featured": False,
                "image_url": None
            },
            
            # Confetti Effects (10)
            {
                "gift_type": GiftTypeEnum.CONFETTI_EFFECT,
                "name": "Golden Confetti Blast",
                "description": "Luxurious gold confetti explosion with shimmering particles",
                "price": 2.99,
                "currency": "USD",
                "display_order": 11,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CONFETTI_EFFECT,
                "name": "Rainbow Confetti Storm",
                "description": "Colorful confetti cascade with all colors of the rainbow",
                "price": 2.49,
                "currency": "USD",
                "display_order": 12,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CONFETTI_EFFECT,
                "name": "Heart Confetti Shower",
                "description": "Romantic heart-shaped confetti falling like gentle rain",
                "price": 3.49,
                "currency": "USD",
                "display_order": 13,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CONFETTI_EFFECT,
                "name": "Star Confetti Galaxy",
                "description": "Twinkling star confetti creating a galaxy effect",
                "price": 3.99,
                "currency": "USD",
                "display_order": 14,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CONFETTI_EFFECT,
                "name": "Butterfly Confetti Dance",
                "description": "Elegant butterfly confetti fluttering in graceful patterns",
                "price": 4.49,
                "currency": "USD",
                "display_order": 15,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CONFETTI_EFFECT,
                "name": "Diamond Confetti Sparkle",
                "description": "Premium diamond-shaped confetti with prismatic light effects",
                "price": 4.99,
                "currency": "USD",
                "display_order": 16,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CONFETTI_EFFECT,
                "name": "Fireworks Confetti",
                "description": "Explosive confetti burst mimicking fireworks display",
                "price": 3.99,
                "currency": "USD",
                "display_order": 17,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CONFETTI_EFFECT,
                "name": "Rose Petal Confetti",
                "description": "Delicate rose petal confetti with floral fragrance animation",
                "price": 3.49,
                "currency": "USD",
                "display_order": 18,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CONFETTI_EFFECT,
                "name": "Neon Confetti Party",
                "description": "Vibrant neon-colored confetti with glow-in-the-dark effect",
                "price": 3.99,
                "currency": "USD",
                "display_order": 19,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CONFETTI_EFFECT,
                "name": "Crystal Confetti Cascade",
                "description": "Elegant crystal-like confetti with light refraction effects",
                "price": 4.99,
                "currency": "USD",
                "display_order": 20,
                "is_featured": True,
                "image_url": None
            },
            
            # Wall Highlights (10)
            {
                "gift_type": GiftTypeEnum.WALL_HIGHLIGHT,
                "name": "Golden Frame Highlight",
                "description": "Luxurious gold frame that makes any photo shine like a masterpiece",
                "price": 4.99,
                "currency": "USD",
                "display_order": 21,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.WALL_HIGHLIGHT,
                "name": "Crystal Border Highlight",
                "description": "Sparkling crystal border with animated light reflections",
                "price": 5.99,
                "currency": "USD",
                "display_order": 22,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.WALL_HIGHLIGHT,
                "name": "Vintage Polaroid Frame",
                "description": "Nostalgic polaroid-style frame with retro charm",
                "price": 3.99,
                "currency": "USD",
                "display_order": 23,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.WALL_HIGHLIGHT,
                "name": "Floral Wreath Frame",
                "description": "Beautiful floral wreath border with animated blooming flowers",
                "price": 4.49,
                "currency": "USD",
                "display_order": 24,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.WALL_HIGHLIGHT,
                "name": "Stardust Frame",
                "description": "Magical frame with twinkling stars and cosmic particles",
                "price": 5.49,
                "currency": "USD",
                "display_order": 25,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.WALL_HIGHLIGHT,
                "name": "Rainbow Glow Frame",
                "description": "Vibrant rainbow border with animated color transitions",
                "price": 4.99,
                "currency": "USD",
                "display_order": 26,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.WALL_HIGHLIGHT,
                "name": "Diamond Prism Frame",
                "description": "Premium diamond-cut frame with prismatic light effects",
                "price": 6.99,
                "currency": "USD",
                "display_order": 27,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.WALL_HIGHLIGHT,
                "name": "Butterfly Garden Frame",
                "description": "Enchanting frame with animated butterflies and flowers",
                "price": 4.49,
                "currency": "USD",
                "display_order": 28,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.WALL_HIGHLIGHT,
                "name": "Ocean Wave Frame",
                "description": "Serene frame with gentle ocean waves and beach vibes",
                "price": 4.99,
                "currency": "USD",
                "display_order": 29,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.WALL_HIGHLIGHT,
                "name": "Royal Crown Frame",
                "description": "Regal crown frame making the photo fit for a birthday royalty",
                "price": 5.99,
                "currency": "USD",
                "display_order": 30,
                "is_featured": True,
                "image_url": None
            },
            
            # Celebrant Badges (10)
            {
                "gift_type": GiftTypeEnum.CELEBRANT_BADGE,
                "name": "Birthday Royalty Badge",
                "description": "Crown badge showing they're the birthday royalty for 24 hours",
                "price": 5.99,
                "currency": "USD",
                "display_order": 31,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CELEBRANT_BADGE,
                "name": "Star of the Day Badge",
                "description": "Shining star badge highlighting their special day",
                "price": 4.99,
                "currency": "USD",
                "display_order": 32,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CELEBRANT_BADGE,
                "name": "Golden Birthday Badge",
                "description": "Premium gold badge with animated sparkles",
                "price": 6.99,
                "currency": "USD",
                "display_order": 33,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CELEBRANT_BADGE,
                "name": "Diamond Celebrant Badge",
                "description": "Luxurious diamond badge with prismatic effects",
                "price": 7.99,
                "currency": "USD",
                "display_order": 34,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CELEBRANT_BADGE,
                "name": "Birthday Legend Badge",
                "description": "Epic badge celebrating their legendary status",
                "price": 5.49,
                "currency": "USD",
                "display_order": 35,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CELEBRANT_BADGE,
                "name": "Celebration Champion Badge",
                "description": "Champion badge for the ultimate birthday celebrant",
                "price": 4.99,
                "currency": "USD",
                "display_order": 36,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CELEBRANT_BADGE,
                "name": "Birthday Superstar Badge",
                "description": "Superstar badge with animated spotlight effect",
                "price": 5.99,
                "currency": "USD",
                "display_order": 37,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CELEBRANT_BADGE,
                "name": "Magical Birthday Badge",
                "description": "Enchanted badge with mystical glow and sparkles",
                "price": 4.49,
                "currency": "USD",
                "display_order": 38,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CELEBRANT_BADGE,
                "name": "Birthday Hero Badge",
                "description": "Hero badge celebrating their special day with style",
                "price": 4.99,
                "currency": "USD",
                "display_order": 39,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.CELEBRANT_BADGE,
                "name": "Platinum Celebrant Badge",
                "description": "Exclusive platinum badge for the ultimate celebration",
                "price": 8.99,
                "currency": "USD",
                "display_order": 40,
                "is_featured": True,
                "image_url": None
            },
            
            # Featured Messages (5)
            {
                "gift_type": GiftTypeEnum.FEATURED_MESSAGE,
                "name": "Golden Pinned Message",
                "description": "Pin your message at the top with golden highlight",
                "price": 3.99,
                "currency": "USD",
                "display_order": 41,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.FEATURED_MESSAGE,
                "name": "Diamond Featured Message",
                "description": "Premium pinned message with diamond sparkle effect",
                "price": 4.99,
                "currency": "USD",
                "display_order": 42,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.FEATURED_MESSAGE,
                "name": "Rainbow Pinned Message",
                "description": "Vibrant pinned message with rainbow animation",
                "price": 3.49,
                "currency": "USD",
                "display_order": 43,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.FEATURED_MESSAGE,
                "name": "Starlight Featured Message",
                "description": "Pinned message with twinkling star background",
                "price": 4.49,
                "currency": "USD",
                "display_order": 44,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.FEATURED_MESSAGE,
                "name": "Royal Featured Message",
                "description": "Regal pinned message with crown decoration",
                "price": 5.99,
                "currency": "USD",
                "display_order": 45,
                "is_featured": True,
                "image_url": None
            },
            
            # Gift Cards (15)
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Amazon Gift Card $25",
                "description": "Universal $25 Amazon gift card for endless shopping",
                "price": 25.00,
                "currency": "USD",
                "display_order": 46,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Netflix Premium Gift Card",
                "description": "$20 Netflix gift card for premium streaming entertainment",
                "price": 20.00,
                "currency": "USD",
                "display_order": 47,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Spotify Premium Gift Card",
                "description": "$15 Spotify gift card for unlimited music and podcasts",
                "price": 15.00,
                "currency": "USD",
                "display_order": 48,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Apple App Store Gift Card",
                "description": "$25 Apple gift card for apps, music, and more",
                "price": 25.00,
                "currency": "USD",
                "display_order": 49,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Google Play Gift Card",
                "description": "$20 Google Play card for apps, games, and entertainment",
                "price": 20.00,
                "currency": "USD",
                "display_order": 50,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Uber Eats Gift Card",
                "description": "$30 Uber Eats gift card for delicious birthday meals",
                "price": 30.00,
                "currency": "USD",
                "display_order": 51,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Starbucks Gift Card",
                "description": "$20 Starbucks gift card for birthday coffee treats",
                "price": 20.00,
                "currency": "USD",
                "display_order": 52,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Airbnb Experience Gift Card",
                "description": "$50 Airbnb gift card for memorable birthday experiences",
                "price": 50.00,
                "currency": "USD",
                "display_order": 53,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Steam Gift Card",
                "description": "$25 Steam gift card for gaming enthusiasts",
                "price": 25.00,
                "currency": "USD",
                "display_order": 54,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Disney+ Gift Card",
                "description": "$15 Disney+ gift card for magical streaming",
                "price": 15.00,
                "currency": "USD",
                "display_order": 55,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Sephora Gift Card",
                "description": "$30 Sephora gift card for beauty and self-care",
                "price": 30.00,
                "currency": "USD",
                "display_order": 56,
                "is_featured": True,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Nike Gift Card",
                "description": "$40 Nike gift card for athletic gear and style",
                "price": 40.00,
                "currency": "USD",
                "display_order": 57,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "Uber Gift Card",
                "description": "$25 Uber gift card for rides and convenience",
                "price": 25.00,
                "currency": "USD",
                "display_order": 58,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "DoorDash Gift Card",
                "description": "$30 DoorDash gift card for birthday food delivery",
                "price": 30.00,
                "currency": "USD",
                "display_order": 59,
                "is_featured": False,
                "image_url": None
            },
            {
                "gift_type": GiftTypeEnum.GIFT_CARD,
                "name": "MasterClass Gift Card",
                "description": "$50 MasterClass gift card for learning and inspiration",
                "price": 50.00,
                "currency": "USD",
                "display_order": 60,
                "is_featured": True,
                "image_url": None
            }
        ]

        added_count = 0
        for gift_data in gifts:
            # Check if gift already exists
            existing = db.query(GiftCatalog).filter(
                GiftCatalog.name == gift_data["name"],
                GiftCatalog.gift_type == gift_data["gift_type"]
            ).first()

            if not existing:
                gift = GiftCatalog(**gift_data)
                db.add(gift)
                db.commit()
                db.refresh(gift)
                print(f"  [+] Added: {gift.name} (${gift.price})")
                added_count += 1
            else:
                print(f"  [-] Already exists: {gift_data['name']}")

        print(f"\n[SUCCESS] Added {added_count} gifts to catalog!")
        print(f"[TOTAL] Catalog now has {db.query(GiftCatalog).filter(GiftCatalog.is_active == True).count()} active gifts")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_gift_catalog()

