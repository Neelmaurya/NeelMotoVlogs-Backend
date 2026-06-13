from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import asyncio
import uuid
import re
from datetime import datetime, timedelta

from database import get_db
from models.route_planner import RoutePlanCache, RouteGenerationJob

# Import Services
from services.geocoding_service import geocode_location
from services.routing_service import get_route
from services.weather_service import get_live_weather_destination, get_weather_for_stops
from services.places_service import (
    find_emergency_info,
    find_fuel_stations,
    find_hotels,
    find_tourist_spots_destination,
    find_places_en_route
)
from services.aqi_service import get_air_quality
from services.route_ai_service import generate_route_plan

router = APIRouter(prefix="/routes", tags=["AI Route Planner"])

CACHE_TTL_DAYS = 7

class RoutePlanRequest(BaseModel):
    source: str
    destination: str
    transport_mode: str = "car"
    preferences: dict = {}
    force_refresh: bool = False

def make_route_key(source: str, destination: str, transport_mode: str, prefs: dict) -> str:
    """Generate a clean unique string cache key from inputs."""
    style = prefs.get("riding_style", "balanced")
    budget = prefs.get("budget", "moderate")
    pace = prefs.get("pace", "relaxed")
    interests = "-".join(sorted(prefs.get("interests", [])))
    
    raw_key = f"{source}-{destination}-{transport_mode}-{style}-{budget}-{pace}-{interests}"
    return re.sub(r'[^a-z0-9]+', '-', raw_key.lower().strip()).strip('-')

