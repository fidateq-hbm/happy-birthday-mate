from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv
import logging

from app.core.config import settings
from app.api.routes import auth, users, tribes, rooms, gifts, admin, upload, buddy, ai

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.access")

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🎉 Happy Birthday Mate API starting...")
    yield
    # Shutdown
    print("👋 Happy Birthday Mate API shutting down...")


app = FastAPI(
    title="Happy Birthday Mate API",
    description="A global, ritual-based digital celebration platform",
    version="1.0.0",
    lifespan=lifespan
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware to suppress expected 404 logs for /api/auth/me
# (404s are expected for users who haven't completed onboarding)
@app.middleware("http")
async def suppress_expected_404s(request: Request, call_next):
    response = await call_next(request)
    
    # Suppress logging for expected 404s on /api/auth/me
    # These are normal for users who haven't completed onboarding
    if (
        response.status_code == status.HTTP_404_NOT_FOUND
        and request.url.path == "/api/auth/me"
    ):
        # Don't log these - they're expected behavior
        pass
    else:
        # Log other requests normally
        pass
    
    return response

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(tribes.router, prefix="/api/tribes", tags=["Birthday Tribes"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["Birthday Rooms"])
app.include_router(gifts.router, prefix="/api/gifts", tags=["Digital Gifts"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(upload.router, prefix="/api/upload", tags=["File Upload"])
app.include_router(buddy.router, prefix="/api/buddy", tags=["Birthday Buddy"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])


@app.get("/")
async def root():
    return {
        "message": "Welcome to Happy Birthday Mate API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

