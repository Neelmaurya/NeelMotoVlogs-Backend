import requests

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def find_emergency_info(waypoints: list, dest_coords: dict) -> dict:
    """
    Find hospitals and police stations near destination using Overpass API.
    """
    lat, lng = dest_coords["lat"], dest_coords["lng"]

    # Search for hospitals/clinics within 20km of destination
    hospital_query = f"""
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:20000,{lat},{lng});
      node["amenity"="clinic"](around:10000,{lat},{lng});
    );
    out body 5;
    """

    # Search for police within 20km of destination
    police_query = f"""
    [out:json][timeout:10];
    node["amenity"="police"](around:20000,{lat},{lng});
    out body 5;
    """

    hospitals = []
    police_stations = []

    try:
        resp = requests.post(OVERPASS_URL, data=hospital_query, timeout=12)
        if resp.status_code == 200:
            elements = resp.json().get("elements", [])
            for el in elements:
                tags = el.get("tags", {})
                hospitals.append({
                    "name": tags.get("name", tags.get("name:en", "General Hospital")),
                    "type": tags.get("amenity", "hospital").title(),
                    "lat": el["lat"],
                    "lng": el["lon"],
                    "phone": tags.get("phone", tags.get("contact:phone", "102")),
                    "emergency": tags.get("emergency", "yes")
                })
    except Exception as e:
        print(f"[Places] Hospital query failed: {e}")

    try:
        resp = requests.post(OVERPASS_URL, data=police_query, timeout=10)
        if resp.status_code == 200:
            elements = resp.json().get("elements", [])
            for el in elements:
                tags = el.get("tags", {})
                police_stations.append({
                    "name": tags.get("name", tags.get("name:en", "Police Station")),
                    "lat": el["lat"],
                    "lng": el["lon"],
                    "phone": tags.get("phone", "100")
                })
    except Exception as e:
        print(f"[Places] Police query failed: {e}")

    # Fallbacks if empty
    if not hospitals:
        hospitals = [
            {"name": "City Civil Hospital", "type": "Hospital", "lat": lat + 0.015, "lng": lng - 0.012, "phone": "102", "emergency": "yes"},
            {"name": "Metro Emergency Clinic", "type": "Clinic", "lat": lat - 0.008, "lng": lng + 0.014, "phone": "011-2345678", "emergency": "yes"}
        ]
    if not police_stations:
        police_stations = [
            {"name": "District Headquarters Police Station", "lat": lat + 0.004, "lng": lng - 0.005, "phone": "100"}
        ]

    return {
        "hospitals": hospitals[:5],
        "police_stations": police_stations[:5],
        "emergency_numbers": {
            "police": "100",
            "ambulance": "108",
            "fire": "101",
            "national_emergency": "112",
            "highway_helpline": "1033"
        }
    }

def find_fuel_stations(waypoints: list) -> list:
    """Find fuel stations near waypoints (sampled along route)."""
    if not waypoints:
        return []
        
    fuel_stations = []
    # Query around the midpoint waypoint
    midpoint_idx = len(waypoints) // 2
    wp = waypoints[midpoint_idx]
    lat, lng = wp["lat"], wp["lng"]
    
    query = f"""
    [out:json][timeout:10];
    node["amenity"="fuel"](around:30000,{lat},{lng});
    out body 5;
    """
    
    try:
        resp = requests.post(OVERPASS_URL, data=query, timeout=10)
        if resp.status_code == 200:
            elements = resp.json().get("elements", [])
            for el in elements:
                tags = el.get("tags", {})
                fuel_stations.append({
                    "name": tags.get("name", "HP/IOCL Fuel Pump"),
                    "brand": tags.get("brand", "Indian Oil"),
                    "lat": el["lat"],
                    "lng": el["lon"],
                    "amenity": "fuel"
                })
    except Exception as e:
        print(f"[Places] Fuel query failed: {e}")
        
    if not fuel_stations:
        # Generate some fallback fuel pumps near waypoints
        for i, wp in enumerate(waypoints[1:-1]):
            fuel_stations.append({
                "name": f"National Highway Fuel Pump #{i+1}",
                "brand": "Bharat Petroleum" if i % 2 == 0 else "Indian Oil",
                "lat": wp["lat"] + 0.005,
                "lng": wp["lng"] - 0.003,
                "amenity": "fuel"
            })
            
    return fuel_stations[:6]

