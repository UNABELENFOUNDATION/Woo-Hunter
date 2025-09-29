from fastapi import APIRouter, HTTPException
import pgeocode
import json
import os
import math

router = APIRouter(prefix="/zip-codes", tags=["zip-codes"])

# Load Maricopa zip codes
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
ZIP_FILE = os.path.join(DATA_DIR, 'maricopa_zips.json')

try:
    with open(ZIP_FILE, 'r') as f:
        MARICOPA_ZIPS = json.load(f)
except FileNotFoundError:
    MARICOPA_ZIPS = []

# Initialize pgeocode
nomi = pgeocode.Nominatim('us')

def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in miles"""
    R = 3958.8  # Earth radius in miles
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.asin(math.sqrt(a))

@router.get("/circle")
def get_zip_codes_in_circle(center: str, radius: float = 5.0):
    """
    Get all Maricopa County zip codes within a radius of a center zip code
    """
    if not center or len(center) != 5 or not center.isdigit():
        raise HTTPException(status_code=400, detail="Invalid center zip code")

    if radius <= 0 or radius > 50:
        raise HTTPException(status_code=400, detail="Radius must be between 0 and 50 miles")

    # For now, return a simple test response
    return ["85254", "85255", "85253"]