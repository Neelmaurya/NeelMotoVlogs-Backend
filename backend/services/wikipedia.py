import requests
import re
from bs4 import BeautifulSoup

# ─── Brand Normalization ──────────────────────────────────────────────────────

BRAND_KEYWORDS = {
    "bajaj": ["dominar", "pulsar", "platina", "avenger", "chetak", "ct110", "ct125"],
    "royal enfield": ["classic", "bullet", "himalayan", "meteor", "hunter", "continental", "interceptor", "scram", "shotgun"],
    "ktm": ["duke", "rc", "adventure"],
    "yamaha": ["r15", "mt15", "fz", "fzs", "aerox", "rayzr", "fascino"],
    "tvs": ["apache", "rtr", "rr 310", "raider", "ronin", "jupiter", "ntorq", "iqube"],
    "honda": ["activa", "shine", "unicorn", "hornet", "hness", "cb350", "dio"],
    "hero": ["splendor", "passion", "glamour", "xtreme", "xpulse", "karizma", "pleasure", "destini"],
    "suzuki": ["hayabusa", "gixxer", "access", "burgman", "v-strom"],
    "kawasaki": ["ninja", "z900", "vulcan", "versys"],
    "bmw": ["g310r", "g310gs", "s1000rr"]
}

def clean_and_normalize_bike_name(bike_name: str) -> str:
    """Normalize bike search names (e.g. 'Dominar 400' -> 'Bajaj Dominar 400')"""
    name_lower = bike_name.lower().strip()
    
    # Check if a brand name is already present at the start
    for brand in BRAND_KEYWORDS.keys():
        if name_lower.startswith(brand):
            return bike_name
            
    # If not, check if any model keyword matches
    for brand, models in BRAND_KEYWORDS.items():
        for model in models:
            if model in name_lower:
                brand_title = brand.title()
                # Special casing for acronym brands
                if brand == "royal enfield":
                    brand_title = "Royal Enfield"
                elif brand in ["ktm", "bmw", "tvs"]:
                    brand_title = brand.upper()
                
                return f"{brand_title} {bike_name}"
                
    return bike_name

def _slugify(text: str) -> str:
    """Convert string to slug format (e.g. 'Dominar 400' -> 'dominar-400')"""
    return re.sub(r'[^a-z0-9]+', '-', text.lower().strip()).strip('-')

# ─── High Resolution Image Helpers ────────────────────────────────────────────

def make_high_res_aepl(url: str) -> str:
    """
    AEPL CDN (BikeWale) dynamically resizes images based on the dimension segment
    in their path (e.g., /100x75/, /664x374/, /0x0/).
    This replaces any dynamic dimension with /1056x594/ for full high-res clarity.
    """
    if "imgd.aeplcdn.com" in url:
        return re.sub(r'/\d+x\d+/', '/1056x594/', url)
    return url

def is_valid_image_url(url: str, bike_name: str, check_filename: bool = False) -> bool:
    """Filters out icons, backgrounds, default placeholders and competitor brand leaks."""
    url_lower = url.lower()

    # DuckDuckGo image proxy URLs are always safe (they point to external content)
    DDG_PREFIXES = (
        "https://external-content.duckduckgo.com/",
        "https://images.duckduckgo.com/",
    )
    if any(url.startswith(prefix) for prefix in DDG_PREFIXES):
        return True

    # Skip UI assets, banners, sprites and icons
    if any(k in url_lower for k in [
        "static", "sprite", "icon", "logo", "bg", "default", "pattern",
        "banner", "loader", "swatch", "avatar", "advertisement", "header", "footer"
    ]):
        return False

    # Build normalized keyword list from the bike name
    clean_name = clean_and_normalize_bike_name(bike_name)
    words = [w for w in _slugify(clean_name).split("-") if w not in [
        "motorcycle", "bike", "new", "standard", "abs", "edition", "bs6", "fi", "dual", "channel"
    ]]

    # For Wikimedia images (Wikipedia), validate the filename against model keywords.
    # The filename is the last path segment, e.g. "Bajaj_Dominar_400_2019.jpg".
    # We check that at least one model keyword (all words after brand) appears in the filename.
    if "upload.wikimedia.org" in url_lower and check_filename and len(words) > 1:
        # Extract filename without extension from the URL path
        path_part = url_lower.split("?")[0]  # strip query params
        filename = path_part.split("/")[-1]   # last segment
        model_words = words[1:]  # skip brand word
        if not any(w in filename for w in model_words):
            return False

    # For BikeWale images, ensure the model keywords (after brand) appear in the URL path
    if "imgd.aeplcdn.com" in url_lower and len(words) > 1:
        model_words = words[1:]
        if not any(w in url_lower for w in model_words):
            return False

    return True

