#!/bin/bash
# Happy Birthday Mate - Unix/Linux/Mac Setup Script

echo "===================================="
echo "Happy Birthday Mate - Setup"
echo "===================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed"
    echo "Please install Python 3.11+ from https://www.python.org/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "[WARNING] PostgreSQL not found in PATH"
    echo "Make sure PostgreSQL is installed and configured"
fi

echo "[1/5] Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    echo "Please edit backend/.env with your configuration"
fi

cd ..

echo ""
echo "[2/5] Setting up Frontend..."
cd frontend

# Install npm dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating frontend .env.local file..."
    cp .env.example .env.local
    echo "Please edit frontend/.env.local with your Firebase configuration"
fi

cd ..

echo ""
echo "[3/5] Database Setup..."
echo "Please ensure PostgreSQL is running and you have created the database:"
echo "  CREATE DATABASE happy_birthday_mate;"
echo ""
read -p "Press enter to continue..."

echo "Initializing database tables..."
cd backend
source venv/bin/activate
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

echo ""
echo "[4/5] Seeding database..."
cd ..
python database/seed_data.py

echo ""
echo "[5/5] Setup Complete!"
echo ""
echo "===================================="
echo "Next Steps:"
echo "===================================="
echo "1. Edit backend/.env with your configuration"
echo "2. Edit frontend/.env.local with Firebase config"
echo "3. Add firebase-credentials.json to backend folder"
echo ""
echo "To start the application:"
echo "  Backend:  cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Visit: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo "===================================="

