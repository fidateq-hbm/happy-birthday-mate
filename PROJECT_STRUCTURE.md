# Happy Birthday Mate - Project Structure

## Overview
This document provides a comprehensive overview of the project structure, architecture, and key components.

## Directory Structure

```
HBM/
├── backend/                    # FastAPI Backend
│   ├── alembic/               # Database migrations
│   │   ├── versions/          # Migration files
│   │   ├── env.py            # Alembic environment
│   │   └── script.py.mako    # Migration template
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   └── routes/
│   │   │       ├── auth.py   # Authentication endpoints
│   │   │       ├── users.py  # User management
│   │   │       ├── tribes.py # Birthday tribe endpoints
│   │   │       ├── rooms.py  # Room management
│   │   │       ├── gifts.py  # Digital gifts
│   │   │       └── admin.py  # Admin & moderation
│   │   ├── core/             # Core functionality
│   │   │   ├── config.py     # Configuration
│   │   │   └── database.py   # Database setup
│   │   └── models/           # SQLAlchemy models
│   │       ├── user.py       # User model
│   │       ├── room.py       # Room & message models
│   │       ├── birthday_wall.py  # Birthday wall models
│   │       ├── gift.py       # Gift models
│   │       ├── buddy.py      # Birthday buddy models
│   │       └── admin.py      # Admin models
│   ├── main.py               # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── alembic.ini          # Alembic configuration
│
├── frontend/                  # Next.js Frontend
│   ├── src/
│   │   ├── app/              # Next.js 14 App Router
│   │   │   ├── page.tsx      # Homepage
│   │   │   ├── login/        # Login page
│   │   │   ├── signup/       # Signup page
│   │   │   ├── onboarding/   # Onboarding flow
│   │   │   ├── dashboard/    # User dashboard
│   │   │   ├── tribe/        # Tribe rooms
│   │   │   ├── birthday-wall/ # Birthday wall
│   │   │   ├── gifts/        # Digital gifts
│   │   │   ├── layout.tsx    # Root layout
│   │   │   └── globals.css   # Global styles
│   │   ├── components/       # React components
│   │   │   ├── auth/         # Auth components
│   │   │   └── CelebrantSpiral.tsx
│   │   ├── lib/              # Utilities
│   │   │   ├── firebase.ts   # Firebase config
│   │   │   └── api.ts        # API client
│   │   ├── store/            # State management
│   │   │   └── authStore.ts  # Auth state (Zustand)
│   │   └── utils/            # Helper functions
│   │       ├── cn.ts         # Class name utility
│   │       └── dates.ts      # Date utilities
│   ├── package.json          # Node dependencies
│   ├── tsconfig.json         # TypeScript config
│   ├── tailwind.config.ts    # Tailwind config
│   └── next.config.mjs       # Next.js config
│
├── database/                  # Database scripts
│   ├── init.sql              # Database initialization
│   └── seed_data.py          # Seed data script
│
├── scripts/                   # Utility scripts
│   ├── setup.bat             # Windows setup
│   ├── setup.sh              # Unix setup
│   ├── start.bat             # Windows start
│   └── start.sh              # Unix start
│
├── README.md                  # Main documentation
├── SETUP.md                   # Setup instructions
├── PROJECT_STRUCTURE.md       # This file
└── .gitignore                # Git ignore rules
```

## Architecture

### Backend (FastAPI + PostgreSQL)

**Tech Stack:**
- FastAPI 0.110.0 (Python web framework)
- SQLAlchemy 2.0 (ORM)
- PostgreSQL (Database)
- Firebase Admin SDK (Authentication)
- Alembic (Database migrations)
- Pydantic (Data validation)

**Key Features:**
- RESTful API design
- JWT authentication via Firebase
- Automatic API documentation (Swagger/OpenAPI)
- CORS middleware for frontend communication
- Database migrations with Alembic

**Database Models:**
- `User` - User profiles with birthday tribe assignment
- `Room` - Birthday tribe rooms and personal rooms
- `RoomParticipant` - Room membership
- `Message` - Chat messages
- `BirthdayWall` - Photo gallery walls
- `WallPhoto` - Photos in birthday walls
- `Gift` - Digital gift transactions
- `GiftCatalog` - Available gifts
- `Celebrity` - Celebrity birthdays
- `BirthdayBuddy` - 1-on-1 pairings
- `ModerationLog` - Admin actions
- `FlaggedContent` - Reported content

### Frontend (Next.js 14 + React)

**Tech Stack:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Zustand (State management)
- Firebase SDK (Auth & Storage)
- Axios (HTTP client)

**Key Features:**
- Server-side rendering (SSR)
- Client-side routing
- Responsive design
- Real-time updates (polling)
- File uploads to Firebase Storage
- Beautiful animations and transitions

**Pages:**
1. **Homepage** - Landing page with celebrant spiral
2. **Login/Signup** - Authentication
3. **Onboarding** - Multi-step user registration
4. **Dashboard** - Main user hub
5. **Tribe Room** - 24-hour birthday celebration chat
6. **Birthday Wall** - Photo gallery creation/viewing
7. **Gifts** - Digital gift marketplace
8. **Settings** - User preferences

