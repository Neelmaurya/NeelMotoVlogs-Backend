import requests
from config import settings

def get_live_weather_destination(coords: dict) -> dict:
    """
    Fetch current weather and 5-day forecast for destination coords using OpenWeather API.
    Falls back to mock data if key is missing or request fails.
    """
    lat, lng = coords["lat"], coords["lng"]
    api_key = getattr(settings, "OPENWEATHER_API_KEY", None)

    if not api_key or api_key == "your_openweather_key" or not api_key.strip():
        return get_mock_weather(lat, lng)

    try:
        # 1. Get current weather
        curr_url = "https://api.openweathermap.org/data/2.5/weather"
        curr_resp = requests.get(
            curr_url,
            params={"lat": lat, "lon": lng, "units": "metric", "appid": api_key},
            timeout=8
        )
        
        # 2. Get 5-day forecast
        fore_url = "https://api.openweathermap.org/data/2.5/forecast"
        fore_resp = requests.get(
            fore_url,
            params={"lat": lat, "lon": lng, "units": "metric", "appid": api_key},
            timeout=8
        )

        if curr_resp.status_code != 200:
            return get_mock_weather(lat, lng)

        curr_data = curr_resp.json()
        forecast_list = []

        if fore_resp.status_code == 200:
            fore_data = fore_resp.json()
            # Sample forecast daily at 12:00 PM (every 8th element in 3-hour chunks)
            for i, item in enumerate(fore_data.get("list", [])):
                if i % 8 == 0:
                    forecast_list.append({
                        "date": item.get("dt_txt", "").split(" ")[0],
                        "temp": round(item["main"]["temp"]),
                        "min_temp": round(item["main"]["temp_min"]),
                        "max_temp": round(item["main"]["temp_max"]),
                        "description": item["weather"][0]["description"].title(),
                        "icon": item["weather"][0]["icon"]
                    })
        
        if not forecast_list:
            forecast_list = get_mock_forecast()

        return {
            "temp": round(curr_data["main"]["temp"]),
            "feels_like": round(curr_data["main"]["feels_like"]),
            "humidity": curr_data["main"]["humidity"],
            "wind_speed": round(curr_data["wind"]["speed"] * 3.6), # convert m/s to km/h
            "description": curr_data["weather"][0]["description"].title(),
            "icon": curr_data["weather"][0]["icon"],
            "forecast": forecast_list,
            "source": "OpenWeather API"
        }

    except Exception as e:
        print(f"[Weather] OpenWeather API error: {e}. Using mock fallback.")
        return get_mock_weather(lat, lng)

def _reverse_geocode(lat: float, lng: float) -> str:
    """Reverse-geocode lat/lng to a short place name using OSM Nominatim."""
    try:
        resp = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"lat": lat, "lon": lng, "format": "json", "zoom": 10},
            headers={"User-Agent": "NeelMotoVlogsTravelPlanner/1.0"},
            timeout=5
        )
        if resp.status_code == 200:
            data = resp.json()
            addr = data.get("address", {})
            # Return the most specific available name: city > town > village > county > state
            for key in ("city", "town", "village", "county", "state_district", "state"):
                if addr.get(key):
                    return addr[key]
    except Exception:
        pass
    return ""


def get_weather_for_stops(waypoints: list) -> list:
    """
    Fetch current temperature & condition for waypoint coords along the route.
    Each stop also gets a human-readable location_name via reverse geocoding.
    """
    api_key = getattr(settings, "OPENWEATHER_API_KEY", None)
    results = []
    has_key = api_key and api_key.strip() and api_key != "your_openweather_key"

    for i, wp in enumerate(waypoints[:6]):
        lat, lng = wp["lat"], wp["lng"]

        # Reverse-geocode location name (always, regardless of weather key)
        location_name = _reverse_geocode(lat, lng)

        if not has_key:
            results.append({
                "lat": lat, "lng": lng,
                "temp": 20 + (i % 3) * 2,
                "description": "Clear Sky" if i % 2 == 0 else "Partly Cloudy",
                "humidity": 60, "wind_speed": 10,
                "location_name": location_name,
            })
            continue

        try:
            resp = requests.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"lat": lat, "lon": lng, "units": "metric", "appid": api_key},
                timeout=5
            )
            if resp.status_code == 200:
                data = resp.json()
                results.append({
                    "lat": lat, "lng": lng,
                    "temp": round(data["main"]["temp"]),
                    "description": data["weather"][0]["description"].title(),
                    "humidity": data["main"]["humidity"],
                    "wind_speed": round(data["wind"]["speed"] * 3.6),
                    "location_name": location_name or data.get("name", ""),
                })
            else:
                results.append({
                    "lat": lat, "lng": lng,
                    "temp": 22, "description": "Unavailable",
                    "location_name": location_name,
                })
        except Exception:
            results.append({
                "lat": lat, "lng": lng,
                "temp": 22, "description": "Unavailable",
                "location_name": location_name,
            })

    return results

def get_mock_forecast() -> list:
    """Generate realistic mock 5-day forecast."""
    from datetime import datetime, timedelta
    forecast = []
    base_date = datetime.now()
    conditions = ["Clear Sky", "Scattered Clouds", "Light Rain", "Mostly Sunny", "Overcast"]
    for i in range(5):
        day = base_date + timedelta(days=i)
        forecast.append({
            "date": day.strftime("%Y-%m-%d"),
            "temp": 22 + i,
            "min_temp": 16 + (i % 2),
            "max_temp": 27 + (i % 3),
            "description": conditions[i % len(conditions)],
            "icon": "01d" if i % 2 == 0 else "03d"
        })
    return forecast

def get_mock_weather(lat: float, lng: float) -> dict:
    """Generate mock current weather conditions."""
    return {
        "temp": 22,
        "feels_like": 23,
        "humidity": 65,
        "wind_speed": 12,
        "description": "Partly Cloudy",
        "icon": "03d",
        "forecast": get_mock_forecast(),
        "source": "Simulated Weather (No API Key)"
    }