@router.post("/generate/")
async def generate_route_plan_endpoint(
    request: RoutePlanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    source = request.source.strip()
    destination = request.destination.strip()
    transport_mode = request.transport_mode.strip()
    preferences = request.preferences
    
    if not source or not destination:
        raise HTTPException(status_code=400, detail="source and destination are required")

    route_key = make_route_key(source, destination, transport_mode, preferences)

    # Check cache first (unless force_refresh is requested)
    if not request.force_refresh:
        cached = db.query(RoutePlanCache).filter(RoutePlanCache.route_key == route_key).first()
        if cached:
            age = datetime.utcnow() - cached.created_at.replace(tzinfo=None)
            if age <= timedelta(days=CACHE_TTL_DAYS):
                cached.search_count += 1
                db.commit()
                return {
                    "status": "cached",
                    "data": cached.plan_data,
                    "route_key": route_key
                }

    # Check if a duplicate job is already running
    existing_job = db.query(RouteGenerationJob).filter(
        RouteGenerationJob.source == source,
        RouteGenerationJob.destination == destination,
        RouteGenerationJob.transport_mode == transport_mode,
        RouteGenerationJob.status.in_(["pending", "processing"])
    ).first()

    if existing_job:
        # Check if the preferences match or if it's broad enough
        # We can just return the duplicate job id
        return {
            "status": "generating",
            "job_id": existing_job.job_id,
            "message": "A plan with these locations is currently generating. Please poll its status."
        }

    # Create new background job
    job_id = str(uuid.uuid4())
    job = RouteGenerationJob(
        job_id=job_id,
        source=source,
        destination=destination,
        transport_mode=transport_mode,
        preferences=preferences,
        status="pending"
    )
    db.add(job)
    db.commit()

    background_tasks.add_task(
        run_route_pipeline, job_id, source, destination, transport_mode, preferences
    )

    return {
        "status": "generating",
        "job_id": job_id,
        "message": "Generation started. Poll /api/routes/status/{job_id}"
    }

@router.get("/status/{job_id}")
async def get_route_job_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(RouteGenerationJob).filter(RouteGenerationJob.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status == "completed":
        return {"status": "completed", "data": job.result}
    elif job.status == "failed":
        return {"status": "failed", "error": job.error}
    else:
        return {"status": job.status, "message": "Analyzing route parameters..."}

@router.get("/popular")
async def get_popular_routes(db: Session = Depends(get_db)):
    popular = db.query(RoutePlanCache).order_by(
        RoutePlanCache.search_count.desc()
    ).limit(10).all()

    return [{
        "source": r.source,
        "destination": r.destination,
        "transport_mode": r.transport_mode,
        "preferences": r.preferences,
        "route_key": r.route_key,
        "search_count": r.search_count
    } for r in popular]

@router.delete("/cache/{route_key}")
async def clear_route_cache(route_key: str, db: Session = Depends(get_db)):
    entry = db.query(RoutePlanCache).filter(RoutePlanCache.route_key == route_key).first()
    if entry:
        db.delete(entry)
        db.commit()
        return {"status": "cleared", "route_key": route_key}
    return {"status": "not_found", "route_key": route_key}

@router.delete("/cache-all")
async def clear_all_route_cache(db: Session = Depends(get_db)):
    count = db.query(RoutePlanCache).delete()
    db.commit()
    return {"status": "cleared", "deleted_count": count}


async def run_route_pipeline(
    job_id: str,
    source: str,
    destination: str,
    transport_mode: str,
    preferences: dict
):
    """Executes the concurrent API calls and Groq generation for the route plan."""
    db = next(get_db())
    try:
        job = db.query(RouteGenerationJob).filter(RouteGenerationJob.job_id == job_id).first()
        job.status = "processing"
        db.commit()

        # Concurrent task runner
        async def safe_run(fn, *args, timeout=20, fallback=None):
            try:
                return await asyncio.wait_for(asyncio.to_thread(fn, *args), timeout=timeout)
            except Exception as e:
                print(f"[Route Pipeline] {fn.__name__} failed: {e}")
                return fallback

        # 1. Geocode locations (sequential because coordinates are needed for following calls)
        src_coords = await safe_run(geocode_location, source, timeout=10, fallback=None)
        dst_coords = await safe_run(geocode_location, destination, timeout=10, fallback=None)
        
        if not src_coords or not dst_coords:
            raise Exception(f"Geocoding failed. Could not find coordinates for: {source if not src_coords else destination}")

        # 2. Get route geometry & waypoints
        route_res = await safe_run(get_route, src_coords, dst_coords, transport_mode, timeout=15, fallback=None)
        if not route_res:
            raise Exception(f"Failed to resolve route path between {source} and {destination}.")

        # 3. Fetch sensor details and local places concurrently
        (live_weather, weather_stops, fuel_stops, hotels,
         tourist_dest, en_route, aqi_data, emergency_info) = await asyncio.gather(
            safe_run(get_live_weather_destination, dst_coords, timeout=12, fallback={}),
            safe_run(get_weather_for_stops, route_res["waypoints"], timeout=15, fallback=[]),
            safe_run(find_fuel_stations, route_res["waypoints"], timeout=15, fallback=[]),
            safe_run(find_hotels, route_res["waypoints"], timeout=15, fallback=[]),
            safe_run(find_tourist_spots_destination, dst_coords, timeout=15, fallback=[]),
            safe_run(find_places_en_route, route_res["coordinates"], timeout=15, fallback=[]),
            safe_run(get_air_quality, dst_coords, timeout=10, fallback={}),
            safe_run(find_emergency_info, route_res["waypoints"], dst_coords, timeout=15, fallback={})
        )

        # 4. Generate travel details with Groq Llama 3.3
        ai_plan = await safe_run(
            generate_route_plan,
            source, destination, transport_mode,
            route_res, weather_stops, live_weather,
            fuel_stops, hotels, tourist_dest, en_route,
            preferences,
            timeout=40,
            fallback=None
        )

        if not ai_plan or "error" in ai_plan:
            error_msg = ai_plan.get("error") if ai_plan else "Groq AI generation timed out."
            raise Exception(f"AI Plan Generation Error: {error_msg}")

        # Subsample coordinates for storage to keep payload sizes reasonable
        # Every 4th point is plenty for Map rendering
        subsampled_coords = route_res["coordinates"][::4]
        
        full_plan = {
            "source_info": src_coords,
            "destination_info": dst_coords,
            "route_info": {
                "coordinates": subsampled_coords,
                "distance_km": route_res["distance_km"],
                "duration_hours": route_res["duration_hours"],
                "waypoints": route_res["waypoints"],
                "source_api": route_res["source_api"]
            },
            "live_weather": live_weather,
            "weather_stops": weather_stops,
            "fuel_stops": fuel_stops,
            "hotels": hotels,
            "tourist_spots_destination": tourist_dest,
            "places_en_route": en_route,
            "aqi": aqi_data,
            "emergency_info": emergency_info,
            "ai_plan": ai_plan
        }

        # 5. Save to database cache
        route_key = make_route_key(source, destination, transport_mode, preferences)
        existing = db.query(RoutePlanCache).filter(RoutePlanCache.route_key == route_key).first()
        if existing:
            existing.plan_data = full_plan
            existing.updated_at = datetime.utcnow()
            existing.search_count += 1
        else:
            new_cache = RoutePlanCache(
                route_key=route_key,
                source=source,
                destination=destination,
                transport_mode=transport_mode,
                preferences=preferences,
                plan_data=full_plan
            )
            db.add(new_cache)
        
        # Complete the job
        job = db.query(RouteGenerationJob).filter(RouteGenerationJob.job_id == job_id).first()
        job.status = "completed"
        job.result = full_plan
        db.commit()

    except Exception as e:
        print(f"[Route Pipeline] Execution failed for job {job_id}: {e}")
        job = db.query(RouteGenerationJob).filter(RouteGenerationJob.job_id == job_id).first()
        if job:
            job.status = "failed"
            job.error = str(e)
            db.commit()
    finally:
        db.close()
