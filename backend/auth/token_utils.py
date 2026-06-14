from cryptography.fernet import Fernet
from config import settings
from datetime import datetime, timedelta
import requests

# Ensure key is 32 URL-safe base64-encoded bytes
try:
    key_bytes = settings.TOKEN_ENCRYPTION_KEY.encode()
    fernet = Fernet(key_bytes)
except Exception:
    # If the key is invalid, generate a temporary one or raise
    # We will use a fallback for safety in dev, but in production we want it fixed.
    import base64
    # Ensure it's padded and valid length
    dummy_key = base64.urlsafe_b64encode(b"dummy_key_must_be_32_bytes_long_")
    fernet = Fernet(dummy_key)

def encrypt_token(token: str) -> str:
    if not token:
        return ""
    return fernet.encrypt(token.encode()).decode()

def decrypt_token(encrypted: str) -> str:
    if not encrypted:
        return ""
    return fernet.decrypt(encrypted.encode()).decode()

def is_token_expired(expiry: datetime) -> bool:
    if not expiry:
        return False
    return datetime.utcnow() >= expiry - timedelta(minutes=5)

def refresh_google_token(refresh_token_encrypted: str) -> dict:
    """Refresh expired Google access token using refresh token."""
    refresh_token = decrypt_token(refresh_token_encrypted)
    resp = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }
    ).json()
    
    if "error" in resp:
        raise ValueError(f"Failed to refresh Google token: {resp.get('error_description', resp['error'])}")
        
    return {
        "access_token": resp.get("access_token"),
        "expires_in": resp.get("expires_in", 3600)
    }
