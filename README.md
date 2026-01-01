# Happy Birthday Mate 🎉

A global, ritual-based digital celebration platform that transforms birthdays into collective global experiences.

## 🌟 Vision

Happy Birthday Mate ensures that **no one celebrates alone**. We connect people who share the same birthday, creating joyful 24-hour celebration rituals that prioritize human presence over performance.

## ✨ Key Features

### Core Celebration Features
- 🎂 **Birthday Tribes** - Automatic assignment to birthday mates (based on MM-DD)
- 💬 **24-Hour Tribe Rooms** - Time-bound celebration chat rooms
- 🎨 **Birthday Walls** - Beautiful photo galleries (opens 24h before, closes 48h after birthday)
- 👥 **Personal Birthday Rooms** - Invite-only celebration spaces
- 🎁 **Digital Gifts** - Platform-owned digital cards, effects, and third-party gift cards
- 🤝 **Birthday Buddy** - 1-on-1 anonymous pairing with a birthday mate
- 📍 **State-Level Visibility** - See nearby celebrants (opt-in)
- ⭐ **Celebrity Birthday Twins** - Discover famous people born on your day

### Design Philosophy
- ✅ Ritual over engagement metrics
- ✅ Time-bound experiences (24-hour windows)
- ✅ Privacy and consent first
- ✅ Global-first, Africa-inclusive
- ✅ Joy before monetization

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State**: Zustand
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Authentication**: Firebase Admin SDK
- **Payments**: Stripe, PayPal, Paystack

### Infrastructure
- **Hosting**: Namecheap + Cloudflare
- **CDN**: Cloudflare
- **File Storage**: Firebase Storage

## 🚀 Quick Start

### Automated Setup (Recommended)

**Windows:**
```bash
scripts\setup.bat
```

**Mac/Linux:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Starting the Application

**Windows:**
```bash
scripts\start.bat
```

**Mac/Linux:**
```bash
./scripts/start.sh
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Manual Setup

See [SETUP.md](SETUP.md) for detailed installation instructions.

## 📁 Project Structure

```
HBM/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── database/          # Database scripts & migrations
├── scripts/           # Setup & startup scripts
├── README.md          # This file
├── SETUP.md           # Detailed setup guide
└── PROJECT_STRUCTURE.md  # Architecture documentation
```

## 🎯 Core Workflows

### User Journey
1. **Sign Up** → Email/Password or Google OAuth
2. **Onboarding** → Name, DOB, Photo, Location (auto tribe assignment)
3. **Dashboard** → View countdown, tribe info, celebrants
4. **Birthday Day** → Access tribe room, create personal room, birthday wall
5. **Celebration** → Chat, share photos, receive gifts
6. **Post-Birthday** → View memories, download photos

### Birthday Tribe Logic
- Users automatically assigned to tribe based on birth month-day (MM-DD)
- Example: Born March 14 → Tribe "03-14"
- Tribe room opens at midnight on birthday
- Active for exactly 24 hours
- Text-only communication
- Read-only after closure

## 🔐 Security & Privacy

- ✅ GDPR compliant consent flow
- ✅ No emotional profiling or tracking
- ✅ Optional location visibility
- ✅ Profile picture moderation
- ✅ Content flagging & reporting
- ✅ Rate limiting on sensitive operations
- ✅ Firebase JWT authentication
- ✅ Encrypted database connections

## 📊 Database Models

- **User** - Profile, birthday, tribe assignment
- **Room** - Tribe rooms, personal rooms, buddy rooms
- **Message** - Chat messages with reactions
- **BirthdayWall** - Photo gallery configuration
- **WallPhoto** - Individual photos
- **Gift** - Digital gift transactions
- **Celebrity** - Famous birthdays
- **BirthdayBuddy** - 1-on-1 pairings
- **Moderation** - Admin actions & flagged content

## 🎨 Design Features

- **Glass-morphism UI** - Modern, elegant design
- **Smooth Animations** - Framer Motion powered
- **Responsive Design** - Mobile-first approach
- **Celebration Gradients** - Purple, pink, blue themes
- **Confetti Effects** - Birthday animations
- **Celebrant Spiral** - Rotating profile display

## 🔌 API Endpoints

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for complete API documentation.

Key endpoints:
- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/tribes/*` - Birthday tribes
- `/api/rooms/*` - Rooms & walls
- `/api/gifts/*` - Digital gifts
- `/api/admin/*` - Moderation

## 🧪 Testing

### Backend
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
pytest
```

### Frontend
Manual testing recommended. Visit http://localhost:3000 after starting the dev server.

## 📦 Deployment

### Frontend (Vercel - Recommended)
```bash
cd frontend
vercel deploy
```

### Backend (Railway/Heroku)
```bash
# Configure environment variables
# Deploy via GitHub integration or CLI
```

### Database
- Use managed PostgreSQL (AWS RDS, DigitalOcean, Supabase)
- Enable automated backups
- SSL required for production

## 🌍 Environment Configuration

### Required Environment Variables

**Backend (.env):**
- `DATABASE_URL` - PostgreSQL connection string
- `FIREBASE_CREDENTIALS_PATH` - Path to Firebase Admin SDK JSON
- `SECRET_KEY` - JWT secret (min 32 characters)
- `STRIPE_SECRET_KEY` - Stripe API key
- `ALLOWED_ORIGINS` - CORS origins

**Frontend (.env.local):**
- `NEXT_PUBLIC_FIREBASE_*` - Firebase configuration (6 variables)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key

See `.env.example` files for complete list.

## 📝 License

**Proprietary - All Rights Reserved**

This is a proprietary platform. Unauthorized copying, modification, distribution, or use is strictly prohibited.

## 🙏 Acknowledgments

Built with expertise, dexterity, and aesthetic UI knowledge as requested.

## 📞 Support

For setup issues or questions, see:
- [SETUP.md](SETUP.md) - Detailed setup guide
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture docs

---

**Happy Birthday Mate** - Where no one celebrates alone 🎉✨

