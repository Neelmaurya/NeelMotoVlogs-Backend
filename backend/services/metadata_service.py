import requests
import json
import re
from config import settings

def generate_social_metadata(story_text: str, platform: str) -> dict:
    """Generate optimized titles, descriptions and hashtags for social media uploads."""
    prompt = f"""
Generate social media upload metadata for this travel story segment:
"{story_text[:500]}"

Generate metadata tailored for: {platform} (youtube, instagram, or facebook).

Follow these rules:
- YouTube: Needs a catchy, clicky title (under 70 chars) and an engaging, descriptive paragraph description with 3-5 tags.
- Instagram: Needs a short description focusing on emojis, travel aesthetics, and 10-15 trending travel/moto vlogging hashtags.
- Facebook: Needs a conversational caption sharing a travel tip or asking a question to encourage comments, with 3-5 hashtags.

Respond ONLY with a valid JSON object. Do not include markdown formatting or extra text.
{{
    "title": "Title here (or empty for Instagram/Facebook if not applicable)",
    "description": "Caption / description text here",
    "tags": ["tag1", "tag2", "tag3"]
}}
"""
    try:
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.6,
                "max_tokens": 500,
                "response_format": {"type": "json_object"}
            }
        ).json()

        if "error" in resp:
            raise Exception(f"Groq API error: {resp['error'].get('message')}")

        content = resp["choices"][0]["message"]["content"].strip()
        return json.loads(content)
    except Exception:
        # Fallback values
        return {
            "title": "Adventures on the Road | Neel MotoVlogs",
            "description": f"Exploring new horizons and living life on two wheels. {story_text[:150]}...",
            "tags": ["motovlog", "travel", "motorcycle", "adventure"]
        }
