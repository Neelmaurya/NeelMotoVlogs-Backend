from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import asyncio
from concurrent.futures import ThreadPoolExecutor
import uuid

from database import get_db
from models.bike_review import GenerationJob, BikeReviewCache
from cache import get_cached_review, save_to_cache
from services.wikipedia import fetch_wikipedia_data
from services.reddit import fetch_reddit_opinions
from services.youtube_ai import fetch_youtube_transcripts
from services.groq_ai import generate_bike_review

router = APIRouter(prefix="/ai-reviews", tags=["AI Bike Reviews"])
executor = ThreadPoolExecutor(max_workers=6)

class BikeReviewRequest(BaseModel):
    bike_name: str

@router.post("/generate/")
async def generate_review(
    request: BikeReviewRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    bike_name = request.bike_name.strip()
    if not bike_name:
        raise HTTPException(status_code=400, detail="bike_name is required")

    # Step 1: Check cache first
    cached = get_cached_review(db, bike_name)
    if cached:
        return {
            "status": "cached",
            "data": cached
        }

    # Step 2: Check if already generating
    existing_job = db.query(GenerationJob).filter(
        GenerationJob.bike_name == bike_name,
        GenerationJob.status.in_(["pending", "processing"])
    ).first()

    if existing_job:
        return {
            "status": "generating",
            "job_id": existing_job.job_id,
            "message": "Already generating, please poll /status endpoint"
        }

    # Step 3: Create job and start background generation
    job_id = str(uuid.uuid4())
    job = GenerationJob(job_id=job_id, bike_name=bike_name, status="pending")
    db.add(job)
    db.commit()

    background_tasks.add_task(run_generation_pipeline, job_id, bike_name)

    return {
        "status": "generating",
        "job_id": job_id,
        "message": "Generation started. Poll /api/ai-reviews/status/{job_id}"
    }

@router.get("/status/{job_id}")
async def get_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(GenerationJob).filter(GenerationJob.job_id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status == "completed":
        return {"status": "completed", "data": job.result}
    elif job.status == "failed":
        return {"status": "failed", "error": job.error}
    else:
        return {"status": job.status, "message": "Still generating..."}

@router.get("/popular")
async def get_popular_bikes(db: Session = Depends(get_db)):
    popular = db.query(BikeReviewCache).order_by(
        BikeReviewCache.search_count.desc()
    ).limit(10).all()

    return [{
        "bike_name": b.bike_name,
        "search_count": b.search_count,
        "cached": True
    } for b in popular]

async def run_generation_pipeline(job_id: str, bike_name: str):
    db = next(get_db())

    try:
        job = db.query(GenerationJob).filter(GenerationJob.job_id == job_id).first()
        job.status = "processing"
        db.commit()

        # Run blocking IO concurrently using asyncio.to_thread (Python 3.9+)
        async def safe_run(fn, *args, timeout=15, fallback=None):
            try:
                return await asyncio.wait_for(asyncio.to_thread(fn, *args), timeout=timeout)
            except (asyncio.TimeoutError, Exception) as e:
                print(f"[Pipeline] {fn.__name__} error/timeout: {e}")
                return fallback

        wikipedia_data, reddit_data, youtube_transcripts = await asyncio.gather(
            safe_run(fetch_wikipedia_data, bike_name, timeout=20, fallback={"images": [], "description": ""}),
            safe_run(fetch_reddit_opinions,  bike_name, timeout=12, fallback={"reddit_posts": []}),
            safe_run(fetch_youtube_transcripts, bike_name, timeout=10, fallback=[]),
        )

        review = generate_bike_review(
            bike_name, wikipedia_data, reddit_data, youtube_transcripts
        )
        
        if "error" in review:
            raise Exception(review["error"])

        images = wikipedia_data.get("images", [])
        review["images"] = images
        review["bike_name"] = bike_name
        
        save_to_cache(db, bike_name, images, review)

        job.status = "completed"
        job.result = review
        db.commit()

    except Exception as e:
        job = db.query(GenerationJob).filter(GenerationJob.job_id == job_id).first()
        job.status = "failed"
        job.error = str(e)
        db.commit()
    finally:
        db.close()
