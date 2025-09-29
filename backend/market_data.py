import os
import requests
from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import time
from .api_clients import MaricopaAPI, GooglePlacesAPI, OpenWeatherAPI, CensusAPI, FreeGeocodingAPI, FreeElevationAPI, FreeTimezoneAPI, FreePlacesAPI
from .wooCost import log_free_call
from . import db
# Import marketing automation (lazy import to avoid circular dependencies)
def get_marketing_automation():
    from .marketing_automation import MarketingAutomation
    return MarketingAutomation()

router = APIRouter()

@router.get("/api/marketing/campaign-report")
def get_campaign_report():
    """Get marketing campaign performance report"""
    try:
        ma = get_marketing_automation()
        return ma.get_campaign_report()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Campaign report failed: {str(e)}")

router = APIRouter()

# API Keys from environment
CENSUS_API_KEY = os.getenv("CENSUS_API_KEY", "")
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

# Initialize API clients
maricopa_api = MaricopaAPI()
google_places_api = GooglePlacesAPI(GOOGLE_PLACES_API_KEY) if GOOGLE_PLACES_API_KEY else None
openweather_api = OpenWeatherAPI(OPENWEATHER_API_KEY) if OPENWEATHER_API_KEY else None
census_api = CensusAPI(CENSUS_API_KEY) if CENSUS_API_KEY else None

# FREE API clients (no API keys needed!)
free_geocoding_api = FreeGeocodingAPI()
free_elevation_api = FreeElevationAPI()
free_timezone_api = FreeTimezoneAPI()
free_places_api = FreePlacesAPI(foursquare_key=os.getenv("FOURSQUARE_API_KEY"))

# Cache for API responses (simple in-memory cache)
cache = {}
CACHE_DURATION = 3600  # 1 hour - INCREASE TO 24 HOURS FOR MAPS
MAP_CACHE_DURATION = 86400  # 24 hours for map data (since it doesn't change often)

def get_cached(key: str, cache_type: str = "normal"):
    if key in cache:
        data, timestamp = cache[key]
        duration = MAP_CACHE_DURATION if "map" in cache_type.lower() else CACHE_DURATION
        if time.time() - timestamp < duration:
            return data
        else:
            del cache[key]
    return None

def set_cached(key: str, data, cache_type: str = "normal"):
    cache[key] = (data, time.time())

