import requests
import json
import re
from config import settings

def clean_json_string(s):
    """Clean common JSON breakage from AI responses."""
    s = s.strip()
    # Extract only the JSON object boundaries to cut off markdown formatting or introductory text
    first_brace = s.find('{')
    last_brace = s.rfind('}')
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        s = s[first_brace:last_brace+1]
        
    # Remove non-printable control characters except newline/tab
    s = "".join(char for char in s if ord(char) >= 32 or char in "\n\t")
    return s.strip()

def generate_bike_review(bike_name, wikipedia_data, reddit_data, youtube_transcripts) -> dict:
    if not settings.GROQ_API_KEY:
        return {"error": "GROQ_API_KEY is missing."}

    reddit_posts = reddit_data.get("reddit_posts", [])
    reddit_text = "\n".join([f"- {p['title']}: {p['text']}" for p in reddit_posts[:5]])
    youtube_text = "\n".join(youtube_transcripts[:3]) if youtube_transcripts else ""
    wiki_desc = wikipedia_data.get("description", "")

    # Extract short owner quotes from Reddit for the UI highlights section
    reddit_highlights = [p["title"] for p in reddit_posts[:4] if p.get("title")]

    prompt = f"""
You are an expert motorcycle reviewer for an Indian MotoVlogs platform.
Generate a MASTER-LEVEL structured bike review for: {bike_name}
Match the data density of sites like BikeDekho and BikeWale.

DATA SOURCES:
WIKIPEDIA: {wiki_desc[:600] or 'Not available'}
REDDIT: {reddit_text or 'Not available'}
YOUTUBE: {youtube_text[:800] or 'Not available'}

Respond ONLY with a valid JSON object. No extra text, no markdown.
IMPORTANT: Do NOT use raw newlines inside JSON string values. Use \\n if needed.
IMPORTANT: Use single quotes (') instead of double quotes (") for quoting any text inside string values to prevent JSON corruption.

{{
    "bike_name": "{bike_name}",
    "tagline": "One line catchy tagline for the bike",
    "price_range": "₹X.XX - X.XX Lakh (ex-showroom)",
    "overall_rating": 4.2,
    "mileage_arai": "XX kmpl",
    "mileage_owner": "XX-XX kmpl (real world)",
    "colors": ["Color Name 1", "Color Name 2", "Color Name 3"],
    "variants": [
        {{"name": "Standard", "price": "₹X.XX Lakh", "key_features": ["ABS", "LED Lights"]}}
    ],
    "specs": {{
        "power_performance": {{
            "displacement": "XXX cc",
            "engine_type": "Single cylinder, liquid cooled",
            "max_power": "XX bhp @ XXXX rpm",
            "max_torque": "XX Nm @ XXXX rpm",
            "top_speed": "~XXX kmph",
            "acceleration_0_100": "~X.X seconds",
            "transmission": "6-speed manual",
            "clutch": "Slipper & Assist"
        }},
        "brakes": {{
            "front_brake": "300mm disc",
            "rear_brake": "230mm disc",
            "abs": "Dual Channel"
        }},
        "suspension": {{
            "front": "USD forks, XXmm travel",
            "rear": "Monoshock, XXmm travel"
        }},
        "tyres_wheels": {{
            "tyre_type": "Tubeless",
            "wheel_type": "Alloy",
            "front_tyre": "110/70-R17",
            "rear_tyre": "150/60-R17"
        }},
        "electricals": {{
            "headlight": "LED",
            "tail_light": "LED",
            "instrument_console": "Full Digital TFT",
            "bluetooth": "Yes / No",
            "usb_charging": "Yes / No"
        }},
        "dimensions": {{
            "length": "XXXX mm",
            "width": "XXX mm",
            "height": "XXXX mm",
            "wheelbase": "XXXX mm",
            "kerb_weight": "XXX kg",
            "seat_height": "XXX mm",
            "ground_clearance": "XXX mm",
            "fuel_capacity": "XX litres"
        }}
    }},
    "riding_experience": {{
        "city_riding": "3-4 sentences about city riding comfort and maneuverability.",
        "highway_performance": "3-4 sentences about highway cruising and stability.",
        "touring_comfort": "3-4 sentences about long distance touring capability.",
        "handling": "2-3 sentences about handling, cornering, and agility."
    }},
    "expert_review": "Comprehensive 4-5 paragraph expert analysis covering engine character, comfort, features, value for money, and who should buy it.",
    "pros": ["Pro 1", "Pro 2", "Pro 3", "Pro 4", "Pro 5"],
    "cons": ["Con 1", "Con 2", "Con 3"],
    "performance_scores": {{
        "engine_performance": 9,
        "ride_comfort": 8,
        "value_for_money": 9,
        "build_quality": 8,
        "features": 8,
        "styling": 9
    }},
    "rivals": [
        {{"name": "Rival Bike 1", "price": "₹X.XX Lakh", "why_choose": "One line reason to choose this over the subject bike"}},
        {{"name": "Rival Bike 2", "price": "₹X.XX Lakh", "why_choose": "One line reason"}},
        {{"name": "Rival Bike 3", "price": "₹X.XX Lakh", "why_choose": "One line reason"}}
    ],
    "faqs": [
        {{"q": "What is the mileage of {bike_name}?", "a": "Detailed answer..."}},
        {{"q": "Is {bike_name} good for long touring?", "a": "Detailed answer..."}},
        {{"q": "What are the main competitors of {bike_name}?", "a": "Detailed answer..."}},
        {{"q": "Does {bike_name} have ABS?", "a": "Detailed answer..."}}
    ],
    "verdict": "Final 3-4 sentence verdict with a clear buy recommendation.",
    "who_should_buy": "One sentence describing the ideal buyer persona."
}}
"""

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.45,
                "max_tokens": 4000,
                "response_format": {"type": "json_object"}
            }
        )

        resp_json = response.json()
        if "error" in resp_json:
            return {"error": resp_json["error"].get("message")}

        raw_content = resp_json["choices"][0]["message"]["content"].strip()
        cleaned_content = clean_json_string(raw_content)

        result = json.loads(cleaned_content, strict=False)
        # Inject reddit highlights for the "What Real Owners Say" section
        result["reddit_highlights"] = reddit_highlights
        return result

    except Exception as e:
        return {"error": f"JSON Parsing Error: {str(e)}"}
