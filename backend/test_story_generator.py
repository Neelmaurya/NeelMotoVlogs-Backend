import sys
import os
import asyncio
from dotenv import load_dotenv

# Ensure we can load local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv()

from services.story_service import expand_story, split_story_into_parts, extract_video_keywords
from services.tts_service import generate_audio, get_audio_duration
from services.video_fetch_service import fetch_videos_for_story
from services.video_assembly_service import assemble_video

def run_integration_test():
    print("=== STARTING INTEGRATION TEST ===")
    
    # 1. Expand story
    short = "I rode my Royal Enfield Interceptor 650 through the heavy rain in Rohtang Pass, the tires slipped and it was scary but beautiful."
    print("\n1. Expanding story via Groq...")
    expanded = expand_story(short, "en")
    print(f"Expanded Story Output:\n{expanded[:300]}...\n")
    
    # 2. Split into parts
    print("2. Splitting story into parts (60s chunks)...")
    parts = split_story_into_parts(expanded, 60)
    print(f"Total parts generated: {len(parts)}")
    for i, p in enumerate(parts):
        print(f"Part {i+1} text size: {len(p.split())} words")
        
    if not parts:
        print("FAIL: No parts generated.")
        return
        
    test_part = parts[0]
    
    # 3. Extract keywords
    print("\n3. Extracting visual keywords via Groq...")
    keywords = extract_video_keywords(test_part)
    print(f"Keywords extracted: {keywords}")
    
    # 4. Generate audio via Edge TTS
    print("\n4. Generating audio via Edge TTS...")
    audio_path = os.path.join(os.getcwd(), "audio", "test_narration.mp3")
    generate_audio(test_part, "en-IN-NeerjaNeural", audio_path)
    duration = get_audio_duration(audio_path)
    print(f"Audio generated successfully at: {audio_path}")
    print(f"Audio duration: {duration:.2f} seconds")
    
    # 5. Fetch video clips
    print("\n5. Fetching video clips from stock providers...")
    clips = fetch_videos_for_story(keywords, duration, "9:16")
    print(f"Clips fetched and downloaded: {len(clips)}")
    for c in clips:
        print(f"  - Path: {c['path']}, Duration: {c['duration']}s")
        
    if not clips:
        print("NOTE: No clips downloaded. Pipeline will use synthetic colored background fallback.")
        
    # 6. Assemble Video
    print("\n6. Assembling final video via FFmpeg...")
    try:
        final_video_path = assemble_video(
            audio_path=audio_path,
            video_clips=clips,
            story_text=test_part,
            output_filename="test_output_reel.mp4",
            video_format="9:16",
            add_subtitles=True
        )
        print(f"SUCCESS: Video successfully assembled at: {final_video_path}")
        print(f"File size: {os.path.getsize(final_video_path) / (1024*1024):.2f} MB")
    except Exception as e:
        print(f"FAIL: Video assembly failed: {str(e)}")
        
    # Cleanup temp clips
    print("\nCleaning up downloaded test clips...")
    for clip in clips:
        try:
            if os.path.exists(clip["path"]):
                os.remove(clip["path"])
        except Exception:
            pass
            
    print("\n=== INTEGRATION TEST COMPLETE ===")

if __name__ == "__main__":
    run_integration_test()
