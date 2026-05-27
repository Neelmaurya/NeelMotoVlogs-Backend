from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Blog, Video, User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats/")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    blogs_count = db.query(Blog).count()
    videos_count = db.query(Video).count()
    users_count = db.query(User).count()
    
    # Placeholder for actual analytics
    return {
        "stats": [
            {"label": "Total Views", "value": "4.2K", "change": "+2.4%", "trend": "up"},
            {"label": "Blog Posts", "value": str(blogs_count), "change": "+1", "trend": "up"},
            {"label": "YouTube Videos", "value": str(videos_count), "change": "+2", "trend": "up"},
            {"label": "Subscribers", "value": str(users_count), "change": "+5", "trend": "up"},
        ]
    }
