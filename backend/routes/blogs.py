from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Blog, User
from routes.users import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/blogs", tags=["Blogs"])

class BlogBase(BaseModel):
    title: str
    content: str
    status: str = "DRAFT"

class BlogResponse(BlogBase):
    id: int
    slug: str
    created_at: datetime
    views_count: int
    
    class Config:
        from_attributes = True

@router.get("/", response_model=List[BlogResponse])
async def get_blogs(db: Session = Depends(get_db)):
    return db.query(Blog).all()

@router.get("/{slug}/", response_model=BlogResponse)
async def get_blog(slug: str, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.slug == slug).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog

@router.post("/", response_model=BlogResponse)
async def create_blog(blog_data: BlogBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    import slugify
    new_blog = Blog(
        title=blog_data.title,
        content=blog_data.content,
        status=blog_data.status,
        author_id=current_user.id,
        slug=blog_data.title.lower().replace(" ", "-") # Simple slug for now
    )
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    return new_blog
