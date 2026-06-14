from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
import secrets
from datetime import datetime, timedelta

from database import get_db
from models.story_video import SocialAccount, OAuthState
from auth.google_oauth import get_google_auth_url, exchange_google_code
from auth.facebook_oauth import get_facebook_auth_url, exchange_facebook_code
from auth.token_utils import encrypt_token
from config import settings

router = APIRouter(prefix="/auth", tags=["OAuth"])


@router.get("/google/connect")
async def google_connect(db: Session = Depends(get_db)):
    state = secrets.token_urlsafe(32)
    db.add(OAuthState(state=state, platform="google"))
    db.commit()
    auth_url = get_google_auth_url(state)
    return JSONResponse({"auth_url": auth_url})


@router.get("/google/callback")
async def google_callback(code: str, state: str, db: Session = Depends(get_db)):
    saved_state = db.query(OAuthState).filter_by(state=state).first()
    if not saved_state:
        raise HTTPException(400, "Invalid OAuth state — possible CSRF attack")
    db.delete(saved_state)
    db.commit()

    try:
        token_data = exchange_google_code(code)
    except ValueError as e:
        raise HTTPException(400, str(e))

    existing = db.query(SocialAccount).filter_by(
        platform="youtube", account_id=token_data["account_id"]
    ).first()
    expiry = datetime.utcnow() + timedelta(seconds=token_data["expires_in"])

    if existing:
        existing.access_token = encrypt_token(token_data["access_token"])
        if token_data.get("refresh_token"):
            existing.refresh_token = encrypt_token(token_data["refresh_token"])
        existing.token_expiry = expiry
        existing.is_active = True
    else:
        db.add(SocialAccount(
            platform="youtube",
            account_name=token_data["account_name"],
            account_id=token_data["account_id"],
            access_token=encrypt_token(token_data["access_token"]),
            refresh_token=encrypt_token(token_data["refresh_token"]) if token_data.get("refresh_token") else None,
            token_expiry=expiry,
            is_active=True
        ))
    db.commit()
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/admin/story-video?connected=youtube")


@router.get("/facebook/connect")
async def facebook_connect(db: Session = Depends(get_db)):
    state = secrets.token_urlsafe(32)
    db.add(OAuthState(state=state, platform="facebook"))
    db.commit()
    auth_url = get_facebook_auth_url(state)
    return JSONResponse({"auth_url": auth_url})


@router.get("/facebook/callback")
async def facebook_callback(code: str, state: str, db: Session = Depends(get_db)):
    saved_state = db.query(OAuthState).filter_by(state=state).first()
    if not saved_state:
        raise HTTPException(400, "Invalid OAuth state")
    db.delete(saved_state)
    db.commit()

    try:
        data = exchange_facebook_code(code)
    except ValueError as e:
        raise HTTPException(400, str(e))

    connected = []

    # Save Facebook
    fb = data["facebook"]
    fb_existing = db.query(SocialAccount).filter_by(
        platform="facebook", page_id=fb["page_id"]
    ).first()
    if fb_existing:
        fb_existing.access_token = encrypt_token(fb["access_token"])
        fb_existing.is_active = True
    else:
        db.add(SocialAccount(
            platform="facebook",
            account_name=fb["account_name"],
            account_id=fb["page_id"],
            access_token=encrypt_token(fb["access_token"]),
            page_id=fb["page_id"],
            is_active=True
        ))
    connected.append("facebook")

    # Save Instagram if found
    if data.get("instagram"):
        ig = data["instagram"]
        ig_existing = db.query(SocialAccount).filter_by(
            platform="instagram", page_id=ig["page_id"]
        ).first()
        if ig_existing:
            ig_existing.access_token = encrypt_token(ig["access_token"])
            ig_existing.is_active = True
        else:
            db.add(SocialAccount(
                platform="instagram",
                account_name=ig["account_name"],
                account_id=ig["page_id"],
                access_token=encrypt_token(ig["access_token"]),
                page_id=ig["page_id"],
                is_active=True
            ))
        connected.append("instagram")

    db.commit()
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/admin/story-video?connected={','.join(connected)}"
    )


@router.get("/connections")
async def get_connections(db: Session = Depends(get_db)):
    platforms = ["youtube", "instagram", "facebook"]
    result = {}
    for platform in platforms:
        account = db.query(SocialAccount).filter_by(
            platform=platform, is_active=True
        ).first()
        if account:
            result[platform] = {
                "connected": True,
                "account_name": account.account_name,
                "connected_at": account.connected_at.isoformat(),
                "token_expired": account.token_expiry and
                                 datetime.utcnow() > account.token_expiry
            }
        else:
            result[platform] = {"connected": False}
    return result


@router.delete("/disconnect/{platform}")
async def disconnect_platform(platform: str, db: Session = Depends(get_db)):
    account = db.query(SocialAccount).filter_by(
        platform=platform, is_active=True
    ).first()
    if not account:
        raise HTTPException(404, f"{platform} not connected")
    account.is_active = False
    account.access_token = ""
    account.refresh_token = None
    db.commit()
    return {"status": "disconnected", "platform": platform}
