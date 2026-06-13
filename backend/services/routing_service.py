import requests
from config import settings

def extract_waypoints(coordinates: list, num_waypoints: int = 6) -> list:
    """Sample equidistant coordinates from the full polyline for querying stops."""
    if not coordinates:
        return []
    if len(coordinates) <= num_waypoints:
        return [{"lat": p[1], "lng": p[0]} for p in coordinates]
    
    indices = [int(i * (len(coordinates) - 1) / (num_waypoints - 1)) for i in range(num_waypoints)]
    return [{"lat": coordinates[idx][1], "lng": coordinates[idx][0]} for idx in indices]

def get_route(start_coords: dict, end_coords: dict, mode: str = "car") -> dict | None:
    """
    Fetch route geometry, distance, and duration between start and end.
    Tries OpenRouteService (requires key) and falls back to keyless public OSRM.
    """
    start_lat, start_lng = start_coords["lat"], start_coords["lng"]
    end_lat, end_lng = end_coords["lat"], end_coords["lng"]

    # Map frontend transport mode to ORS & OSRM profiles
    ors_profile = "driving-car"
    osrm_profile = "driving"
    
    mode = mode.lower()
    if mode in ["walk", "walking", "foot"]:
        ors_profile = "foot-walking"
        osrm_profile = "foot"
    elif mode in ["bike", "motorcycle"]:
        # ORS doesn't have motorcycle, use car driving for highway/distance
        ors_profile = "driving-car"
        osrm_profile = "driving"
    elif mode in ["cycling", "bicycle", "cycle"]:
        ors_profile = "cycling-regular"
        osrm_profile = "cycling"
    elif mode == "transit":
        # Public transit uses driving fallback with instructions
        ors_profile = "driving-car"
        osrm_profile = "driving"

    # Try OpenRouteService if API key exists
    ors_key = getattr(settings, "ORS_API_KEY", None)
    if ors_key and ors_key.strip() and ors_key != "your_ors_key":
        try:
            url = f"https://api.openrouteservice.org/v2/directions/{ors_profile}"
            params = {
                "start": f"{start_lng},{start_lat}",
                "end": f"{end_lng},{end_lat}"
            }
            headers = {"Authorization": ors_key}
            resp = requests.get(url, params=params, headers=headers, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                feature = data["features"][0]
                geometry = feature["geometry"]
                # coordinates in geojson are [lng, lat]
                coords = [[c[1], c[0]] for c in geometry["coordinates"]] # convert to [lat, lng]
                properties = feature["properties"]["summary"]
                distance_km = round(properties["distance"] / 1000.0, 1)
                duration_hrs = round(properties["duration"] / 3600.0, 1)
                
                # coordinates list in [lat, lng] format for frontend
                raw_coords = geometry["coordinates"] # [lng, lat]
                waypoints = extract_waypoints(raw_coords, num_waypoints=6)
                
                return {
                    "coordinates": coords,
                    "distance_km": distance_km,
                    "duration_hours": duration_hrs,
                    "waypoints": waypoints,
                    "source_api": "OpenRouteService"
                }
            else:
                print(f"[Routing] ORS returned error: {resp.status_code} {resp.text}. Falling back to OSRM.")
        except Exception as e:
            print(f"[Routing] ORS request failed: {e}. Falling back to OSRM.")

    # Fallback to keyless public OSRM API
    try:
        url = f"http://router.project-osrm.org/route/v1/{osrm_profile}/{start_lng},{start_lat};{end_lng},{end_lat}"
        params = {
            "overview": "full",
            "geometries": "geojson",
            "steps": "false"
        }
        resp = requests.get(url, params=params, timeout=12)
        if resp.status_code == 200:
            data = resp.json()
            if not data.get("routes"):
                print(f"[Routing] OSRM returned no routes: {data}")
                return None
                
            route = data["routes"][0]
            geometry = route["geometry"]
            # Convert [lng, lat] to [lat, lng]
            coords = [[c[1], c[0]] for c in geometry["coordinates"]]
            distance_km = round(route["distance"] / 1000.0, 1)
            duration_hrs = round(route["duration"] / 3600.0, 1)
            
            raw_coords = geometry["coordinates"] # [lng, lat]
            waypoints = extract_waypoints(raw_coords, num_waypoints=6)
            
            return {
                "coordinates": coords,
                "distance_km": distance_km,
                "duration_hours": duration_hrs,
                "waypoints": waypoints,
                "source_api": "OSRM Public"
            }
        else:
            print(f"[Routing] OSRM failed: {resp.status_code} {resp.text}")
            return None
    except Exception as e:
        print(f"[Routing] Exception requesting OSRM route: {e}")
        return None