# ─── Brand URL builders ─────────────────────────────────────────────────────────

def scrape_bajaj_images(bike_name: str) -> list:
    """Scrape from bajajauto.com using series/model slug structure."""
    try:
        clean_name = clean_and_normalize_bike_name(bike_name)
        parts = clean_name.strip().split()
        if len(parts) < 2: return []
        
        # Remove brand name "Bajaj"
        rest = parts[1:]
        series = rest[0].lower()
        model = _slugify(" ".join(rest))
        
        url = f"https://www.bajajauto.com/bikes/{series}/{model}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        }
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return []

        soup = BeautifulSoup(resp.text, "html.parser")
        images = []

        # Find picture elements
        for picture in soup.find_all("picture")[:20]:
            for source in picture.find_all("source"):
                srcset = source.get("srcset") or source.get("data-srcset") or ""
                first = srcset.split(",")[0].split(" ")[0].strip()
                if first.startswith("http") and any(first.lower().endswith(e) for e in [".webp", ".jpg", ".jpeg", ".png"]):
                    images.append(first)
                    break
            if not images:
                img = picture.find("img")
                if img:
                    src = img.get("src") or img.get("data-src") or ""
                    if src.startswith("http"):
                        images.append(src)

        # Filter and return unique images
        valid_images = [i for i in dict.fromkeys(images) if is_valid_image_url(i, clean_name)]
        return valid_images[:6]
    except Exception as e:
        print(f"Bajaj scrape error: {e}")
        return []

def scrape_royal_enfield_images(bike_name: str) -> list:
    try:
        clean_name = clean_and_normalize_bike_name(bike_name)
        model_part = clean_name.lower().replace("royal enfield", "").strip()
        model = _slugify(model_part)
        
        url = f"https://www.royalenfield.com/in/en/motorcycles/{model}/"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return []
            
        soup = BeautifulSoup(resp.text, "html.parser")
        images = []
        for img in soup.find_all("img", src=True)[:30]:
            src = img["src"]
            if any(src.lower().endswith(e) for e in [".jpg", ".jpeg", ".png", ".webp"]) and any(k in src.lower() for k in ["royal", "enfield", "cdn", "media", "content"]):
                full_url = src if src.startswith("http") else f"https://www.royalenfield.com{src}"
                images.append(full_url)
                
        valid_images = [i for i in dict.fromkeys(images) if is_valid_image_url(i, clean_name)]
        return valid_images[:6]
    except Exception as e:
        print(f"Royal Enfield scrape error: {e}")
        return []

def scrape_ktm_images(bike_name: str) -> list:
    try:
        clean_name = clean_and_normalize_bike_name(bike_name)
        model_part = clean_name.lower().replace("ktm", "").strip()
        model = _slugify(model_part)
        
        url = f"https://www.ktmindia.com/{model}/"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return []
            
        soup = BeautifulSoup(resp.text, "html.parser")
        images = []
        for img in soup.find_all("img")[:30]:
            src = img.get("src") or img.get("data-src") or ""
            if src.startswith("http") and any(src.lower().endswith(e) for e in [".jpg", ".jpeg", ".png", ".webp"]):
                images.append(src)
                
        valid_images = [i for i in dict.fromkeys(images) if is_valid_image_url(i, clean_name)]
        return valid_images[:6]
    except Exception as e:
        print(f"KTM scrape error: {e}")
        return []

def scrape_yamaha_images(bike_name: str) -> list:
    try:
        clean_name = clean_and_normalize_bike_name(bike_name)
        model_part = clean_name.lower().replace("yamaha", "").strip()
        model = _slugify(model_part)
        
        url = f"https://india.yamaha.com/motorcycles/{model}/index.html"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return []
            
        soup = BeautifulSoup(resp.text, "html.parser")
        images = []
        for img in soup.find_all("img")[:30]:
            src = img.get("src") or img.get("data-src") or ""
            if src and any(src.lower().endswith(e) for e in [".jpg", ".jpeg", ".png", ".webp"]):
                full_url = src if src.startswith("http") else f"https://india.yamaha.com{src}"
                images.append(full_url)
                
        valid_images = [i for i in dict.fromkeys(images) if is_valid_image_url(i, clean_name)]
        return valid_images[:6]
    except Exception as e:
        print(f"Yamaha scrape error: {e}")
        return []

