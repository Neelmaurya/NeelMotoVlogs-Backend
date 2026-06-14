import subprocess
import os
from datetime import timedelta
from config import settings

OUTPUT_DIR = settings.VIDEO_OUTPUT_DIR
TEMP_DIR = settings.TEMP_VIDEO_DIR

def get_duration(path: str) -> float:
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", path],
        capture_output=True, text=True
    )
    try:
        return float(result.stdout.strip())
    except Exception:
        return 0.0

def get_total_duration(paths: list) -> float:
    total = 0.0
    for p in paths:
        total += get_duration(p)
    return total

def cleanup_temp_files(paths: list):
    for p in paths:
        try:
            if os.path.exists(p):
                os.remove(p)
        except Exception:
            pass

def fmt(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def generate_srt(story_text: str, total_duration: float) -> str:
    # Split by simple punctuation
    sentences = [s.strip() for s in story_text.replace('\n', ' ').split('. ') if s.strip()]
    if not sentences:
        sentences = [story_text.strip()]
        
    srt_path = os.path.join(TEMP_DIR, "subtitles.srt")
    time_per = total_duration / max(len(sentences), 1)
    
    with open(srt_path, "w", encoding="utf-8") as f:
        for i, sentence in enumerate(sentences):
            start = i * time_per
            end = (i + 1) * time_per
            f.write(f"{i+1}\n{fmt(start)} --> {fmt(end)}\n{sentence}\n\n")
            
    return srt_path

def prepare_clips(video_clips: list, total_duration: float, video_format: str) -> list:
    prepared = []
    # Set targets: 1080x1920 for reels, 1920x1080 for standard landscape videos
    scale = "1080:1920" if video_format == "9:16" else "1920:1080"
    crop = "crop=1080:1920" if video_format == "9:16" else "crop=1920:1080"
    
    clip_duration = max(3.0, min(total_duration / max(len(video_clips), 1), 12.0))

    for i, clip in enumerate(video_clips):
        out_path = os.path.join(TEMP_DIR, f"prep_{i}_{os.path.basename(clip['path'])}")
        
        # Crop/Scale filter string
        # Scale to match boundaries and then crop center
        vf_filter = f"scale={scale}:force_original_aspect_ratio=increase,{crop},setsar=1"
        
        cmd = [
            "ffmpeg", "-y", "-i", clip["path"],
            "-t", str(clip_duration),
            "-vf", vf_filter,
            "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
            "-an", "-r", "24", out_path, "-loglevel", "error"
        ]
        try:
            subprocess.run(cmd, check=True, timeout=60)
            prepared.append(out_path)
        except Exception:
            continue
            
    return prepared

def concatenate_clips(clip_paths: list, output_path: str, total_duration: float) -> str:
    list_path = os.path.join(TEMP_DIR, "concat_list.txt")
    
    clips_needed = clip_paths.copy()
    # Loop and repeat clips if we don't have enough duration compiled
    while get_total_duration(clips_needed) < total_duration:
        clips_needed.extend(clip_paths)
        
    with open(list_path, "w") as f:
        for clip in clips_needed:
            f.write(f"file '{os.path.abspath(clip)}'\n")
            
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", list_path, "-t", str(total_duration), "-c", "copy",
        output_path, "-loglevel", "error"
    ], check=True, timeout=120)
    
    # Clean up the list file
    if os.path.exists(list_path):
        os.remove(list_path)
        
    return output_path

def merge_audio_video(video_path: str, audio_path: str, output_path: str) -> str:
    subprocess.run([
        "ffmpeg", "-y", "-i", video_path, "-i", audio_path,
        "-c:v", "copy", "-c:a", "aac", "-shortest",
        output_path, "-loglevel", "error"
    ], check=True, timeout=120)
    return output_path

def add_subtitles_to_video(video_path: str, srt_path: str, output_path: str) -> str:
    # Escape path for FFmpeg filters
    srt_filter_path = srt_path.replace("\\", "/").replace(":", "\\:")
    vf_subtitles = f"subtitles='{srt_filter_path}':force_style='FontSize=20,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,Alignment=2,MarginV=30'"
    
    subprocess.run([
        "ffmpeg", "-y", "-i", video_path,
        "-vf", vf_subtitles,
        "-c:a", "copy", "-preset", "ultrafast",
        output_path, "-loglevel", "error"
    ], check=True, timeout=120)
    return output_path

def generate_fallback_video(total_duration: float, video_format: str, output_path: str) -> str:
    """Generates a styled synthetic background video if no video clips are downloaded."""
    size = "1080x1920" if video_format == "9:16" else "1920x1080"
    
    # Generate a dark slate gray background video
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"color=c=0x1E293B:s={size}:d={total_duration}:r=24",
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
        "-pix_fmt", "yuv420p", output_path, "-loglevel", "error"
    ]
    subprocess.run(cmd, check=True, timeout=60)
    return output_path

def assemble_video(audio_path: str, video_clips: list, story_text: str,
                   output_filename: str, video_format: str = "9:16", add_subtitles: bool = True) -> str:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(TEMP_DIR, exist_ok=True)
    
    output_path = os.path.join(OUTPUT_DIR, output_filename)
    audio_duration = get_duration(audio_path)
    if audio_duration == 0.0:
        audio_duration = 60.0 # fallback default

    concat_path = os.path.join(TEMP_DIR, f"concat_{output_filename}")
    
    # 1. Scale/crop all clip segments
    prepared = prepare_clips(video_clips, audio_duration, video_format)
    
    if not prepared:
        # If stock videos failed to fetch, generate a robust styled fallback background
        generate_fallback_video(audio_duration, video_format, concat_path)
    else:
        # 2. Concatenate them to fit audio duration
        concatenate_clips(prepared, concat_path, audio_duration)

    # 3. Merge audio and video streams
    merged_path = os.path.join(TEMP_DIR, f"merged_{output_filename}")
    merge_audio_video(concat_path, audio_path, merged_path)

    # 4. Generate subtitles and burn them
    if add_subtitles:
        srt_path = generate_srt(story_text, audio_duration)
        final_path = add_subtitles_to_video(merged_path, srt_path, output_path)
        cleanup_temp_files([srt_path])
    else:
        if os.path.exists(output_path):
            os.remove(output_path)
        os.rename(merged_path, output_path)
        final_path = output_path

    # Clean up temp assets
    cleanup_temp_files([concat_path, merged_path] + prepared)
    return final_path
