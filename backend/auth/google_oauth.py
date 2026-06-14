import requests
from urllib.parse import urlencode
from config import settings

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid", "email"
]

def get_google_auth_url(state: str) -> str:
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(YOUTUBE_SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": state
    }
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


def exchange_google_code(code: str) -> dict:
    resp = requests.post(
        GOOGLE_TOKEN_URL,
        data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }
    ).json()

    if "error" in resp:
        raise ValueError(f"Google OAuth error: {resp.get('error_description', resp['error'])}")

    user_info = requests.get(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {resp['access_token']}"}
    ).json()

    return {
        "access_token": resp["access_token"],
        "refresh_token": resp.get("refresh_token"),
        "expires_in": resp.get("expires_in", 3600),
        "account_name": user_info.get("name", "YouTube Account"),
        "account_id": user_info.get("sub")
    }
