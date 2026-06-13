"""
Run this once after the image-validation fix to wipe stale cached reviews.
Usage: python clear_cache.py
"""
from database import SessionLocal
from models.bike_review import BikeReviewCache, GenerationJob

db = SessionLocal()
try:
    cache_count = db.query(BikeReviewCache).delete()
    job_count = db.query(GenerationJob).delete()
    db.commit()
    print(f"[OK] Cleared {cache_count} cached review(s) and {job_count} stale job(s).")
    print("     All bikes will now regenerate fresh with corrected image filtering.")
except Exception as e:
    db.rollback()
    print(f"[ERROR] {e}")
finally:
    db.close()
