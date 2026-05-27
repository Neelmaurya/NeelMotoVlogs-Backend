from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Video
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/videos", tags=["Videos"])

class VideoResponse(BaseModel):
    id: int
    title: str
    youtube_id: str
    views_count: int
    published_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[VideoResponse])
async def get_videos(db: Session = Depends(get_db)):
    return db.query(Video).filter(Video.is_active == True).all()
