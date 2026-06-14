import requests
import json
import re
from config import settings

def expand_story(short_story: str, language: str = "en") -> str:
    lang_instruction = {
        "en": "Write in engaging English, storytelling style.",
        "hi": "हिंदी में लिखें, कहानी सुनाने के अंदाज़ में।",
        "both": "Write in Hinglish (mix of Hindi and English), casual storytelling style."
    }.get(language, "Write in English.")

    prompt = f"""
You are a travel storyteller for a motorcycle vlog platform.
Expand this short story into a rich, engaging narrative:

SHORT STORY: {short_story}

INSTRUCTIONS:
- {lang_instruction}
- Make it vivid, emotional, and relatable
- Include sensory details (smell of rain, sound of engine, cold wind)
- Keep the authentic first-person voice
- Length: 400-600 words
- Suitable for video narration (natural speech flow, no markdown)
- No bullet points, just flowing paragraphs

Return ONLY the expanded story text, nothing else.
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
                "temperature": 0.8,
                "max_tokens": 1500
            }
        ).json()
        
        if "error" in resp:
            raise Exception(f"Groq API error: {resp['error'].get('message')}")
            
        return resp["choices"][0]["message"]["content"].strip()
    except Exception as e:
        # Fallback if API fails
        return f"Expanded story fallback: {short_story}. (API request failed: {str(e)})"


def split_story_into_parts(expanded_text: str, duration_secs: int) -> list:
    """Split story into timed parts. ~2.2 words per second of speech."""
    words_per_part = int(duration_secs * 2.2)
    # Split by sentence boundaries (handles Hindi purna viram | and English sentence enders)
    sentences = re.split(r'(?<=[।.!?])\s+', expanded_text)
    parts, current_part, current_count = [], [], 0

    for sentence in sentences:
        word_count = len(sentence.split())
        if current_count + word_count > words_per_part and current_part:
            parts.append(" ".join(current_part))
            current_part = [sentence]
            current_count = word_count
        else:
            current_part.append(sentence)
            current_count += word_count

    if current_part:
        parts.append(" ".join(current_part))
    return parts


def extract_video_keywords(text: str) -> list:
    prompt = f"""
Extract 5-8 visual search keywords (in English) from this travel story for finding matching video footage.
Focus on: locations, scenery, actions, weather, vehicles.
Story: {text[:600]}
Return ONLY a JSON array of keywords, e.g. ["mountain road", "rain riding", "Himalaya", "motorcycle"]
No explanations, no extra characters.
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
                "temperature": 0.3,
                "max_tokens": 200,
                "response_format": {"type": "json_object"} if "response_format" in settings.GROQ_API_KEY else None
            }
        ).json()

        if "error" in resp:
            raise Exception(f"Groq error: {resp['error'].get('message')}")

        content = resp["choices"][0]["message"]["content"].strip()
        # Find JSON array
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(content)
    except Exception:
        # Safe fallback keywords
        return ["motorcycle riding", "nature travel", "mountain highway", "adventure tour", "road trip"]