# 1. Maricopa County Assessor API - Property/Construction Data
def search_parcel(query: str, page: int = 1) -> Dict:
    """Search for parcels by address or ID"""
    try:
        # Use the MaricopaAPI class
        return maricopa_api.search_property(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parcel search failed: {str(e)}")

def query_parcel_geometry(layer_url: str, where_clause: str = "1=1", out_fields: str = "*") -> Dict:
    """Query parcel geometry data"""
    try:
        params = {
            "where": where_clause,
            "outFields": out_fields,
            "f": "json"
        }
        resp = requests.get(f"{layer_url}/query", params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geometry query failed: {str(e)}")

# 2. Google Places API - Competitor Data
def places_nearby(lat: float, lon: float, radius_m: int = 5000, place_type: str = "general_contractor", zip_code: str = "85254") -> Dict:
    """Find nearby competitors with database caching - uses FREE alternatives when possible"""
    # First check database for recent data (within last 7 days)
    last_updated = db.get_competitor_last_updated(zip_code)
    if last_updated:
        # Parse the timestamp
        from datetime import datetime
        last_update_time = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
        days_since_update = (datetime.now() - last_update_time).days

        if days_since_update < 7:  # Use database data if less than 7 days old
            db_competitors = db.get_competitors(zip_code, 5)
            if db_competitors:
                return {"results": db_competitors}

    # Try FREE alternatives first
    free_results = []
    try:
        # Try Foursquare (1,000 free/day)
        if free_places_api.foursquare_key:
            foursquare_data = free_places_api.search_businesses_foursquare(
                query="window company contractor",
                lat=lat, lon=lon, limit=5
            )
            if foursquare_data.get("results"):
                free_results = [
                    {
                        "name": place.get("name", ""),
                        "address": place.get("location", {}).get("formatted_address", ""),
                        "rating": place.get("rating", 0),
                        "total_ratings": place.get("stats", {}).get("total_ratings", 0),
                        "latitude": place.get("geocodes", {}).get("main", {}).get("latitude"),
                        "longitude": place.get("geocodes", {}).get("main", {}).get("longitude"),
                        "place_id": place.get("fsq_id"),
                        "place_type": place_type
                    } for place in foursquare_data["results"]
                ]
                log_free_call("free_places")  # Log the free call

        # Fallback to OpenStreetMap Overpass (100% free)
        if not free_results:
            overpass_data = free_places_api.search_businesses_overpass(
                lat=lat, lon=lon, business_type="contractor", limit=5
            )
            if overpass_data.get("elements"):
                free_results = [
                    {
                        "name": elem.get("tags", {}).get("name", "Local Contractor"),
                        "address": f"{elem.get('lat', lat):.4f}, {elem.get('lon', lon):.4f}",
                        "rating": 0,
                        "total_ratings": 0,
                        "latitude": elem.get("lat") or elem.get("center", {}).get("lat"),
                        "longitude": elem.get("lon") or elem.get("center", {}).get("lon"),
                        "place_id": f"osm_{elem.get('id')}",
                        "place_type": place_type
                    } for elem in overpass_data["elements"][:5]
                ]
                log_free_call("free_places")  # Log the free call

    except Exception as e:
        print(f"Free Places API failed: {e}")

    # If we got free results, save them to database
    if free_results:
        db.save_competitors(free_results, zip_code)
        return {"results": free_results}

    # Fallback to Google Places if free APIs fail and key is available
    if not google_places_api:
        return {"results": []}  # Return empty if no API key

    cache_key = f"places_{lat}_{lon}_{radius_m}_{place_type}"
    cached = get_cached(cache_key, "map")  # Use extended map caching
    if cached:
        # Save to database for future use
        db.save_competitors([
            {
                "name": comp.get("name", ""),
                "address": comp.get("vicinity", ""),
                "rating": comp.get("rating"),
                "total_ratings": comp.get("user_ratings_total", 0),
                "latitude": lat,
                "longitude": lon,
                "place_id": comp.get("place_id"),
                "place_type": place_type
            } for comp in cached.get("results", [])
        ], zip_code)
        return cached

    try:
        data = google_places_api.places_nearby(lat, lon, radius_m, place_type)
        set_cached(cache_key, data, "map")  # Cache for 24 hours

        # Save to database
        db.save_competitors([
            {
                "name": comp.get("name", ""),
                "address": comp.get("vicinity", ""),
                "rating": comp.get("rating"),
                "total_ratings": comp.get("user_ratings_total", 0),
                "latitude": lat,
                "longitude": lon,
                "place_id": comp.get("place_id"),
                "place_type": place_type
            } for comp in data.get("results", [])
        ], zip_code)

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Places API failed: {str(e)}")

# 3. OpenWeather API - Weather Data
def get_weather(lat: float, lon: float, exclude: List[str] = None, units: str = "imperial") -> Dict:
    """Get current weather and forecast"""
    if not openweather_api:
        return {"current": {"temp": 75, "weather": [{"description": "Sunny"}]}}  # Default

    cache_key = f"weather_{lat}_{lon}"
    cached = get_cached(cache_key)
    if cached:
        return cached

    try:
        data = openweather_api.onecall(lat, lon, exclude, units)
        set_cached(cache_key, data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather API failed: {str(e)}")

# 4. U.S. Census Bureau API - Demographic Data
def get_census_data(year: int, variables: List[str], for_param: str, in_param: str = None) -> List:
    """Get demographic data by geography"""
    if not census_api:
        return [["No API key", "configured"]]  # Default

    cache_key = f"census_{year}_{','.join(variables)}_{for_param}_{in_param}"
    cached = get_cached(cache_key)
    if cached:
        return cached

    try:
        data = census_api.acs5(year, variables, for_param, in_param)
        set_cached(cache_key, data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Census API failed: {str(e)}")

@router.get("/api/market-data")
def get_market_data(zip_code: str = "85254", lat: float = 33.494, lon: float = -111.926):
    """Combined market intelligence data"""
    try:
        # 1. Get demographic data for the ZIP
        census_vars = [
            "B01003_001E",  # Total population
            "B19013_001E",  # Median household income
            "B25035_001E",  # Median year structure built (home age)
            "B25077_001E",  # Median home value
            "B01001_002E",  # Male population
            "B01001_026E"   # Female population
        ]
        census_data = get_census_data(2023, census_vars, f"zip code tabulation area:{zip_code}")

        # 2. Get weather data
        weather_data = get_weather(lat, lon, exclude=["minutely"])

        # 3. Find nearby competitors
        competitors = places_nearby(lat, lon, 5000, "general_contractor", zip_code)

        # 4. Search for recent parcels (construction activity)
        parcel_search = search_parcel(zip_code)

        # Process and format the data
        result = {
            "agents": {
                "PermitHunter": {"name": "🏠 Permit Hunter", "description": "Maricopa County construction data", "status": "active"},
                "CompetitorSpy": {"name": "🕵️ Competitor Spy", "description": "Google Places competitor analysis", "status": "active" if google_places_api else "waiting_for_key"},
                "WeatherTrigger": {"name": "🌤 Weather Trigger", "description": "OpenWeather forecast data", "status": "active" if openweather_api else "waiting_for_key"},
                "DemoAnalyzer": {"name": "📊 Demo Analyzer", "description": "Census Bureau demographic data", "status": "active" if census_api else "waiting_for_key"}
            },
            "demographics": {
                "agent": "DemoAnalyzer",
                "zip_code": zip_code,
                "population": census_data[1][0] if len(census_data) > 1 else "N/A",
                "median_income": census_data[1][1] if len(census_data) > 1 else "N/A",
                "median_home_age": census_data[1][2] if len(census_data) > 1 else "N/A",
                "median_home_value": census_data[1][3] if len(census_data) > 1 else "N/A",
                "male_population": census_data[1][4] if len(census_data) > 1 else "N/A",
                "female_population": census_data[1][5] if len(census_data) > 1 else "N/A"
            },
            "weather": {
                "agent": "WeatherTrigger",
                "current_temp": weather_data.get("current", {}).get("temp", "N/A"),
                "description": weather_data.get("current", {}).get("weather", [{}])[0].get("description", "N/A"),
                "forecast": [
                    {
                        "date": datetime.fromtimestamp(day.get("dt", 0)).strftime("%Y-%m-%d"),
                        "temp_max": day.get("temp", {}).get("max", "N/A"),
                        "temp_min": day.get("temp", {}).get("min", "N/A"),
                        "description": day.get("weather", [{}])[0].get("description", "N/A")
                    } for day in weather_data.get("daily", [])[:3]  # Next 3 days
                ]
            },
            "competitors": {
                "agent": "CompetitorSpy",
                "data": [
                    {
                        "name": comp.get("name", ""),
                        "address": comp.get("vicinity", ""),
                        "rating": comp.get("rating", "N/A"),
                        "total_ratings": comp.get("user_ratings_total", 0)
                    } for comp in competitors.get("results", [])[:5]  # Top 5
                ]
            },
            "construction_activity": {
                "agent": "PermitHunter",
                "total_parcels": len(parcel_search.get("results", [])),
                "recent_permits": len([p for p in parcel_search.get("results", []) if "permit" in str(p).lower()])  # Rough estimate
            },
            "timestamp": datetime.now().isoformat()
        }

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market data fetch failed: {str(e)}")

@router.get("/api/briefing-data")
def get_briefing_data(zip_code: str = "85254", lat: float = 33.494, lon: float = -111.926):
    """Specific data for AI briefing generation"""
    market_data = get_market_data(zip_code, lat, lon)

    # Format for briefing
    briefing_data = {
        "agents_active": [agent for agent, info in market_data["agents"].items() if info["status"] == "active"],
        "new_leads": market_data["construction_activity"]["total_parcels"],  # Use parcel count as proxy for leads
        "permit_increase": f"{market_data['construction_activity']['recent_permits']}%",  # Rough estimate
        "competitors": [comp["name"] for comp in market_data["competitors"]["data"][:3]],  # Top 3 competitors
        "competitors_last_updated": db.get_competitor_last_updated(zip_code),
        "weather_impact": market_data["weather"]["description"],
        "demographics": {
            "zip_code": market_data["demographics"]["zip_code"],
            "population": market_data["demographics"]["population"],
            "median_income": market_data["demographics"]["median_income"],
            "median_home_age": market_data["demographics"]["median_home_age"],
            "median_home_value": market_data["demographics"]["median_home_value"],
            "market_opportunity": "High" if int(market_data["demographics"]["median_home_age"] or 0) > 1980 else "Medium"
        }
    }

    return briefing_data

@router.get("/api/competitors")
def get_competitors_endpoint(zip_code: str = "85254", limit: int = 5):
    """Get competitor data for map display"""
    try:
        competitors = db.get_competitors(zip_code, limit)
        return competitors
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch competitors: {str(e)}")

@router.post("/api/update-competitors")
def update_competitors(zip_code: str = "85254", lat: float = 33.494, lon: float = -111.926):
    """Force update competitor data (call this weekly/monthly)"""
    try:
        # Force fresh API call by clearing cache
        cache_key = f"places_{lat}_{lon}_5000_general_contractor"
        if cache_key in cache:
            del cache[cache_key]
            
        # Call places_nearby which will update database
        competitors = places_nearby(lat, lon, 5000, "general_contractor", zip_code)
        
        return {
            "status": "success", 
            "competitors_found": len(competitors.get("results", [])),
            "zip_code": zip_code
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Competitor update failed: {str(e)}")


# --------------------
# FREE API Endpoints (No Costs!)
# --------------------


@router.get("/api/free/geocode")
def free_geocode_address(address: str):
    """FREE geocoding - convert address to coordinates"""
    try:
        result = free_geocoding_api.geocode_address(address)
        log_free_call("free_geocoding")  # Track the free call
        return {"results": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Free geocoding failed: {str(e)}")


@router.get("/api/free/reverse-geocode")
def free_reverse_geocode(lat: float, lon: float):
    """FREE reverse geocoding - convert coordinates to address"""
    try:
        result = free_geocoding_api.reverse_geocode(lat, lon)
        log_free_call("free_geocoding")  # Track the free call
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Free reverse geocoding failed: {str(e)}")


@router.get("/api/free/elevation")
def free_get_elevation(lat: float, lon: float):
    """FREE elevation data for coordinates"""
    try:
        result = free_elevation_api.get_elevation(lat, lon)
        log_free_call("free_elevation")  # Track the free call
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Free elevation failed: {str(e)}")


@router.get("/api/free/timezone")
def free_get_timezone(lat: float, lon: float):
    """FREE timezone data for coordinates"""
    try:
        result = free_timezone_api.get_timezone(lat, lon)
        log_free_call("free_timezone")  # Track the free call
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Free timezone failed: {str(e)}")


@router.get("/api/free/worldtime")
def free_get_worldtime(timezone: str = "America/Phoenix"):
    """FREE current time for timezone"""
    try:
        result = free_timezone_api.get_worldtime(timezone)
        log_free_call("free_timezone")  # Track the free call
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Free worldtime failed: {str(e)}")


@router.get("/api/cost-report")
def get_cost_report():
    """Get cost savings report"""
    from .wooCost import get_cost_report
    return get_cost_report()


# --------------------
# MARKETING AUTOMATION ENDPOINTS (TEMPORARILY DISABLED)
# --------------------

@router.get("/api/marketing/run-campaigns")
def run_automated_campaigns():
    """Run all automated marketing campaigns based on weather, permits, competitors"""
    try:
        ma = get_marketing_automation()
        result = ma.run_automated_campaigns()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Campaign generation failed: {str(e)}")

# @router.get("/api/marketing/campaign-report")
# def get_campaign_report():
#     """Get marketing campaign performance report"""
#     try:
#         ma = get_marketing_automation()
#         return ma.get_campaign_report()
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Campaign report failed: {str(e)}")

# @router.post("/api/marketing/track-roi")
# def track_campaign_roi(campaign_type: str, leads: int, revenue: float = 0):
#     """Track campaign success and ROI"""
#     try:
#         ma = get_marketing_automation()
#         ma.track_campaign_success(campaign_type, leads, revenue)
#         return {"status": "success", "message": f"Tracked {leads} leads for {campaign_type}"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"ROI tracking failed: {str(e)}")

# @router.get("/api/marketing/weather-triggers")
# def get_weather_triggers():
#     """Get current weather-based campaign triggers"""
#     try:
#         ma = get_marketing_automation()
#         campaigns = ma.check_weather_triggers()
#         return {"weather_campaigns": campaigns}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Weather triggers failed: {str(e)}")

# @router.get("/api/marketing/permit-triggers")
# def get_permit_triggers():
#     """Get permit-based campaign triggers"""
#     try:
#         ma = get_marketing_automation()
#         campaigns = ma.check_permit_triggers()
#         return {"permit_campaigns": campaigns}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Permit triggers failed: {str(e)}")

# @router.get("/api/marketing/competitor-triggers")
# def get_competitor_triggers():
#     """Get competitor-based campaign triggers"""
#     try:
#         ma = get_marketing_automation()
#         campaigns = ma.check_competitor_triggers()
#         return {"competitor_campaigns": campaigns}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Competitor triggers failed: {str(e)}")