## Key Workflows

### 1. User Registration
```
User → Signup → Firebase Auth → Onboarding → Backend API → Database → Dashboard
```

1. User signs up via email/password or Google
2. Firebase creates authentication account
3. User completes onboarding (name, DOB, photo, location)
4. Backend creates user record with auto-assigned tribe
5. User redirected to dashboard

### 2. Birthday Tribe Experience
```
Birthday Day → Tribe Room Opens → Users Chat → Room Closes (24h)
```

1. At midnight on user's birthday, tribe room activates
2. All users with same MM-DD can enter
3. Text-only chat for 24 hours
4. Room automatically closes and becomes read-only

### 3. Birthday Wall
```
Create Wall → Upload Photos → Share Link → Receive Reactions
```

1. Opens 24 hours before birthday
2. User creates wall with theme/colors
3. Friends upload photos via public link
4. React with emojis
5. Closes 48 hours after birthday

### 4. Digital Gifts
```
Browse Catalog → Select Gift → Payment → Instant Delivery
```

1. User browses platform digital gifts
2. Selects recipient and gift
3. Completes payment (Stripe/PayPal/Paystack)
4. Gift delivered instantly to recipient

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create user account
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify-token` - Verify Firebase token

### Users
- `GET /api/users/{user_id}` - Get user profile
- `PATCH /api/users/{user_id}` - Update profile
- `PUT /api/users/{user_id}/profile-picture` - Update photo
- `GET /api/users/tribe/{tribe_id}/members` - Get tribe members

### Tribes
- `GET /api/tribes/{tribe_id}` - Get tribe info
- `GET /api/tribes/{tribe_id}/room` - Get/create tribe room
- `POST /api/tribes/{tribe_id}/room/{room_id}/messages` - Send message
- `GET /api/tribes/{tribe_id}/room/{room_id}/messages` - Get messages

### Rooms
- `POST /api/rooms/personal` - Create personal room
- `POST /api/rooms/{room_id}/join` - Join with invite code
- `POST /api/rooms/birthday-wall` - Create birthday wall
- `GET /api/rooms/birthday-wall/{code}` - Get wall
- `POST /api/rooms/birthday-wall/{id}/photos` - Upload photo

### Gifts
- `GET /api/gifts/catalog` - Get gift catalog
- `POST /api/gifts/send` - Send gift
- `GET /api/gifts/received` - Get received gifts
- `GET /api/gifts/sent` - Get sent gifts

### Admin
- `POST /api/admin/celebrities` - Add celebrity
- `GET /api/admin/celebrities/today` - Today's celebrities
- `POST /api/admin/flag-content` - Flag content
- `GET /api/admin/flagged-content` - Get flagged content
- `GET /api/admin/stats/overview` - Platform statistics
- `GET /api/admin/celebrants/state/{state}` - State celebrants

## Environment Configuration

### Backend (.env)
```
DATABASE_URL=postgresql://...
FIREBASE_CREDENTIALS_PATH=./firebase-credentials.json
SECRET_KEY=...
STRIPE_SECRET_KEY=...
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

## Security Features

1. **Authentication**
   - Firebase JWT tokens
   - Secure password hashing
   - Google OAuth integration

2. **Authorization**
   - Tribe membership verification
   - Room access control
   - Profile picture change rate limiting

3. **Data Privacy**
   - GDPR compliant consent flow
   - Optional state visibility
   - No GPS location tracking
   - Encrypted database connections

4. **Content Moderation**
   - User reporting system
   - Admin moderation tools
   - Flagged content review
   - Action logging

## Performance Optimizations

1. **Frontend**
   - Image optimization (Next.js)
   - Code splitting
   - Lazy loading
   - Client-side caching

2. **Backend**
   - Database indexing
   - Query optimization
   - Connection pooling
   - API response caching

3. **Database**
   - Indexed foreign keys
   - Optimized queries
   - Regular backups

## Deployment

### Recommended Stack
- **Frontend**: Vercel (automatic Next.js optimization)
- **Backend**: Railway/Heroku/DigitalOcean
- **Database**: Managed PostgreSQL (AWS RDS, DigitalOcean)
- **File Storage**: Firebase Storage
- **CDN**: Cloudflare

### CI/CD
- GitHub Actions for automated testing
- Automatic deployments on push to main
- Environment-specific configurations

## Future Enhancements (Post-V1)

1. **Real-time Features**
   - WebSocket for live chat
   - Push notifications
   - Live presence indicators

2. **Advanced Features**
   - Video birthday messages
   - AI-generated birthday content
   - Birthday reminder system
   - Advanced analytics dashboard

3. **Monetization**
   - Premium subscriptions
   - Branded merchandise
   - Gift card marketplace expansion

4. **Platform Expansion**
   - Mobile apps (React Native)
   - International localization
   - Regional payment methods

## Troubleshooting

See SETUP.md for detailed troubleshooting guides.

## Contributing

This is a proprietary project. All rights reserved.

## License

Proprietary - All Rights Reserved

