from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.bike_review import BikeReviewCache
import re

CACHE_TTL_DAYS = 7

def normalize_bike_name(bike_name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', bike_name.lower().strip()).strip('-')

def get_cached_review(db: Session, bike_name: str) -> dict | None:
    key = normalize_bike_name(bike_name)
    cached = db.query(BikeReviewCache).filter(
        BikeReviewCache.bike_name_key == key
    ).first()

    if not cached:
        return None

    age = datetime.utcnow() - cached.created_at.replace(tzinfo=None)
    if age > timedelta(days=CACHE_TTL_DAYS):
        return None

    if cached.review_data and "error" in cached.review_data:
        db.delete(cached)
        db.commit()
        return None

    # Also purge cache if images are missing (from earlier bugs)
    if not cached.images or len(cached.images) == 0:
        db.delete(cached)
        db.commit()
        return None

    # Self-healing: Check if the cache contains bad UI images or icons from old runs
    from services.wikipedia import is_valid_image_url, make_high_res_aepl

    has_bad_images = False
    for img in cached.images:
        # check_filename=True ensures Wikimedia URLs with wrong bike filenames are purged
        if not is_valid_image_url(img, cached.bike_name, check_filename=True):
            has_bad_images = True
            break

    if has_bad_images:
        db.delete(cached)
        db.commit()
        return None

    # Upgrade any legacy low-res images to high-res on the fly
    upgraded_images = [make_high_res_aepl(img) for img in cached.images]

    cached.search_count += 1
    db.commit()

    return {
        "bike_name": cached.bike_name,
        "images": upgraded_images,
        **cached.review_data,
        "_cached": True,
        "_cache_age_hours": round(age.total_seconds() / 3600, 1)
    }

def save_to_cache(db: Session, bike_name: str, images: list, review_data: dict):
    key = normalize_bike_name(bike_name)
    existing = db.query(BikeReviewCache).filter(
        BikeReviewCache.bike_name_key == key
    ).first()

    if existing:
        existing.review_data = review_data
        existing.images = images
        existing.updated_at = datetime.utcnow()
        existing.search_count += 1
    else:
        new_cache = BikeReviewCache(
            bike_name_key=key,
            bike_name=bike_name,
            review_data=review_data,
            images=images
        )
        db.add(new_cache)

    db.commit()
