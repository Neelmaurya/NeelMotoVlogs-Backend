from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

# Association table for Blog <-> Tag (Many-to-Many)
blog_tags = Table(
    "blog_tags",
    Base.metadata,
    Column("blog_id", Integer, ForeignKey("blogs.id")),
    Column("tag_id", Integer, ForeignKey("tags.id")),
)

class BlogStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(255), unique=True, index=True)
    description = Column(Text, nullable=True)
    blogs = relationship("Blog", back_populates="category")

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    slug = Column(String(100), unique=True, index=True)

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200), nullable=False)
    slug = Column(String(255), unique=True, index=True)
    content = Column(Text, nullable=False) # Store HTML from editor
    excerpt = Column(String(500), nullable=True)
    cover_image = Column(String, nullable=True)
    
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    status = Column(String, default=BlogStatus.DRAFT)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)
    
    # SEO Fields
    meta_title = Column(String(100), nullable=True)
    meta_description = Column(Text, nullable=True)
    keywords = Column(String(255), nullable=True)
    
    # Analytics
    views_count = Column(Integer, default=0)
    read_time = Column(Integer, default=0)

    # Relationships
    author = relationship("User")
    category = relationship("Category", back_populates="blogs")
    tags = relationship("Tag", secondary=blog_tags)
