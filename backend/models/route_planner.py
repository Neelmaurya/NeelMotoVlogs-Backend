from sqlalchemy import Column, Integer, String, JSON, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class RoutePlanCache(Base):
    __tablename__ = "route_plan_cache"

    id              = Column(Integer, primary_key=True, index=True)
    route_key       = Column(String(250), unique=True, index=True)
    source          = Column(String(200))
    destination     = Column(String(200))
    transport_mode  = Column(String(50))
    preferences     = Column(JSON)
    plan_data       = Column(JSON)
    created_at      = Column(DateTime, server_default=func.now())
    updated_at      = Column(DateTime, onupdate=func.now())
    search_count    = Column(Integer, default=1)

class RouteGenerationJob(Base):
    __tablename__ = "route_generation_jobs"

    id              = Column(Integer, primary_key=True, index=True)
    job_id          = Column(String(100), unique=True, index=True)
    source          = Column(String(200))
    destination     = Column(String(200))
    transport_mode  = Column(String(50))
    preferences     = Column(JSON)
    status          = Column(String(20), default="pending")  # pending, processing, completed, failed
    result          = Column(JSON, nullable=True)
    error           = Column(Text, nullable=True)
    created_at      = Column(DateTime, server_default=func.now())
    updated_at      = Column(DateTime, onupdate=func.now())