def scrape_tvs_images(bike_name: str) -> list:
    try:
        clean_name = clean_and_normalize_bike_name(bike_name)
        model_part = clean_name.lower().replace("tvs", "").strip()
        model = _slugify(model_part)
        
        url = f"https://www.tvsmotor.com/bikes/{model}/"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return []
            
        soup = BeautifulSoup(resp.text, "html.parser")
        images = []
        for img in soup.find_all("img")[:30]:
            src = img.get("src") or img.get("data-src") or ""
            if src and any(src.lower().endswith(e) for e in [".jpg", ".jpeg", ".png", ".webp"]):
                full_url = src if src.startswith("http") else f"https://www.tvsmotor.com{src}"
                images.append(full_url)
                
        valid_images = [i for i in dict.fromkeys(images) if is_valid_image_url(i, clean_name)]
        return valid_images[:6]
    except Exception as e:
        print(f"TVS scrape error: {e}")
        return []

def get_bikewale_brand_and_model(bike_name: str) -> tuple[str, str]:
    """Helper to cleanly divide multi-word brands and models for BikeWale URLs."""
    lower = bike_name.lower().strip()
    
    special_brands = {
        "royal enfield": "royalenfield",
        "harley davidson": "harleydavidson",
        "hero honda": "herohonda",
        "moto guzzi": "motoguzzi",
        "bmw": "bmw",
        "ktm": "ktm",
        "honda": "honda",
        "yamaha": "yamaha",
        "suzuki": "suzuki",
        "kawasaki": "kawasaki",
        "ducati": "ducati",
        "benelli": "benelli",
        "jawa": "jawa",
        "yezdi": "yezdi",
        "hero": "hero",
        "tvs": "tvs",
        "bajaj": "bajaj"
    }
    
    for brand_key, slug in special_brands.items():
        if lower.startswith(brand_key):
            model_part = lower[len(brand_key):].strip()
            return slug, _slugify(model_part)
            
    # Default fallback: split by first word
    parts = bike_name.split()
    brand = _slugify(parts[0])
    model = _slugify(" ".join(parts[1:])) if len(parts) > 1 else ""
    return brand, model

def scrape_bikewale_images(bike_name: str) -> list:
    """Scrape bike images from BikeWale CDN (free)."""
    try:
        clean_name = clean_and_normalize_bike_name(bike_name)
        brand_slug, model_slug = get_bikewale_brand_and_model(clean_name)
        
        url = f"https://www.bikewale.com/{brand_slug}-bikes/{model_slug}/"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return []
            
        # Verify the final URL isn't a generic brand redirect page (e.g. redirecting /invalid/ to /ktm-bikes/)
        final_url_lower = resp.url.lower()
        model_words = [w for w in model_slug.split("-") if w not in ["bikes", "motorcycles"]]
        if model_words and not any(w in final_url_lower for w in model_words):
            print(f"[BikeWale] Discarding redirect to generic landing page: {resp.url}")
            return []
            
        # Extract AEPL CDN image links
        images = re.findall(r'https://imgd\.aeplcdn\.com/\S+?\.(?:jpg|jpeg|png)', resp.text)
        
        # Filter and upgrade all matched images to High-Res (1056x594)
        cleaned = []
        for img in images:
            if is_valid_image_url(img, clean_name):
                high_res = make_high_res_aepl(img)
                if high_res not in cleaned:
                    cleaned.append(high_res)
                    
        return cleaned[:6]
    except Exception as e:
        print(f"BikeWale scrape error: {e}")
        return []

# Brand dispatch map
BRAND_MAP = {
    "bajaj": scrape_bajaj_images,
    "royal enfield": scrape_royal_enfield_images,
    "ktm": scrape_ktm_images,
    "yamaha": scrape_yamaha_images,
    "tvs": scrape_tvs_images,
}

def detect_brand(bike_name: str) -> str:
    lower = bike_name.lower()
    for brand in BRAND_MAP:
        if lower.startswith(brand):
            return brand
    return ""

# ─── DuckDuckGo fallback ──────────────────────────────────────────────────────

