import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Robustly find .env in the same directory as config.py
# (only used for local development; Railway injects env vars directly)
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    # App Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week

    # --- Database ---
    # Railway provides a full DATABASE_URL — use it directly if present.
    # Fallback: build from individual parts for local Docker / manual setup.
    DB_NAME: str = os.getenv("DB_NAME", "neel_motovlogs_db")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")

    # --- Redis ---
    # Railway provides REDIS_URL directly.
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # --- CORS ---
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,https://neelmotovlogs.vercel.app"
    )

    @property
    def ALLOWED_ORIGINS(self) -> list:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    # --- External APIs ---
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    REDDIT_CLIENT_ID: str = os.getenv("REDDIT_CLIENT_ID", "")
    REDDIT_CLIENT_SECRET: str = os.getenv("REDDIT_CLIENT_SECRET", "")
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")
    ORS_API_KEY: str = os.getenv("ORS_API_KEY", "")
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")
    OPENAQ_API_KEY: str = os.getenv("OPENAQ_API_KEY", "")

    # --- AI Story Video Generator ---
    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")

    # Facebook OAuth
    FACEBOOK_APP_ID: str = os.getenv("FACEBOOK_APP_ID", "")
    FACEBOOK_APP_SECRET: str = os.getenv("FACEBOOK_APP_SECRET", "")
    FACEBOOK_REDIRECT_URI: str = os.getenv("FACEBOOK_REDIRECT_URI", "http://localhost:8000/auth/facebook/callback")

    # Encryption key for social account tokens (Generate with Fernet.generate_key().decode())
    # Default is a dummy key to prevent startup failure if not set
    TOKEN_ENCRYPTION_KEY: str = os.getenv("TOKEN_ENCRYPTION_KEY", "b3VyX3N1cGVyX3NlY3JldF9mZXJuZXRfa2V5X2RvbnRfdXNlX3RoaXM=")

    # Video APIs
    PEXELS_API_KEY: str = os.getenv("PEXELS_API_KEY", "")
    PIXABAY_API_KEY: str = os.getenv("PIXABAY_API_KEY", "")

    # Storage Paths
    AUDIO_OUTPUT_DIR: str = os.getenv("AUDIO_OUTPUT_DIR", "./audio")
    VIDEO_OUTPUT_DIR: str = os.getenv("VIDEO_OUTPUT_DIR", "./output_videos")
    TEMP_VIDEO_DIR: str = os.getenv("TEMP_VIDEO_DIR", "./temp_videos")

    @property
    def DATABASE_URL(self) -> str:
        # Prefer the full URL injected by Railway (or any PaaS)
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            # SQLAlchemy requires 'postgresql://' not 'postgres://'
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql://", 1)
            return db_url
        # Local fallback: build from individual parts
        import urllib.parse
        password = urllib.parse.quote_plus(self.DB_PASSWORD)
        return f"postgresql://{self.DB_USER}:{password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()
