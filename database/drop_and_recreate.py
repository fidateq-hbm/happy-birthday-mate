"""
Drop and recreate all database tables
Run this to fix schema conflicts
"""
import sys
import os

# Add backend directory to Python path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
sys.path.insert(0, backend_dir)

from app.core.database import Base, engine
from app.models import *  # Import all models to register them

print("=" * 60)
print("Database Reset Script")
print("=" * 60)
print("This will DROP ALL existing tables and recreate them.")
print("All data will be lost!")
print("=" * 60)
response = input("Type 'yes' to continue: ")

if response.lower() != 'yes':
    print("Cancelled.")
    sys.exit(0)

try:
    # Drop all tables
    print("\n📉 Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("✅ All tables dropped successfully")
    
    # Create all tables
    print("\n📈 Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")
    
    print("\n🎉 Database reset complete!")
    print("You can now run: python database\\seed_data.py")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()

