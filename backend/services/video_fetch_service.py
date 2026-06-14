import requests
import os
from config import settings

DOWNLOAD_DIR = settings.TEMP_VIDEO_DIR

def fetch_videos_for_story(keywords: list, duration_needed: float,
                            video_format: str = "9:16") -> list:
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)
    all_videos = []

    for keyword in keywords[:5]:
        videos = fetch_from_pexels(keyword, video_format)
        if not videos:
            videos = fetch_from_pixabay(keyword)
        if not videos:
            videos = fetch_from_mixkit(keyword)
        
        all_videos.extend(videos)

        # Stop looking for more clips if we have plenty of duration
        if sum(v.get("duration", 10) for v in all_videos) >= duration_needed * 1.5:
            break

    downloaded = []
    # Limit to maximum 15 downloaded clips to save bandwidth and prevent slow processing
    for video in all_videos[:15]:
        path = download_video(video["url"], video["id"])
        if path:
            downloaded.append({"path": path, "duration": video.get("duration", 10)})
            
    return downloaded


def fetch_from_pexels(keyword: str, video_format: str = "9:16") -> list:
    if not settings.PEXELS_API_KEY:
        return []
    try:
        resp = requests.get(
            "https://api.pexels.com/videos/search",
            headers={"Authorization": settings.PEXELS_API_KEY},
            params={
                "query": keyword,
                "per_page": 5,
                "orientation": "portrait" if video_format == "9:16" else "landscape",
                "size": "medium"
            },
            timeout=10
        ).json()
        
        videos = []
        for video in resp.get("videos", []):
            suitable = [f for f in video.get("video_files", [])
                        if f.get("quality") in ["hd", "sd"] or f.get("height", 0) >= 720]
            if suitable:
                # Find best resolution file
                file_url = suitable[0]["link"]
                videos.append({
                    "id": f"pexels_{video['id']}",
                    "url": file_url,
                    "duration": video.get("duration", 10),
                    "source": "pexels"
                })
        return videos
    except Exception:
        return []


def fetch_from_pixabay(keyword: str) -> list:
    if not settings.PIXABAY_API_KEY:
        return []
    try:
        resp = requests.get(
            "https://pixabay.com/api/videos/",
            params={
                "key": settings.PIXABAY_API_KEY,
                "q": keyword,
                "per_page": 5,
                "video_type": "film",
                "safesearch": "true"
            },
            timeout=10
        ).json()
        
        videos = []
        for hit in resp.get("hits", []):
            medium = hit.get("videos", {}).get("medium") or hit.get("videos", {}).get("small")
            if medium:
                videos.append({
                    "id": f"pixabay_{hit['id']}",
                    "url": medium["url"],
                    "duration": hit.get("duration", 10),
                    "source": "pixabay"
                })
        return videos
    except Exception:
        return []


def fetch_from_mixkit(keyword: str) -> list:
    # Free static curated fallback clips hosted directly on Mixkit CDN
    MIXKIT_CLIPS = {
        "motorcycle": "https://assets.mixkit.co/videos/preview/mixkit-man-riding-a-motorcycle-on-a-highway-4873-large.mp4",
        "mountain":   "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-mountains-4863-large.mp4",
        "road":       "https://assets.mixkit.co/videos/preview/mixkit-road-through-a-forest-4819-large.mp4",
        "rain":       "https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-a-forest-lake-18312-large.mp4",
        "sunset":     "https://assets.mixkit.co/videos/preview/mixkit-sunset-over-mountains-4871-large.mp4",
        "city":       "https://assets.mixkit.co/videos/preview/mixkit-traffic-on-a-busy-city-street-4827-large.mp4",
        "travel":     "https://assets.mixkit.co/videos/preview/mixkit-road-trip-through-a-forest-4820-large.mp4",
        "nature":     "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
        "highway":    "https://assets.mixkit.co/videos/preview/mixkit-car-driving-on-a-highway-4816-large.mp4",
    }
    
    matched = []
    for key, url in MIXKIT_CLIPS.items():
        if key.lower() in keyword.lower() or keyword.lower() in key.lower():
            matched.append({
                "id": f"mixkit_{key}",
                "url": url,
                "duration": 15,
                "source": "mixkit"
            })
    return matched[:2]


def download_video(url: str, video_id: str) -> str | None:
    output_path = os.path.join(DOWNLOAD_DIR, f"{video_id}.mp4")
    if os.path.exists(output_path):
        return output_path
    try:
        resp = requests.get(url, stream=True, timeout=30)
        resp.raise_for_status()
        with open(output_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=1024 * 1024):
                f.write(chunk)
        return output_path
    except Exception:
        return None
