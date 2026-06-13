import requests

def geocode_location(query: str) -> dict | None:
    """
    Resolve a location name to lat/lng using OpenStreetMap Nominatim.
    Completely free, requires no API key.
    """
    if not query or not query.strip():
        return None
        
    query = query.strip()
    try:
        # Nominatim asks for a descriptive User-Agent
        headers = {
            "User-Agent": "NeelMotoVlogsTravelPlanner/1.0 (neel@neelmoto.com)"
        }
        resp = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": query,
                "format": "json",
                "limit": 1
            },
            headers=headers,
            timeout=10
        )
        
        if resp.status_code != 200:
            print(f"[Geocoding] Non-200 response: {resp.status_code} {resp.text}")
            return None
            
        data = resp.json()
        if not data:
            print(f"[Geocoding] No coordinates found for: {query}")
            return None
            
        return {
            "lat": float(data[0]["lat"]),
            "lng": float(data[0]["lon"]),
            "display_name": data[0]["display_name"]
        }
    except Exception as e:
        print(f"[Geocoding] Exception resolving query '{query}': {e}")
        return None
