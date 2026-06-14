from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from auth.token_utils import decrypt_token, refresh_google_token
from datetime import datetime, timedelta
import os

def get_youtube_client(social_account, db=None) -> build:
    """Build a YouTube API client using credentials from database."""
    access_token = decrypt_token(social_account.access_token)
    refresh_token = decrypt_token(social_account.refresh_token) if social_account.refresh_token else None
    
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET")
    )
    
    # Check if we need to refresh the token
    if social_account.token_expiry and datetime.utcnow() >= social_account.token_expiry:
        if refresh_token and db:
            try:
                refresh_data = refresh_google_token(social_account.refresh_token)
                new_access_token = refresh_data["access_token"]
                creds.token = new_access_token
                
                # Update DB
                from auth.token_utils import encrypt_token
                social_account.access_token = encrypt_token(new_access_token)
                social_account.token_expiry = datetime.utcnow() + timedelta(seconds=refresh_data["expires_in"])
                db.commit()
            except Exception as e:
                raise Exception(f"Failed to refresh YouTube access token: {str(e)}")
        else:
            raise Exception("YouTube credentials expired and no refresh token available.")
            
    return build("youtube", "v3", credentials=creds)


def upload_to_youtube(video_path: str, title: str, description: str, 
                      tags: list, privacy_status: str = "public", client=None) -> str:
    """Uploads video file to YouTube and returns the video ID."""
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found at {video_path}")
        
    body = {
        "snippet": {
            "title": title[:100],
            "description": description,
            "tags": tags,
            "categoryId": "22"  # People & Blogs
        },
        "status": {
            "privacyStatus": privacy_status,
            "selfDeclaredMadeForKids": False
        }
    }
    
    media = MediaFileUpload(
        video_path,
        mimetype="video/mp4",
        chunksize=1024*1024,
        resumable=True
    )
    
    request = client.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media
    )
    
    response = None
    while response is None:
        status, response = request.next_chunk()
        
    video_id = response.get("id")
    if not video_id:
        raise Exception(f"YouTube upload failed, empty response: {response}")
        
    return video_id
