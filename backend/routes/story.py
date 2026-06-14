from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
import os

from database import get_db
from models.story_video import Story, StoryPart
from services.story_service import expand_story, split_story_into_parts
from services.tts_service import get_all_voices
from services.scheduler_service import process_story_part

router = APIRouter(prefix="/api/admin", tags=["Stories"])


class StoryCreateRequest(BaseModel):
    title: str
    short_story: str
    language: str = "en"
    voice_id: str = "en-IN-NeerjaNeural"
    video_type: str = "reel"
    video_format: str = "9:16"
    duration_secs: int = 60
    schedule_freq: str = "daily"
    schedule_time: str = "10:00"
    platforms: List[str] = ["youtube"]


@router.post("/stories/create")
async def create_story(request: StoryCreateRequest, db: Session = Depends(get_db)):
    expanded = expand_story(request.short_story, request.language)
    parts_text = split_story_into_parts(expanded, request.duration_secs)

    try:
        h, m = map(int, request.schedule_time.split(":"))
    except ValueError:
        h, m = 10, 0
        
    base_time = datetime.utcnow().replace(hour=h, minute=m, second=0, microsecond=0)
    if base_time <= datetime.utcnow():
        base_time += timedelta(days=1)

    interval = timedelta(days=1) if request.schedule_freq == "daily" else timedelta(weeks=1)

    story = Story(
        title=request.title,
        original_text=request.short_story,
        expanded_text=expanded,
        language=request.language,
        voice_id=request.voice_id,
        video_type=request.video_type,
        format=request.video_format,
        duration_secs=request.duration_secs,
        schedule_freq=request.schedule_freq,
        schedule_time=request.schedule_time,
        platforms=request.platforms,
        status="scheduled"
    )
    db.add(story)
    db.flush()

    for i, text in enumerate(parts_text):
        db.add(StoryPart(
            story_id=story.id,
            part_number=i + 1,
            text=text,
            scheduled_at=base_time + (interval * i),
            status="pending"
        ))

    db.commit()
    return {
        "story_id": story.id,
        "total_parts": len(parts_text),
        "first_post_at": base_time.isoformat(),
        "schedule": f"Every {request.schedule_freq} at {request.schedule_time}",
        "preview_text": expanded[:300] + "..."
    }


@router.get("/stories")
async def list_stories(db: Session = Depends(get_db)):
    stories = db.query(Story).order_by(Story.created_at.desc()).all()
    result = []
    for s in stories:
        parts = db.query(StoryPart).filter_by(story_id=s.id).all()
        result.append({
            "id": s.id,
            "title": s.title,
            "status": s.status,
            "total_parts": len(parts),
            "posted_parts": sum(1 for p in parts if p.status == "posted"),
            "next_post": next(
                (p.scheduled_at.isoformat() for p in parts if p.status == "pending"), None
            ),
            "platforms": s.platforms,
            "created_at": s.created_at.isoformat()
        })
    return result


@router.get("/stories/{story_id}")
async def get_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(Story).filter_by(id=story_id).first()
    if not story:
        raise HTTPException(404, "Story not found")
    parts = db.query(StoryPart).filter_by(story_id=story_id).order_by(
        StoryPart.part_number
    ).all()
    return {"story": story, "parts": parts}


@router.post("/stories/parts/{part_id}/trigger")
async def trigger_part(part_id: int, background_tasks: BackgroundTasks,
                       db: Session = Depends(get_db)):
    part = db.query(StoryPart).filter_by(id=part_id).first()
    if not part:
        raise HTTPException(404, "Part not found")
    background_tasks.add_task(process_story_part, part_id)
    return {"status": "triggered", "part_id": part_id}


@router.get("/stories/parts/{part_id}/download")
async def download_part_video(part_id: int, db: Session = Depends(get_db)):
    part = db.query(StoryPart).filter_by(id=part_id).first()
    if not part or not part.video_path:
        raise HTTPException(404, "Video file not ready or not found")
        
    if not os.path.exists(part.video_path):
        raise HTTPException(404, "Video file missing on disk")
        
    return FileResponse(
        path=part.video_path,
        media_type="video/mp4",
        filename=os.path.basename(part.video_path)
    )


@router.delete("/stories/{story_id}")
async def delete_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(Story).filter_by(id=story_id).first()
    if not story:
        raise HTTPException(404, "Story not found")
    db.delete(story)
    db.commit()
    return {"status": "deleted"}


@router.get("/voices")
async def get_voices():
    return get_all_voices()
