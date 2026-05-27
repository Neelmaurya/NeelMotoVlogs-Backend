from sqlalchemy import Column, Integer, String, JSON, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class BikeReviewCache(Base):
    __tablename__ = "bike_review_cache"

    id              = Column(Integer, primary_key=True, index=True)
    bike_name_key   = Column(String(200), unique=True, index=True)
    bike_name       = Column(String(200))
    review_data     = Column(JSON)
    images          = Column(JSON)
    created_at      = Column(DateTime, server_default=func.now())
    updated_at      = Column(DateTime, onupdate=func.now())
    search_count    = Column(Integer, default=1)

class GenerationJob(Base):
    __tablename__ = "generation_jobs"

    id          = Column(Integer, primary_key=True, index=True)
    job_id      = Column(String(100), unique=True, index=True)
    bike_name   = Column(String(200))
    status      = Column(String(20), default="pending")
    result      = Column(JSON, nullable=True)
    error       = Column(Text, nullable=True)
    created_at  = Column(DateTime, server_default=func.now())
    updated_at  = Column(DateTime, onupdate=func.now())
