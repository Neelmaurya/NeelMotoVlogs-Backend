from sqlalchemy import Column, Integer, String, JSON, DateTime, Text, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    original_text = Column(Text, nullable=False)           # Admin's short input
    expanded_text = Column(Text, nullable=False)           # Groq-expanded full story
    language = Column(String(10), default="en")            # en / hi / both
    voice_id = Column(String(100), nullable=False)         # Selected Edge TTS voice
    video_type = Column(String(10), default="reel")        # reel / video
    format = Column(String(10), default="9:16")           # 9:16 / 16:9
    duration_secs = Column(Integer, default=60)            # Per part duration
    status = Column(String(20), default="pending")         # pending, processing, active, completed, error
    schedule_freq = Column(String(10), default="daily")    # daily / weekly
    schedule_time = Column(String(10), default="10:00")    # HH:MM
    platforms = Column(JSON, default=[])                   # ["youtube","instagram","facebook"]
    created_at = Column(DateTime, default=datetime.utcnow)
    
    parts = relationship("StoryPart", back_populates="story", cascade="all, delete-orphan")


class StoryPart(Base):
    __tablename__ = "story_parts"

    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"))
    part_number = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    audio_path = Column(String(500), nullable=True)
    video_path = Column(String(500), nullable=True)
    thumbnail_path = Column(String(500), nullable=True)
    duration_secs = Column(Float, nullable=True)
    status = Column(String(20), default="pending")         # pending, processing, audio_ready, video_ready, posted, error
    scheduled_at = Column(DateTime, nullable=False)
    posted_at = Column(DateTime, nullable=True)
    youtube_id = Column(String(100), nullable=True)
    instagram_id = Column(String(100), nullable=True)
    facebook_id = Column(String(100), nullable=True)
    metadata_json = Column(JSON, nullable=True)            # title, desc, tags per platform
    error_msg = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    story = relationship("Story", back_populates="parts")


class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(20), index=True, nullable=False)  # youtube/instagram/facebook
    account_name = Column(String(200), nullable=False)
    account_id = Column(String(100), nullable=False)
    access_token = Column(Text, nullable=False)                # Encrypted with Fernet
    refresh_token = Column(Text, nullable=True)                # Encrypted
    token_expiry = Column(DateTime, nullable=True)
    page_id = Column(String(100), nullable=True)
    scope = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    connected_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)


class OAuthState(Base):
    """Temporary CSRF protection table for OAuth flows."""
    __tablename__ = "oauth_states"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(100), unique=True, index=True, nullable=False)
    platform = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