def fetch_duckduckgo_images(bike_name: str) -> list:
    """Fallback image search using DuckDuckGo (no API key needed)."""
    try:
        clean_name = clean_and_normalize_bike_name(bike_name)
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        q = clean_name.replace(' ', '+')
        resp = requests.get(
            f"https://duckduckgo.com/?q={q}+motorcycle+official+studio&iax=images&ia=images",
            headers=headers, timeout=10
        )
        vqd = re.search(r'vqd=[\'\"]([\d-]+)[\'\"]', resp.text)
        if not vqd: return []

        img_resp_raw = requests.get(
            f"https://duckduckgo.com/i.js?q={q}+official+motorcycle&vqd={vqd.group(1)}&f=,,,,,,",
            headers=headers, timeout=10
        )
        if img_resp_raw.status_code != 200:
            return []
            
        try:
            img_resp = img_resp_raw.json()
        except Exception:
            return []

        images = []
        for r in img_resp.get("results", [])[:10]:
            img = r.get("image", "")
            if img and is_valid_image_url(img, clean_name):
                images.append(img)
                
        return images[:6]
    except Exception as e:
        print(f"DuckDuckGo error: {e}")
        return []

# ─── Wikipedia description + REST image fetcher ─────────────────────────

def fetch_wikipedia_description(bike_name: str) -> str:
    """Fetch description snippet from Wikipedia."""
    search_url = "https://en.wikipedia.org/w/api.php"
    headers = {"User-Agent": "NeelMotoVlogs/1.0 (admin@neelmotovlogs.com)"}
    try:
        clean_name = clean_and_normalize_bike_name(bike_name)
        search_resp = requests.get(search_url, params={
            "action": "query", "list": "search",
            "srsearch": f"{clean_name} motorcycle", "format": "json", "srlimit": 1
        }, headers=headers, timeout=8).json()

        results = search_resp.get("query", {}).get("search", [])
        if not results: return ""

        page_title = results[0]["title"]
        page_resp = requests.get(search_url, params={
            "action": "query", "titles": page_title,
            "prop": "extracts", "exintro": True, "format": "json"
        }, headers=headers, timeout=8).json()

        pages = page_resp["query"]["pages"]
        page = next(iter(pages.values()))
        return page.get("extract", "")[:600]
    except Exception:
        return ""


_WIKI_SKIP_KEYWORDS = [
    "flag", "icon", "logo", "symbol", "map", "coat", "arrow",
    "commons", "seal", "emblem", "blank", "template", "question",
    "locator", "disambiguation", "edit", "wikidata",
]