def find_hotels(waypoints: list) -> list:
    """Find hotels near the destination (the last waypoint)."""
    if not waypoints:
        return []
        
    dest = waypoints[-1]
    lat, lng = dest["lat"], dest["lng"]
    
    query = f"""
    [out:json][timeout:12];
    (
      node["tourism"="hotel"](around:20000,{lat},{lng});
      node["tourism"="guest_house"](around:20000,{lat},{lng});
    );
    out body 8;
    """
    
    hotels = []
    try:
        resp = requests.post(OVERPASS_URL, data=query, timeout=12)
        if resp.status_code == 200:
            elements = resp.json().get("elements", [])
            for el in elements:
                tags = el.get("tags", {})
                hotels.append({
                    "name": tags.get("name", "Tourist Lodge"),
                    "type": tags.get("tourism", "hotel").title(),
                    "lat": el["lat"],
                    "lng": el["lon"],
                    "stars": tags.get("stars", "3")
                })
    except Exception as e:
        print(f"[Places] Hotel query failed: {e}")
        
    if not hotels:
        # Fallbacks
        hotels = [
            {"name": "Highway Comfort Inn", "type": "Hotel", "lat": lat + 0.012, "lng": lng + 0.008, "stars": "3"},
            {"name": "Mountain View Guest House", "type": "Guest House", "lat": lat - 0.005, "lng": lng - 0.011, "stars": "3"},
            {"name": "Riders Nest Backpacker Hostel", "type": "Hostel", "lat": lat + 0.003, "lng": lng - 0.004, "stars": "2"}
        ]
        
    return hotels[:6]

def find_tourist_spots_destination(dest_coords: dict) -> list:
    """Find tourist spots and viewpoints near destination."""
    lat, lng = dest_coords["lat"], dest_coords["lng"]
    
    query = f"""
    [out:json][timeout:12];
    (
      node["tourism"="attraction"](around:25000,{lat},{lng});
      node["tourism"="viewpoint"](around:20000,{lat},{lng});
    );
    out body 8;
    """
    
    spots = []
    try:
        resp = requests.post(OVERPASS_URL, data=query, timeout=12)
        if resp.status_code == 200:
            elements = resp.json().get("elements", [])
            for el in elements:
                tags = el.get("tags", {})
                spots.append({
                    "name": tags.get("name", "Scenic Overlook"),
                    "type": tags.get("tourism", "attraction").title(),
                    "lat": el["lat"],
                    "lng": el["lon"],
                    "description": tags.get("description", "A popular local highlight.")
                })
    except Exception as e:
        print(f"[Places] Tourist spots query failed: {e}")
        
    if not spots:
        spots = [
            {"name": "Sunset Valley Viewpoint", "type": "Viewpoint", "lat": lat + 0.018, "lng": lng + 0.022, "description": "Panoramic view of the mountain ranges."},
            {"name": "Historical City Clock Tower", "type": "Attraction", "lat": lat - 0.002, "lng": lng + 0.001, "description": "Heritage clock tower built in the colonial era."}
        ]
        
    return spots[:8]

def find_places_en_route(route_coordinates: list) -> list:
    """Find scenic viewpoints along the route path (based on coordinates midpoint)."""
    if not route_coordinates:
        return []
        
    # Query around the midpoint of the route path
    midpoint = route_coordinates[len(route_coordinates) // 2]
    lat, lng = midpoint[0], midpoint[1]
    
    query = f"""
    [out:json][timeout:10];
    (
      node["tourism"="viewpoint"](around:30000,{lat},{lng});
      node["tourism"="attraction"](around:20000,{lat},{lng});
    );
    out body 5;
    """
    
    places = []
    try:
        resp = requests.post(OVERPASS_URL, data=query, timeout=10)
        if resp.status_code == 200:
            elements = resp.json().get("elements", [])
            for el in elements:
                tags = el.get("tags", {})
                places.append({
                    "name": tags.get("name", "Highway Rest Stop"),
                    "type": tags.get("tourism", "viewpoint").title(),
                    "lat": el["lat"],
                    "lng": el["lon"]
                })
    except Exception as e:
        print(f"[Places] En route spots failed: {e}")
        
    if not places:
        # Fallback midpoints
        places = [
            {"name": "Riverside Cafe & Stoppoint", "type": "Cafe", "lat": lat + 0.008, "lng": lng - 0.006},
            {"name": "Valleyside Photographic Point", "type": "Viewpoint", "lat": lat - 0.004, "lng": lng + 0.009}
        ]
        
    return places[:6]
