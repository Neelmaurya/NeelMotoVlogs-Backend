import requests
from config import settings

def fetch_reddit_opinions(bike_name: str) -> dict:
    if not settings.REDDIT_CLIENT_ID or not settings.REDDIT_CLIENT_SECRET:
        return {"reddit_posts": []}

    headers = {"User-Agent": "NeelMotoVlogs/1.0 (https://neelmotovlogs.com; admin@neelmotovlogs.com)"}
    
    try:
        # Get access token
        auth = requests.auth.HTTPBasicAuth(settings.REDDIT_CLIENT_ID, settings.REDDIT_CLIENT_SECRET)
        token_resp = requests.post(
            "https://www.reddit.com/api/v1/access_token",
            auth=auth,
            data={"grant_type": "client_credentials"},
            headers=headers
        ).json()
        
        token = token_resp.get("access_token", "")
        if not token:
            print("Reddit Auth Error: Could not get access token")
            return {"reddit_posts": []}
            
        headers["Authorization"] = f"bearer {token}"
        
        # Search subreddits
        subreddits = "motorcycles+indianmotorcycles+royalenfield+KTMDuke+biking"
        results = requests.get(
            f"https://oauth.reddit.com/r/{subreddits}/search",
            headers=headers,
            params={"q": bike_name, "sort": "relevance", "limit": 10, "t": "year"}
        ).json()
        
        posts = []
        if "data" in results:
            for post in results.get("data", {}).get("children", [])[:5]:
                d = post["data"]
                posts.append({
                    "title": d.get("title", ""),
                    "text": d.get("selftext", "")[:300],
                    "score": d.get("score", 0),
                    "subreddit": d.get("subreddit", "")
                })
        
        return {"reddit_posts": posts}
    except Exception as e:
        print(f"Reddit Fetch Error: {e}")
        return {"reddit_posts": []}
