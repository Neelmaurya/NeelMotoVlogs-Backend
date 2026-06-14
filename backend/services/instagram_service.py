import requests
import time
from auth.token_utils import decrypt_token

def upload_to_instagram(video_public_url: str, caption: str,
                        social_account) -> str:
    """Uploads a Reel to Instagram Business Account via Graph API."""
    access_token = decrypt_token(social_account.access_token)
    ig_user_id = social_account.page_id  # In our DB, we store the Instagram User ID in page_id for instagram account

    if not ig_user_id:
        raise ValueError("Instagram Account ID (page_id) is missing.")

    # Step 1: Create media container for Reels
    container_url = f"https://graph.facebook.com/v18.0/{ig_user_id}/media"
    payload = {
        "media_type": "REELS",
        "video_url": video_public_url,
        "caption": caption,
        "share_to_feed": "true",
        "access_token": access_token
    }
    
    resp = requests.post(container_url, data=payload).json()
    if "error" in resp:
        raise Exception(f"Instagram media container creation failed: {resp['error'].get('message')}")
        
    container_id = resp["id"]

    # Step 2: Poll container status
    status_url = f"https://graph.facebook.com/v18.0/{container_id}"
    params = {
        "fields": "status_code",
        "access_token": access_token
    }
    
    # Wait up to 5 minutes for processing
    for _ in range(30):
        status_resp = requests.get(status_url, params=params).json()
        if "error" in status_resp:
            raise Exception(f"Failed to check Instagram container status: {status_resp['error'].get('message')}")
            
        status_code = status_resp.get("status_code")
        if status_code == "FINISHED":
            break
        elif status_code == "ERROR":
            raise Exception("Instagram container processing failed with status code ERROR.")
            
        time.sleep(10)
    else:
        raise TimeoutError("Instagram container processing timed out.")

    # Step 3: Publish container
    publish_url = f"https://graph.facebook.com/v18.0/{ig_user_id}/media_publish"
    publish_payload = {
        "creation_id": container_id,
        "access_token": access_token
    }
    
    publish_resp = requests.post(publish_url, data=publish_payload).json()
    if "error" in publish_resp:
        raise Exception(f"Instagram publishing failed: {publish_resp['error'].get('message')}")
        
    return publish_resp.get("id")


def upload_to_facebook(video_public_url: str, caption: str,
                       social_account) -> str:
    """Uploads a video to Facebook Page via Graph API."""
    access_token = decrypt_token(social_account.access_token)
    page_id = social_account.page_id

    if not page_id:
        raise ValueError("Facebook Page ID (page_id) is missing.")

    # Facebook supports uploading via URL directly
    fb_url = f"https://graph.facebook.com/v18.0/{page_id}/videos"
    payload = {
        "file_url": video_public_url,
        "description": caption,
        "access_token": access_token
    }
    
    resp = requests.post(fb_url, data=payload).json()
    if "error" in resp:
        raise Exception(f"Facebook video upload failed: {resp['error'].get('message')}")
        
    return resp.get("id")
