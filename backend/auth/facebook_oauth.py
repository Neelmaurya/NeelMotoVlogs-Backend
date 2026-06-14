import requests
from urllib.parse import urlencode
from config import settings

FACEBOOK_AUTH_URL = "https://www.facebook.com/v18.0/dialog/oauth"
FACEBOOK_TOKEN_URL = "https://graph.facebook.com/v18.0/oauth/access_token"

FACEBOOK_SCOPES = [
    "pages_manage_posts",
    "pages_read_engagement",
    "instagram_basic",
    "instagram_content_publish",
    "public_profile"
]

def get_facebook_auth_url(state: str) -> str:
    params = {
        "client_id": settings.FACEBOOK_APP_ID,
        "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
        "scope": ",".join(FACEBOOK_SCOPES),
        "state": state,
        "response_type": "code"
    }
    return f"{FACEBOOK_AUTH_URL}?{urlencode(params)}"


def exchange_facebook_code(code: str) -> dict:
    # Step 1: Get short-lived user token
    token_resp = requests.get(
        FACEBOOK_TOKEN_URL,
        params={
            "client_id": settings.FACEBOOK_APP_ID,
            "client_secret": settings.FACEBOOK_APP_SECRET,
            "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
            "code": code
        }
    ).json()

    user_token = token_resp.get("access_token")
    if not user_token:
        raise ValueError(f"Facebook token error: {token_resp}")

    # Step 2: Exchange for long-lived token (60 days)
    ll_resp = requests.get(
        "https://graph.facebook.com/v18.0/oauth/access_token",
        params={
            "grant_type": "fb_exchange_token",
            "client_id": settings.FACEBOOK_APP_ID,
            "client_secret": settings.FACEBOOK_APP_SECRET,
            "fb_exchange_token": user_token
        }
    ).json()
    long_lived_token = ll_resp.get("access_token", user_token)

    # Step 3: Get Facebook Pages
    pages_resp = requests.get(
        "https://graph.facebook.com/v18.0/me/accounts",
        params={"access_token": long_lived_token}
    ).json()

    pages = pages_resp.get("data", [])
    facebook_page = pages[0] if pages else {}
    page_token = facebook_page.get("access_token", long_lived_token)
    page_id = facebook_page.get("id", "")
    page_name = facebook_page.get("name", "Facebook Page")

    # Step 4: Get Instagram Business Account linked to this Page
    ig_resp = requests.get(
        f"https://graph.facebook.com/v18.0/{page_id}",
        params={
            "fields": "instagram_business_account",
            "access_token": page_token
        }
    ).json()
    ig_account_id = ig_resp.get("instagram_business_account", {}).get("id", "")

    return {
        "facebook": {
            "access_token": page_token,
            "page_id": page_id,
            "account_name": page_name
        },
        "instagram": {
            "access_token": page_token,
            "page_id": ig_account_id,
            "account_name": f"IG linked to {page_name}"
        } if ig_account_id else None
    }
