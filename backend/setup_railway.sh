#!/bin/bash
# Setup script for Railway deployment
# This script helps set up the environment after deployment

echo "🚀 Setting up Happy Birthday Mate Backend on Railway..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "🗄️ Running database migrations..."
alembic upgrade head

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads/profile_pictures
mkdir -p uploads/birthday_walls

echo "✅ Setup complete!"

