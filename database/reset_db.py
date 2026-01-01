"""
Reset database - Drop all tables and recreate them
Use this if you have schema conflicts
"""
import sys
import os

# Add backend directory to Python path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
sys.path.insert(0, backend_dir)

from app.core.database import Base, engine
from app.models import *  # Import all models

print("⚠️  WARNING: This will DROP ALL TABLES!")
print("Press Ctrl+C to cancel, or Enter to continue...")
input()

try:
    # Drop all tables
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("✅ All tables dropped")
    
    # Create all tables
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

