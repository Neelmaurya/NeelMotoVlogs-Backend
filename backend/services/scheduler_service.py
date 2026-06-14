from database import SessionLocal
from models.story_video import Story, StoryPart, SocialAccount
from services.story_service import extract_video_keywords
from services.tts_service import generate_audio, get_audio_duration
from services.video_fetch_service import fetch_videos_for_story
from services.video_assembly_service import assemble_video
from services.metadata_service import generate_social_metadata
from services.youtube_service import get_youtube_client, upload_to_youtube
from services.instagram_service import upload_to_instagram, upload_to_facebook
from datetime import datetime
import os

def process_story_part(part_id: int):
    """Executes the complete generation and upload pipeline for a story part."""
    db = SessionLocal()
    part = db.query(StoryPart).filter_by(id=part_id).first()
    if not part:
        db.close()
        return

    part.status = "processing"
    db.commit()

    try:
        story = part.story
        
        # Step 1: Extract keywords
        keywords = extract_video_keywords(part.text)
        
        # Step 2: Generate TTS Audio
        audio_filename = f"audio_{story.id}_{part.part_number}.mp3"
        audio_path = os.path.join(os.getcwd(), "audio", audio_filename)
        generate_audio(part.text, story.voice_id, audio_path)
        
        part.audio_path = audio_path
        part.duration_secs = get_audio_duration(audio_path)
        part.status = "audio_ready"
        db.commit()
        
        # Step 3: Fetch video clips
        clips = fetch_videos_for_story(keywords, part.duration_secs, story.format)
            
        part.status = "video_ready"
        db.commit()
        
        # Step 4: Assemble video using FFmpeg
        video_filename = f"video_{story.id}_{part.part_number}.mp4"
        video_path = assemble_video(
            audio_path=audio_path,
            video_clips=clips,
            story_text=part.text,
            output_filename=video_filename,
            video_format=story.format,
            add_subtitles=True
        )
        
        part.video_path = video_path
        db.commit()
        
        # Clean up temporary downloaded video clips to save space
        for clip in clips:
            try:
                if os.path.exists(clip["path"]):
                    os.remove(clip["path"])
            except Exception:
                pass

        # Step 5: Upload to platforms
        # We need the public download URL of this video for Meta's fetch APIs.
        # Use Railway's public networking URL if present, otherwise fallback
        public_domain = os.getenv("RAILWAY_PUBLIC_DOMAIN", "neelmotovlogs-backend-production.up.railway.app")
        # Ensure it has protocol
        if not public_domain.startswith("http"):
            public_domain = f"https://{public_domain}"
            
        video_public_url = f"{public_domain}/api/admin/stories/parts/{part.id}/download"
        
        metadata_map = {}
        
        # Check and post to platforms
        for platform in story.platforms:
            account = db.query(SocialAccount).filter_by(platform=platform, is_active=True).first()
            if not account:
                # Log that connection is missing but continue for others
                metadata_map[platform] = {"error": f"No active {platform} connection found."}
                continue
                
            social_meta = generate_social_metadata(part.text, platform)
            caption = social_meta.get("description", part.text)
            title = social_meta.get("title", f"{story.title} - Part {part.part_number}")
            tags = social_meta.get("tags", [])
            
            try:
                if platform == "youtube":
                    client = get_youtube_client(account, db=db)
                    yt_id = upload_to_youtube(video_path, title, caption, tags, client=client)
                    part.youtube_id = yt_id
                    metadata_map["youtube"] = {"id": yt_id, "title": title}
                    
                elif platform == "instagram":
                    ig_id = upload_to_instagram(video_public_url, caption, account)
                    part.instagram_id = ig_id
                    metadata_map["instagram"] = {"id": ig_id}
                    
                elif platform == "facebook":
                    fb_id = upload_to_facebook(video_public_url, caption, account)
                    part.facebook_id = fb_id
                    metadata_map["facebook"] = {"id": fb_id}
                    
            except Exception as upload_err:
                metadata_map[platform] = {"error": str(upload_err)}
                
        part.metadata_json = metadata_map
        part.posted_at = datetime.utcnow()
        part.status = "posted"
        db.commit()

    except Exception as e:
        part.status = "error"
        part.error_msg = str(e)
        db.commit()
    finally:
        db.close()
