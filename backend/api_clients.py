# api_clients.py
# --------------------
# API client classes for market data integration
# --------------------

import requests
from typing import List, Optional, Dict, Any


# --------------------
# 1. Maricopa County Assessor/GIS
# --------------------


class MaricopaAPI:
    def __init__(self):
        # Public API, no key needed
        pass

    def search_property(self, address: str) -> Dict[str, Any]:
        """Search for property by address"""
        url = "https://maps.mcassessor.maricopa.gov/api/v1/addresses"
        params = {"address": address}
        r = requests.get(url, params=params)
        r.raise_for_status()
        return r.json()

    def get_parcel(self, parcel_id: str) -> Dict[str, Any]:
        """Get parcel details by parcel ID"""
        url = f"https://maps.mcassessor.maricopa.gov/api/v1/parcels/{parcel_id}"
        r = requests.get(url)
        r.raise_for_status()
        return r.json()


# --------------------
# 2. Google Places API
# --------------------


class GooglePlacesAPI:
    def __init__(self, api_key: str):
        self.key = api_key

    def places_nearby(self, lat: float, lng: float, radius: int = 5000, type_: str = "general_contractor", keyword: str = None) -> Dict[str, Any]:
        """Find places nearby with optional keyword filtering"""
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": f"{lat},{lng}",
            "radius": radius,
            "type": type_,
            "key": self.key
        }
        if keyword:
            params["keyword"] = keyword
        r = requests.get(url, params=params)
        r.raise_for_status()
        return r.json()

    def place_details(self, place_id: str, fields: List[str] = None) -> Dict[str, Any]:
        """Get detailed information about a place"""
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "fields": ",".join(fields) if fields else "name,formatted_address,rating,user_ratings_total,review",
            "key": self.key
        }
        r = requests.get(url, params=params)
        r.raise_for_status()
        return r.json()


# --------------------
# 3. OpenWeather API
# --------------------


class OpenWeatherAPI:
    def __init__(self, api_key: str):
        self.key = api_key

    def onecall(self, lat: float, lon: float, exclude: list[str] = None, units: str = "imperial"):
        url = "https://api.openweathermap.org/data/3.0/onecall"
        params = {"lat": lat, "lon": lon, "appid": self.key, "units": units}
        if exclude:
            params["exclude"] = ",".join(exclude)
        r = requests.get(url, params=params)
        r.raise_for_status()
        return r.json()

    def historical(self, lat: float, lon: float, dt_unix: int):
        url = "https://api.openweathermap.org/data/3.0/onecall/timemachine"
        params = {"lat": lat, "lon": lon, "dt": dt_unix, "appid": self.key}
        r = requests.get(url, params=params)
        r.raise_for_status()
        return r.json()


# --------------------
# 3. U.S. Census Bureau API
# --------------------


class CensusAPI:
    def __init__(self, api_key: str = None):
        self.key = api_key

    def acs5(self, year: int, variables: list[str], for_param: str, in_param: str = None):
        url = f"https://api.census.gov/data/{year}/acs/acs5"
        params = {"get": ",".join(variables), "for": for_param}
        if in_param:
            params["in"] = in_param
        if self.key:
            params["key"] = self.key
        r = requests.get(url, params=params)
        r.raise_for_status()
        return r.json()


# --------------------
# FREE API Alternatives (No Costs!)
# --------------------


class FreeGeocodingAPI:
    """100% FREE geocoding using OpenStreetMap Nominatim"""

    def geocode_address(self, address: str, limit: int = 1) -> Dict[str, Any]:
        """Convert address to coordinates (FREE)"""
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            "format": "json",
            "q": address,
            "limit": limit,
            "addressdetails": 1
        }
        headers = {
            "User-Agent": "WooConsulting/1.0 (contact@wooconsulting.com)"
        }
        r = requests.get(url, params=params, headers=headers)
        r.raise_for_status()
        return r.json()

    def reverse_geocode(self, lat: float, lon: float) -> Dict[str, Any]:
        """Convert coordinates to address (FREE)"""
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            "format": "json",
            "lat": lat,
            "lon": lon,
            "addressdetails": 1
        }
        headers = {
            "User-Agent": "WooConsulting/1.0 (contact@wooconsulting.com)"
        }
        r = requests.get(url, params=params, headers=headers)
        r.raise_for_status()
        return r.json()


class FreeElevationAPI:
    """100% FREE elevation data"""

    def get_elevation(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get elevation for coordinates (FREE)"""
        url = "https://api.open-elevation.com/api/v1/lookup"
        params = {
            "locations": f"{lat},{lon}"
        }
        r = requests.get(url, params=params)
        r.raise_for_status()
        return r.json()


class FreeTimezoneAPI:
    """100% FREE timezone data"""

    def get_timezone(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get timezone for coordinates (FREE)"""
        url = f"http://api.timezonedb.com/v2.1/get-time-zone"
        params = {
            "key": "FREE",  # No key needed for basic usage
            "format": "json",
            "by": "position",
            "lat": lat,
            "lng": lon
        }
        r = requests.get(url, params=params)
        r.raise_for_status()
        return r.json()

    def get_worldtime(self, timezone: str) -> Dict[str, Any]:
        """Get current time for timezone (FREE)"""
        url = f"http://worldtimeapi.org/api/timezone/{timezone}"
        r = requests.get(url)
        r.raise_for_status()
        return r.json()


class FreePlacesAPI:
    """FREE Places API alternatives"""

    def __init__(self, foursquare_key: str = None):
        self.foursquare_key = foursquare_key

    def search_businesses_foursquare(self, query: str, lat: float, lon: float, limit: int = 10) -> Dict[str, Any]:
        """Search businesses using Foursquare Places API (FREE tier: 1,000/day)"""
        if not self.foursquare_key:
            return {"results": []}

        url = "https://api.foursquare.com/v3/places/search"
        params = {
            "query": query,
            "ll": f"{lat},{lon}",
            "limit": limit,
            "radius": 5000  # 5km radius
        }
        headers = {
            "Authorization": self.foursquare_key,
            "Accept": "application/json"
        }

        r = requests.get(url, params=params, headers=headers)
        r.raise_for_status()
        return r.json()

    def search_businesses_overpass(self, lat: float, lon: float, business_type: str = "company", limit: int = 10) -> Dict[str, Any]:
        """Search businesses using OpenStreetMap Overpass API (100% FREE)"""
        # Convert business type to OSM amenity
        amenity_map = {
            "restaurant": "restaurant",
            "hotel": "hotel",
            "bank": "bank",
            "company": "office",
            "contractor": "general_contractor",
            "window": "craft=window_construction"
        }

        amenity = amenity_map.get(business_type, "office")

        # Create Overpass query
        query = f"""
        [out:json];
        (
          node["amenity"="{amenity}"](around:5000,{lat},{lon});
          way["amenity"="{amenity}"](around:5000,{lat},{lon});
        );
        out center meta;
        """

        url = "https://overpass-api.de/api/interpreter"
        data = {"data": query}

        r = requests.post(url, data=data)
        r.raise_for_status()
        return r.json()


# --------------------
# Example usage (commented out)
# --------------------


# maricopa = MaricopaAPI()
# props = maricopa.search_property("12345 W Example Dr")
# print(props)


# weather = OpenWeatherAPI("YOUR_OPENWEATHER_KEY")
# forecast = weather.onecall(33.415, -111.831, exclude=["minutely"])
# print(forecast)


# census = CensusAPI("YOUR_CENSUS_KEY")
# data = census.acs5(2023, ["B01003_001E", "B19013_001E"], "zip code tabulation area:85201")
# print(data)