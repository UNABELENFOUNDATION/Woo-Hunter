from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import backend.db as db
import backend.ai_routes_template as ai_routes_template
import backend.leads as leads
import backend.market_data as market_data
from backend.api_monitor import get_usage_dashboard, monitor

# Load environment variables
load_dotenv()
load_dotenv('.env.local')  # Also load .env.local

app = FastAPI(title='WooConsulting Backend')

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve favicon to prevent 404 errors in logs
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("assets/favicon.png", media_type="image/png")

app.include_router(ai_routes_template.router)
app.include_router(leads.router)
app.include_router(market_data.router)

# API Usage Monitoring Routes
@app.get("/api/usage/dashboard")
def get_api_usage_dashboard():
    """Get complete API usage dashboard"""
    return get_usage_dashboard()

@app.get("/api/usage/status")
def get_api_usage_status():
    """Get current API usage status and budget warnings"""
    return monitor.get_budget_status()

@app.get("/api/usage/report/{days}")
def get_usage_report(days: int = 7):
    """Get usage report for specified number of days"""
    return monitor.get_usage_report(days=days)

@app.post("/api/usage/budget/{api_name}")
def update_budget_limits(api_name: str, limits: dict):
    """Update budget limits for an API"""
    monitor.update_budget_limits(api_name, limits)
    return {"status": "updated", "api": api_name, "limits": limits}

@app.get("/zip-codes/circle")
def get_zip_codes_in_circle(center: str, radius: float = 5.0):
    """
    Get all Maricopa County zip codes within a radius of a center zip code
    """
    from fastapi import HTTPException
    import json
    import os

    if not center or len(center) != 5 or not center.isdigit():
        raise HTTPException(status_code=400, detail="Invalid center zip code")

    if radius <= 0 or radius > 50:
        raise HTTPException(status_code=400, detail="Radius must be between 0 and 50 miles")

    # Load Maricopa zip codes
    DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
    ZIP_FILE = os.path.join(DATA_DIR, 'maricopa_zips.json')
    
    try:
        with open(ZIP_FILE, 'r') as f:
            MARICOPA_ZIPS = json.load(f)
    except FileNotFoundError:
        MARICOPA_ZIPS = []

    # For now, return a simple response based on radius
    if radius <= 5:
        return MARICOPA_ZIPS[:10]  # Return first 10 zips for small radius
    elif radius <= 15:
        return MARICOPA_ZIPS[:25]  # Return first 25 zips for medium radius
    else:
        return MARICOPA_ZIPS[:50]  # Return first 50 zips for large radius

@app.on_event('startup')
def startup_event():
    print("🔄 Starting application startup...")
    # Initialize DB with sample leads if not present
    try:
        print("📊 Initializing database...")
        db.init_db(seed=True)
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"⚠️ Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        # Don't crash the server if DB init fails
        pass
    # Initialize Firebase Admin SDK (optional)
    try:
        print("🔥 Initializing Firebase...")
        import backend.firebase_utils as firebase_utils
        firebase_utils.init_firebase()
        print("✅ Firebase initialized successfully")
    except Exception as e:
        print(f"⚠️ Firebase initialization failed: {e}")
        # This is optional, so don't crash
        pass
    print("🚀 Application startup complete!")

@app.get('/')
def root():
    return {'ok': True, 'msg': 'WooConsulting backend'}
