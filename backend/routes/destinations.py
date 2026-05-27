from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Country, State, City
from pydantic import BaseModel

router = APIRouter(prefix="/destinations", tags=["Destinations"])

@router.get("/")
async def get_all_destinations(db: Session = Depends(get_db)):
    # Returns a summary or just a list of countries
    return db.query(Country).all()

@router.get("/countries/{slug}/")
async def get_country(slug: str, db: Session = Depends(get_db)):
    return db.query(Country).filter(Country.slug == slug).first()

@router.get("/states/{slug}/")
async def get_state(slug: str, db: Session = Depends(get_db)):
    return db.query(State).filter(State.slug == slug).first()

@router.get("/cities/{slug}/")
async def get_city(slug: str, db: Session = Depends(get_db)):
    return db.query(City).filter(City.slug == slug).first()