def fetch_wikipedia_images_rest(bike_name: str) -> list:
    """
    Uses the Wikipedia REST v1 media-list API to extract article images for any
    bike — works even when brand-specific scrapers and BikeWale return nothing.
    Images come from upload.wikimedia.org which is already in the proxy allowlist.
    """
    headers = {"User-Agent": "NeelMotoVlogs/1.0 (admin@neelmotovlogs.com)"}
    try:
        clean_name = clean_and_normalize_bike_name(bike_name)

        # Build model keyword list for page-title validation (words after the brand)
        name_words = [w for w in _slugify(clean_name).split("-") if w not in [
            "motorcycle", "bike", "new", "standard", "abs", "edition", "bs6", "fi", "dual", "channel"
        ]]
        model_keywords = name_words[1:] if len(name_words) > 1 else name_words  # skip brand word

        # 1. Find the best-matching Wikipedia page title
        search_resp = requests.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query", "list": "search",
                "srsearch": f"{clean_name} motorcycle",
                "format": "json", "srlimit": 5,
            },
            headers=headers, timeout=8
        ).json()

        results = search_resp.get("query", {}).get("search", [])
        if not results:
            return []

        # Pick the first result whose title contains at least one model keyword.
        # This avoids landing on a generic brand article (e.g. "Bajaj Auto").
        page_title = None
        for result in results:
            title_lower = result["title"].lower()
            if any(kw in title_lower for kw in model_keywords):
                page_title = result["title"]
                break

        # Fallback: use the top result even if title doesn't match (better than nothing)
        if not page_title:
            page_title = results[0]["title"]
            print(f"[WikiREST] No exact title match — using top result: '{page_title}'")
        else:
            print(f"[WikiREST] Matched page: '{page_title}' for '{clean_name}'")

        # 2. Fetch the media list for that page
        encoded_title = requests.utils.quote(page_title, safe="")
        media_resp = requests.get(
            f"https://en.wikipedia.org/api/rest_v1/page/media-list/{encoded_title}",
            headers=headers, timeout=12
        )
        if media_resp.status_code != 200:
            print(f"[WikiREST] media-list returned {media_resp.status_code}")
            return []

        media_data = media_resp.json()
        images = []

        for item in media_data.get("items", []):
            if item.get("type") != "image":
                continue

            # Skip diagrams, icons, flags etc.
            item_title = item.get("title", "").lower()
            if any(k in item_title for k in _WIKI_SKIP_KEYWORDS):
                continue

            # Prefer the highest resolution from srcset, fall back to original
            src = ""
            srcset = item.get("srcset", [])
            if srcset:
                try:
                    best = max(
                        srcset,
                        key=lambda x: float(str(x.get("scale", "1")).replace("x", ""))
                    )
                    src = best.get("src", "")
                except Exception:
                    src = srcset[0].get("src", "")

            if not src:
                src = item.get("original", {}).get("source", "")

            if not src:
                continue

            # Ensure absolute URL
            if src.startswith("//"):
                src = "https:" + src

            # Only accept raster image formats
            src_lower = src.lower()
            if not any(src_lower.endswith(e) or f".{e}?" in src_lower
                       for e in ["jpg", "jpeg", "png", "webp"]):
                continue

            # Validate the image filename against model keywords to reject unrelated
            # bike photos that may appear in a multi-model brand article.
            if not is_valid_image_url(src, clean_name, check_filename=True):
                print(f"[WikiREST] Skipped irrelevant image: {src.split('/')[-1]}")
                continue

            if src not in images:
                images.append(src)
            if len(images) >= 6:
                break

        print(f"[WikiREST] Found {len(images)} images for '{clean_name}'")
        return images
    except Exception as e:
        print(f"[WikiREST] Error: {e}")
        return []

# ─── Master entry point ────────────────────────────────────────────────────────

def fetch_wikipedia_data(bike_name: str) -> dict:
    """
    Multi-source image fetcher priority:
    1. Official manufacturer website (brand-aware)
    2. BikeWale CDN scraper (strictly formatted and verified)
    3. DuckDuckGo image search
    Wikipedia is used only for the description text.
    """
    # Auto-normalize search term first
    normalized_name = clean_and_normalize_bike_name(bike_name)
    print(f"Normalized bike search query: '{bike_name}' -> '{normalized_name}'")
    
    images = []

    # Step 1: Official brand website (brand-aware)
    brand = detect_brand(normalized_name)
    if brand and brand in BRAND_MAP:
        print(f"Scraping official site for brand: {brand}")
        images = BRAND_MAP[brand](normalized_name)
        print(f"Official site returned {len(images)} images")

    # Step 2: BikeWale CDN fallback
    if len(images) < 3:
        bw_images = scrape_bikewale_images(normalized_name)
        print(f"BikeWale returned {len(bw_images)} images")
        for img in bw_images:
            if img not in images:
                images.append(img)

    # Step 3: Wikipedia REST API — works for any bike, no brand scraper needed
    if len(images) < 3:
        wiki_images = fetch_wikipedia_images_rest(normalized_name)
        print(f"Wikipedia REST returned {len(wiki_images)} images")
        for img in wiki_images:
            if img not in images:
                images.append(img)

    # Step 4: DuckDuckGo last-resort fallback
    if len(images) < 3:
        ddg = fetch_duckduckgo_images(normalized_name)
        print(f"DuckDuckGo returned {len(ddg)} images")
        for img in ddg:
            if img not in images:
                images.append(img)

    # Filter and deduplicate — accept .jpg/.jpeg/.png/.webp (with or without query string)
    final = []
    for img in images:
        img_lower = img.lower().split("?")[0]  # strip query params before checking extension
        if img and any(img_lower.endswith(e) for e in [".jpg", ".jpeg", ".png", ".webp"]):
            if img not in final:
                final.append(img)

    # Step 5: Get Wikipedia description (reuses the same search we already did)
    description = fetch_wikipedia_description(normalized_name)

    print(f"Final validated images for '{normalized_name}': {len(final)}")
    return {
        "images": final[:8],
        "description": description or "Specifications and details compiled from multiple automotive databases."
    }
