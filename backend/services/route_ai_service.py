import requests
import json
from config import settings
from services.groq_ai import clean_json_string

def generate_route_plan(
    source: str,
    destination: str,
    transport_mode: str,
    route_data: dict,
    weather_stops: list,
    live_weather: dict,
    fuel_stops: list,
    hotels: list,
    tourist_spots_dest: list,
    places_en_route: list,
    user_preferences: dict = {}
) -> dict:
    """
    Generate comprehensive travel details, itinerary, packing list, budget,
    and special markers using Groq AI.
    """
    if not settings.GROQ_API_KEY:
        return {"error": "GROQ_API_KEY is missing."}

    riding_style = user_preferences.get("riding_style", "balanced")
    budget_type  = user_preferences.get("budget", "moderate")
    travel_pace  = user_preferences.get("pace", "relaxed")
    interests    = user_preferences.get("interests", ["nature"])

    # Prepare summaries for the LLM
    distance = route_data.get("distance_km", "Unknown")
    duration = route_data.get("duration_hours", "Unknown")
    
    weather_summary = f"Current Temp: {live_weather.get('temp', 'N/A')}°C, {live_weather.get('description', 'N/A')}. "
    if weather_stops:
        weather_summary += "Conditions along stops: " + ", ".join([f"{w.get('temp')}°C ({w.get('description')})" for w in weather_stops[:3]])

    fuel_summary = f"{len(fuel_stops)} pumps detected: " + ", ".join([f"{f.get('name')} ({f.get('brand')})" for f in fuel_stops[:3]])
    hotels_summary = f"{len(hotels)} hotels detected: " + ", ".join([h.get('name') for h in hotels[:3]])
    spots_summary = f"Tourist Highlights: " + ", ".join([s.get('name') for s in tourist_spots_dest[:4]])
    en_route_summary = f"En Route stops: " + ", ".join([e.get('name') for e in places_en_route[:3]])

    prompt = f"""
You are an elite travel consultant and moto-vlogger specializing in road trips and adventure riding.
Create a highly professional and wowed travel guide and route plan from: {source} to {destination}
Travel Mode: {transport_mode}
Distance: {distance} km
Estimated Driving Time: {duration} hours

CONTEXT FROM SENSORS & APIS:
- Destination Weather: {weather_summary}
- Fuel availability: {fuel_summary}
- Lodging availability: {hotels_summary}
- Destination Attractions: {spots_summary}
- En Route Stops: {en_route_summary}

USER PERSONALIZATION PROFILE:
- Riding / Travel Style: {riding_style} (adventure/sport/touring/casual/balanced)
- Budget Tier: {budget_type} (budget/moderate/premium)
- Travel Pace: {travel_pace} (fast/relaxed/slow)
- Main Interests: {interests}

Respond ONLY with a valid JSON object. No extra text, no markdown.
IMPORTANT: Do NOT use raw newlines inside JSON string values. Use \\n if needed.
IMPORTANT: Use single quotes (') instead of double quotes (") for quoting any text inside string values to prevent JSON corruption.

Expected JSON Structure:
{{
    "best_time_to_visit": "A short descriptive paragraph explaining the best seasons and months for this specific route.",
    
    "traditional_foods": [
        {{"name": "Food Item Name", "description": "Short description of the dish and where to eat it."}}
    ],

    "packing_checklist": {{
        "essential_gear": ["Item 1", "Item 2"],
        "clothing": ["Item 1", "Item 2"],
        "tools_spares": ["Item 1", "Item 2"],
        "medical_permits": ["Item 1", "Item 2"]
    }},

    "permits_required": [
        {{"name": "Permit Name (e.g. ILP / Forest Pass / Tolls)", "details": "Cost, where to get it, and if it's mandatory."}}
    ],

    "important_warnings": [
        "Specific warning about road condition, landslide risk, altitude, fuel dry spots, or speed traps on this route."
    ],

    "budget_breakdown": {{
        "fuel_cost": "Estimated fuel cost in INR based on distance",
        "food_cost": "Food budget in INR customized for the user's budget tier",
        "lodging_cost": "Lodging budget in INR customized for the user's budget tier",
        "misc_cost": "Emergency buffers / tolls in INR",
        "total_estimated": "Total sum in INR (e.g. '₹12,500')",
        "budget_advice": "A short customized tip on how to save money on this trip based on their style."
    }},

    "photography_highlights": [
        {{
            "name": "Specific photography location",
            "type": "Sunrise/Sunset/Landscape/Architecture/Wildlife/Nightsky",
            "best_time": "Golden hour 6-7am / Blue hour / Midday",
            "km_from_source": 120,
            "gear_tips": "e.g. Use a wide-angle lens, ND filter recommended",
            "what_to_capture": "What is unique about this shot",
            "instagram_worthy": true
        }}
    ],

    "silent_reflection_points": [
        {{
            "name": "Tranquil viewpoint / temple / lakeside",
            "why": "Why this place is peaceful, special, and good for meditation/silent reflection",
            "best_time": "Early morning/Sunset",
            "km_from_source": 180,
            "vibe": "Spiritual/Meditative/Scenic/Remote"
        }}
    ],

    "sustainable_travel_tips": [
        {{
            "category": "Fuel/Waste/Local Economy/Wildlife/Water",
            "tip": "Actionable tip on how to minimize footprint or support locals on this route",
            "impact": "Why this matters for this region"
        }}
    ],

    "traffic_tips": {{
        "source_city_exit": "Best exit window from {source} (e.g. 'Leave before 6:30 AM to bypass NH bypass traffic')",
        "destination_entry": "Best time to enter {destination}",
        "avoid_times": ["Time ranges and locations to avoid (e.g. 'NH-44 construction bottlenecks 5-7pm')"],
        "best_travel_days": ["Tuesday", "Wednesday", "Thursday"],
        "toll_rush_hours": "Toll plaza peak hours advice",
        "seasonal_congestion": "Route-specific congestion info"
    }},

    "day_by_day_plan": [
        {{
            "day": 1,
            "title": "Start to Midpoint",
            "distance": "XXX km",
            "details": "Details about stops, road conditions, and highlights for Day 1."
        }}
    ],

    "personalized_for": {{
        "riding_style": "{riding_style}",
        "budget_type": "{budget_type}",
        "travel_pace": "{travel_pace}",
        "interests": {interests},
        "customization_note": "A paragraph explaining exactly how this trip is customized for the rider's style."
    }}
}}
"""

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
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

        return json.loads(cleaned_content, strict=False)

    except Exception as e:
        print(f"[Route AI] Groq generation error: {e}")
        return {"error": f"AI Parsing Error: {str(e)}"}
