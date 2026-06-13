import requests
from config import settings

def get_air_quality(coords: dict) -> dict:
    """
    Fetch Air Quality Index using OpenAQ API v3.
    Completely free, no key needed for basic use.
    Signup for higher limits at openaq.org.
    """
    lat, lng = coords["lat"], coords["lng"]
    api_key = getattr(settings, "OPENAQ_API_KEY", "")

    headers = {}
    if api_key and api_key != "your_openaq_key" and api_key.strip():
        headers["X-API-Key"] = api_key

    try:
        # Find nearest monitoring station
        stations_resp = requests.get(
            "https://api.openaq.org/v3/locations",
            params={
                "coordinates": f"{lat},{lng}",
                "radius": 50000,  # 50km radius
                "limit": 1,
                "order_by": "distance"
            },
            headers=headers,
            timeout=8
        ).json()

        if not stations_resp.get("results"):
            return get_aqi_fallback(lat, lng)

        location_id = stations_resp["results"][0]["id"]
        station_name = stations_resp["results"][0].get("name", "Nearby Station")

        # Get latest measurements
        measurements_resp = requests.get(
            f"https://api.openaq.org/v3/locations/{location_id}/latest",
            headers=headers,
            timeout=8
        ).json()

        measurements = {}
        for result in measurements_resp.get("results", []):
            param = result.get("parameter", {}).get("name", "")
            value = result.get("value", 0)
            unit = result.get("parameter", {}).get("units", "")
            measurements[param] = {"value": round(value, 1), "unit": unit}

        # Calculate AQI category
        pm25 = measurements.get("pm25", {}).get("value", 0)
        aqi_category, aqi_color, aqi_advice = calculate_aqi_category(pm25)

        return {
            "station": station_name,
            "measurements": measurements,
            "pm25": pm25,
            "aqi_category": aqi_category,
            "aqi_color": aqi_color,
            "riding_advice": aqi_advice,
            "source": "OpenAQ"
        }
    except Exception as e:
        print(f"[AQI] OpenAQ search failed: {e}. Trying fallback.")
        return get_aqi_fallback(lat, lng)


def calculate_aqi_category(pm25: float) -> tuple:
    """Convert PM2.5 (ug/m3) to AQI category and advice."""
    if pm25 <= 12:
        return "Good", "#22c55e", "Great riding conditions. Enjoy the fresh air!"
    elif pm25 <= 35:
        return "Moderate", "#eab308", "Acceptable air quality. Sensitive riders may feel slight discomfort."
    elif pm25 <= 55:
        return "Unhealthy for Sensitive Groups", "#f97316", "Wear a quality face mask. Limit exposure time."
    elif pm25 <= 150:
        return "Unhealthy", "#ef4444", "Wear N95 mask. Consider postponing if you have respiratory issues."
    elif pm25 <= 250:
        return "Very Unhealthy", "#7c3aed", "Avoid prolonged outdoor exposure. Mask mandatory."
    else:
        return "Hazardous", "#831843", "Dangerous conditions. Avoid riding if possible."


def get_aqi_fallback(lat: float, lng: float) -> dict:
    """Fallback: Use OpenWeather Air Pollution API (also free, but requires key)."""
    api_key = getattr(settings, "OPENWEATHER_API_KEY", "")
    if not api_key or api_key == "your_openweather_key" or not api_key.strip():
        # Simulated fallback if no keys configured
        return {
            "aqi_category": "Good",
            "aqi_color": "#22c55e",
            "riding_advice": "Great riding conditions! (Simulated AQI)",
            "pm25": 8.5,
            "source": "Simulated AQI"
        }

    try:
        resp = requests.get(
            "http://api.openweathermap.org/data/2.5/air_pollution",
            params={"lat": lat, "lon": lng, "appid": api_key},
            timeout=5
        ).json()

        aqi_index = resp["list"][0]["main"]["aqi"]  # 1-5 scale
        components = resp["list"][0]["components"]

        aqi_map = {
            1: ("Good", "#22c55e", "Great riding conditions!"),
            2: ("Fair", "#84cc16", "Good conditions for riding."),
            3: ("Moderate", "#eab308", "Wear a basic face mask."),
            4: ("Poor", "#f97316", "Wear N95 mask recommended."),
            5: ("Very Poor", "#ef4444", "Avoid prolonged exposure.")
        }

        cat, color, advice = aqi_map.get(aqi_index, ("Unknown", "#6b7280", "Data unavailable"))
        return {
            "aqi_category": cat,
            "aqi_color": color,
            "riding_advice": advice,
            "pm25": round(components.get("pm2_5", 0), 1),
            "source": "OpenWeather Air Pollution"
        }
    except Exception as e:
        print(f"[AQI] Fallback failed: {e}")
        return {"aqi_category": "Unknown", "aqi_color": "#6b7280", "riding_advice": "Data unavailable"}
