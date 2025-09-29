# wooCost.py - Cost Tracking for Woo Consulting
# Tracks API usage and costs (or savings from free alternatives)

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List

COST_LOG_FILE = os.path.join(os.path.dirname(__file__), 'cost_log.json')

class WooCostTracker:
    """Tracks API costs and savings from free alternatives"""

    def __init__(self):
        self.ensure_cost_log()

    def ensure_cost_log(self):
        """Create cost log file if it doesn't exist"""
        if not os.path.exists(COST_LOG_FILE):
            initial_data = {
                "total_savings": 0.0,
                "monthly_savings": 0.0,
                "api_calls": {
                    "google_maps": 0,
                    "google_places": 0,
                    "free_geocoding": 0,
                    "free_elevation": 0,
                    "free_timezone": 0
                },
                "costs_avoided": {
                    "google_maps_per_call": 0.005,
                    "google_places_per_call": 0.0025,
                    "last_updated": datetime.now().isoformat()
                },
                "monthly_stats": []
            }
            with open(COST_LOG_FILE, 'w') as f:
                json.dump(initial_data, f, indent=2)

    def load_data(self) -> Dict:
        """Load cost tracking data"""
        try:
            with open(COST_LOG_FILE, 'r') as f:
                return json.load(f)
        except:
            self.ensure_cost_log()
            return self.load_data()

    def save_data(self, data: Dict):
        """Save cost tracking data"""
        with open(COST_LOG_FILE, 'w') as f:
            json.dump(data, f, indent=2)

    def log_free_api_call(self, api_name: str):
        """Log a free API call (no cost)"""
        data = self.load_data()
        if api_name in data["api_calls"]:
            data["api_calls"][api_name] += 1

            # Calculate savings based on Google equivalent
            savings_map = {
                "free_geocoding": 0.005,  # Google Geocoding
                "free_elevation": 0.005,  # Google Elevation
                "free_timezone": 0.005,   # Google Time Zone
            }

            if api_name in savings_map:
                data["total_savings"] += savings_map[api_name]
                data["monthly_savings"] += savings_map[api_name]

        data["costs_avoided"]["last_updated"] = datetime.now().isoformat()
        self.save_data(data)

    def get_monthly_report(self) -> Dict:
        """Get monthly cost savings report"""
        data = self.load_data()

        # Calculate potential Google costs
        google_maps_cost = data["api_calls"]["google_maps"] * data["costs_avoided"]["google_maps_per_call"]
        google_places_cost = data["api_calls"]["google_places"] * data["costs_avoided"]["google_places_per_call"]

        return {
            "free_api_calls": data["api_calls"],
            "total_savings": round(data["total_savings"], 2),
            "monthly_savings": round(data["monthly_savings"], 2),
            "google_equivalent_cost": round(google_maps_cost + google_places_cost, 2),
            "last_updated": data["costs_avoided"]["last_updated"]
        }

    def reset_monthly(self):
        """Reset monthly counters"""
        data = self.load_data()
        data["monthly_savings"] = 0.0
        data["api_calls"] = {k: 0 for k in data["api_calls"]}
        self.save_data(data)

# Global cost tracker instance
cost_tracker = WooCostTracker()

# Quick functions for easy use
def log_free_call(api_name: str):
    """Log a free API call"""
    cost_tracker.log_free_api_call(api_name)

def get_cost_report():
    """Get cost savings report"""
    return cost_tracker.get_monthly_report()

def reset_monthly_costs():
    """Reset monthly cost tracking"""
    cost_tracker.reset_monthly()

if __name__ == "__main__":
    # Test the cost tracker
    print("🧮 WooCost Tracker Test")
    print("=" * 30)

    # Log some free API calls
    log_free_call("free_geocoding")
    log_free_call("free_elevation")
    log_free_call("free_timezone")

    # Get report
    report = get_cost_report()
    print(f"Free API Calls: {report['free_api_calls']}")
    print(f"Total Savings: ${report['total_savings']}")
    print(f"Monthly Savings: ${report['monthly_savings']}")
    print(f"Google Equivalent: ${report['google_equivalent_cost']}")

    print("\n✅ Cost tracking working!")