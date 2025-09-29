#!/usr/bin/env python3
"""
Competitor Data Update Script
Run this weekly/monthly to update competitor data with minimal API costs.

Usage:
- Weekly: python update_competitors.py
- Or schedule with Windows Task Scheduler/cron
"""

import requests
import json
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8000"  # Update if your backend runs on different port
ZIP_CODE = "85254"
LAT = 33.494
LON = -111.926

def update_competitors():
    """Update competitor data via API"""
    url = f"{BACKEND_URL}/api/update-competitors"

    params = {
        "zip_code": ZIP_CODE,
        "lat": LAT,
        "lon": LON
    }

    try:
        print(f"🔄 Updating competitor data for ZIP {ZIP_CODE}...")
        response = requests.post(url, params=params)
        response.raise_for_status()

        result = response.json()
        print(f"✅ Success! Found {result['competitors_found']} competitors")
        print(f"📅 Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    except requests.exceptions.ConnectionError:
        print("❌ Error: Backend server not running. Start with: uvicorn backend.main:app --reload")
    except Exception as e:
        print(f"❌ Error updating competitors: {e}")

if __name__ == "__main__":
    update_competitors()