from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv
import logging

from app.core.config import settings
from app.core.security import limiter, RateLimitExceeded, _rate_limit_exceeded_handler
from app.api.routes import auth, users, tribes, rooms, gifts, admin, upload, buddy, ai, payments

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.access")

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def run_migrations():
    """Run database migrations automatically on startup"""
    try:
        from alembic.config import Config
        from alembic import command
        from sqlalchemy import inspect, text
        from app.core.database import engine, Base
        import app.models  # Import all models to register them
        
        # Ensure DATABASE_URL is set
        if not settings.DATABASE_URL or settings.DATABASE_URL.startswith("postgresql://user:password"):
            print("⚠️  WARNING: DATABASE_URL not properly configured. Skipping migrations.")
            return
        
        print("🔄 Checking database state...")
        print(f"   Database: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'configured'}")
        
        # Check if alembic_version table exists (indicates migrations have been run)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        has_alembic_version = 'alembic_version' in tables
        
        if not has_alembic_version:
            # First time setup - create all tables from models
            print("📦 First-time setup: Creating all database tables...")
            Base.metadata.create_all(bind=engine)
            print("✅ All tables created successfully!")
            
            # Now stamp the database with the latest migration
            print("📝 Stamping database with latest migration...")
            backend_dir = Path(__file__).parent
            alembic_ini_path = backend_dir / "alembic.ini"
            if alembic_ini_path.exists():
                alembic_cfg = Config(str(alembic_ini_path))
                # Get the latest revision
                from alembic.script import ScriptDirectory
                script = ScriptDirectory.from_config(alembic_cfg)
                head_revision = script.get_current_head()
                if head_revision:
                    command.stamp(alembic_cfg, head_revision)
                    print(f"✅ Database stamped with revision: {head_revision}")
        else:
            # Run migrations normally
            print("🔄 Running database migrations...")
            backend_dir = Path(__file__).parent
            alembic_ini_path = backend_dir / "alembic.ini"
            
            if not alembic_ini_path.exists():
                print(f"❌ ERROR: alembic.ini not found at {alembic_ini_path}")
                return
            
            alembic_cfg = Config(str(alembic_ini_path))
            command.upgrade(alembic_cfg, "head")
            print("✅ Database migrations completed successfully!")
        
    except Exception as e:
        import traceback
        print(f"❌ ERROR: Could not run migrations: {e}")
        print("   Full traceback:")
        traceback.print_exc()
        print("   The application will continue, but database may not be initialized.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🎉 Happy Birthday Mate API starting...")
    
    # Run migrations automatically
    run_migrations()
    
    yield
    # Shutdown
    print("👋 Happy Birthday Mate API shutting down...")


app = FastAPI(
    title="Happy Birthday Mate API",
    description="A global celebration platform",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Mount static files for uploads at /api/uploads to match frontend proxy
# This makes files accessible at: https://backend.com/api/uploads/...
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS - Strict configuration for security
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # Only allow configured origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],  # Specific methods only
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],  # Specific headers only
    expose_headers=["Content-Length", "Content-Type"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    # Content Security Policy (adjust based on your needs)
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "  # Adjust for your needs
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' https://*.googleapis.com https://*.firebase.com; "
        "frame-ancestors 'none';"
    )
    response.headers["Content-Security-Policy"] = csp
    
    # Suppress logging for expected 404s on /api/auth/me
    if (
        response.status_code == status.HTTP_404_NOT_FOUND
        and request.url.path == "/api/auth/me"
    ):
        # Don't log these - they're expected behavior
        pass
    
    return response

# HTTPS enforcement middleware (for production)
@app.middleware("http")
async def enforce_https(request: Request, call_next):
    # Only enforce in production
    from app.core.config import IS_PRODUCTION
    if IS_PRODUCTION:
        # Check if request is over HTTPS (via proxy headers)
        forwarded_proto = request.headers.get("x-forwarded-proto", "")
        if forwarded_proto != "https":
            # Allow health checks and docs over HTTP
            if request.url.path not in ["/health", "/docs", "/openapi.json", "/"]:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"detail": "HTTPS required in production"}
                )
    
    response = await call_next(request)
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
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])


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

