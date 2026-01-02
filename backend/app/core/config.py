from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Environment detection
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development").lower() == "production"


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/happy_birthday_mate"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = "./firebase-credentials.json"
    FIREBASE_CREDENTIALS: str = ""  # JSON content as string (for Render/cloud deployments)
    
    # Payment
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    PAYPAL_CLIENT_ID: str = ""
    PAYPAL_CLIENT_SECRET: str = ""
    PAYSTACK_SECRET_KEY: str = ""
    FLUTTERWAVE_PUBLIC_KEY: str = ""
    FLUTTERWAVE_SECRET_KEY: str = ""
    FLUTTERWAVE_ENCRYPTION_KEY: str = ""
    FLUTTERWAVE_WEBHOOK_HASH: str = ""
    
    # AI (Google Gemini)
    GEMINI_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra fields from .env that aren't defined
    
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """Parse ALLOWED_ORIGINS from environment variable"""
        origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
        if origins_str and origins_str.strip():
            return [origin.strip() for origin in origins_str.split(',') if origin.strip()]
        return ["http://localhost:3000"]


# Create settings instance
settings = Settings()

