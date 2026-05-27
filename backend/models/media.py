from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Country(Base):
    __tablename__ = "countries"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True)
    states = relationship("State", back_populates="country")

class State(Base):
    __tablename__ = "states"
    id = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, ForeignKey("countries.id"))
    name = Column(String(100), nullable=False)
    slug = Column(String(100))
    country = relationship("Country", back_populates="states")
    cities = relationship("City", back_populates="state")

class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id"))
    name = Column(String(100), nullable=False)
    slug = Column(String(100))
    state = relationship("State", back_populates="cities")

class Video(Base):
    __tablename__ = "videos"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    youtube_id = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    thumbnail = Column(String(255), nullable=True)
    published_at = Column(DateTime, nullable=True)
    views_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
