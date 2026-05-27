from fastapi import APIRouter, Response, HTTPException
from fastapi.responses import StreamingResponse
import requests
import io
from urllib.parse import urlparse

router = APIRouter(prefix="/image-proxy", tags=["Image Proxy"])

# Allowed CDN hostnames to prevent SSRF abuse.
# Covers: BikeWale/BikeDekho CDNs, all official manufacturer sites
# scraped by wikipedia.py, and common image CDNs from DuckDuckGo fallback.
ALLOWED_HOSTS = {
    # BikeWale / BikeDekho
    "imgd.aeplcdn.com",
    "imgd1.aeplcdn.com",
    "imgd2.aeplcdn.com",
    "www.bikewale.com",
    "cdn.bikedekho.com",
    "img.bikedekho.com",
    # Bajaj
    "www.bajajauto.com",
    "cdn.bajajauto.com",
    "bajajauto-assets.s3.ap-south-1.amazonaws.com",
    # Royal Enfield
    "www.royalenfield.com",
    "cdn.royalenfield.com",
    "media.royalenfield.com",
    # KTM
    "www.ktmindia.com",
    "cdn.ktmindia.com",
    # Yamaha
    "india.yamaha.com",
    "cdn.yamaha-motor.co.in",
    "www.yamaha-motor.co.in",
    # TVS
    "www.tvsmotor.com",
    "cdn.tvsmotor.com",
    "staticimg.tvsmotor.com",
    # Honda
    "www.honda2wheelersindia.com",
    "cdn.honda2wheelersindia.com",
    # Hero
    "www.heromotocorp.com",
    "cdn.heromotocorp.com",
    # Suzuki
    "www.suzukimotorcycle.co.in",
    "cdn.suzukimotorcycle.co.in",
    # Kawasaki
    "www.kawasakimotorcycle.co.in",
    "kawasakimotorcycle.co.in",
    # Generic Wikipedia / Wikimedia (used as last resort)
    "upload.wikimedia.org",
    "commons.wikimedia.org",
    # DuckDuckGo image proxy & common CDNs returned from DDG results
    "external-content.duckduckgo.com",
    "images.duckduckgo.com",
    "i.imgur.com",
    "images.91wheels.com",
    "stat.overdrive.in",
    "cdni.autocarindia.com",
    "akm-img-a-in.tosshub.com",
}

# Allowed hostname suffixes — any subdomain of these domains is trusted
ALLOWED_SUFFIXES = (
    ".bajajauto.com",
    ".royalenfield.com",
    ".ktmindia.com",
    ".yamaha-motor.co.in",
    ".tvsmotor.com",
    ".honda2wheelersindia.com",
    ".heromotocorp.com",
    ".suzukimotorcycle.co.in",
    ".kawasakimotorcycle.co.in",
    ".aeplcdn.com",
    ".bikedekho.com",
    ".bikewale.com",
    ".wikimedia.org",
    ".duckduckgo.com",
)

def _is_allowed(hostname: str) -> bool:
    if not hostname:
        return False
    if hostname in ALLOWED_HOSTS:
        return True
    return any(hostname.endswith(suffix) for suffix in ALLOWED_SUFFIXES)

# Referer map: pick the best Referer per CDN so hotlink protection is bypassed
def _get_referer(hostname: str) -> str:
    mapping = {
        "royalenfield": "https://www.royalenfield.com/",
        "bajajauto":    "https://www.bajajauto.com/",
        "ktm":          "https://www.ktmindia.com/",
        "yamaha":       "https://india.yamaha.com/",
        "tvsmotor":     "https://www.tvsmotor.com/",
        "honda2":       "https://www.honda2wheelersindia.com/",
        "heromotocorp": "https://www.heromotocorp.com/",
        "suzuki":       "https://www.suzukimotorcycle.co.in/",
        "kawasaki":     "https://www.kawasakimotorcycle.co.in/",
    }
    for key, referer in mapping.items():
        if key in hostname:
            return referer
    return "https://www.bikewale.com/"


@router.get("/")
async def proxy_image(url: str):
    """
    Fetches an external CDN image server-side and streams it back to the browser.
    Bypasses hotlink protection by attaching the correct site-specific Referer header.
    Supports all manufacturer CDNs scraped by wikipedia.py plus BikeWale/DuckDuckGo fallback.
    """
    parsed = urlparse(url)
    hostname = parsed.hostname or ""

    if not _is_allowed(hostname):
        raise HTTPException(
            status_code=403,
            detail=f"Host '{hostname}' is not allowed for proxying."
        )

    proxy_headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Referer": _get_referer(hostname),
        "Accept": "image/jpeg,image/png,image/webp,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        # No Accept-Encoding — forces CDN to return raw bytes (avoids Content-Encoding mismatch)
        "Connection": "keep-alive",
    }

    try:
        resp = requests.get(url, headers=proxy_headers, timeout=15, stream=True)
        if resp.status_code != 200:
            raise HTTPException(
                status_code=resp.status_code,
                detail=f"CDN returned non-200 status ({resp.status_code}) for host '{hostname}'."
            )

        content_type = resp.headers.get("Content-Type", "image/jpeg")
        return StreamingResponse(
            io.BytesIO(resp.content),
            media_type=content_type,
            headers={
                "Cache-Control": "public, max-age=86400",  # Cache for 24 h in the browser
                "Access-Control-Allow-Origin": "*",
            }
        )
    except requests.Timeout:
        raise HTTPException(status_code=504, detail="CDN image request timed out.")
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch image: {str(e)}")
