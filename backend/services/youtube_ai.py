from googleapiclient.discovery import build
from config import settings

def fetch_youtube_transcripts(bike_name: str, max_videos: int = 2) -> list[str]:
    """
    Fetch transcripts of top YouTube reviews.
    Uses the youtube-transcript-api for instant, sub-second caption retrieval.
    Strips out slow local Whisper transcription to avoid server lags and CPU bottlenecks.
    """
    if not settings.YOUTUBE_API_KEY:
        return []

    try:
        youtube = build("youtube", "v3", developerKey=settings.YOUTUBE_API_KEY)
        search_response = youtube.search().list(
            q=f"{bike_name} review",
            part="id,snippet",
            maxResults=max_videos,
            type="video",
            videoDuration="medium"
        ).execute()
    except Exception as e:
        print(f"YouTube search error: {e}")
        return []

    transcripts = []
    video_ids = [item["id"]["videoId"] for item in search_response.get("items", [])]

    # Attempt fast API-based transcript retrieval
    api = None
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        api = YouTubeTranscriptApi()
    except ImportError:
        print("youtube-transcript-api not installed, skipping API fetch")

    if api:
        for video_id in video_ids:
            try:
                t_list = api.list(video_id)
                
                # Attempt to find English transcript, or translate another language to English
                try:
                    t = t_list.find_transcript(['en'])
                except Exception:
                    # Attempt translation fallback
                    available = list(t_list._manually_created_transcripts.values()) + list(t_list._generated_transcripts.values())
                    if available:
                        t = available[0].translate('en')
                    else:
                        raise Exception("No transcripts available")

                data = t.fetch()
                text_parts = []
                for x in data[:120]:
                    if hasattr(x, 'text'):
                        text_parts.append(x.text)
                    elif isinstance(x, dict) and 'text' in x:
                        text_parts.append(x['text'])
                
                full_text = " ".join(text_parts).strip()
                if full_text:
                    print(f"[YouTube] Instantly fetched API transcript for video {video_id} ({len(full_text)} chars)")
                    transcripts.append(full_text[:1200])
            except Exception as e:
                print(f"[YouTube] API transcript fetch failed for {video_id}: {e}")

    return transcripts
