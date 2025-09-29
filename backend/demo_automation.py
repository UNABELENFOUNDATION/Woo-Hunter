#!/usr/bin/env python3
# demo_automation.py - Demo marketing automation without API keys
# Shows how the system works with mock data

import os
import json
from datetime import datetime

# Mock data for demonstration
MOCK_WEATHER_DATA = {
    "current": {
        "temp": 105,  # Heat wave!
        "weather": [{"main": "Clear"}]
    }
}

MOCK_COMPETITORS = [
    {"name": "Bob's Windows", "rating": 3.5, "total_ratings": 8},
    {"name": "Desert Glass Co", "rating": 4.2, "total_ratings": 15},
    {"name": "Arizona Window Pros", "rating": 2.8, "total_ratings": 3}
]

def demo_weather_campaigns():
    """Demo weather-based campaigns"""
    print("🌡️ WEATHER CAMPAIGN DEMO")
    print("-" * 30)

    temp = MOCK_WEATHER_DATA["current"]["temp"]
    print(f"Current Phoenix temperature: {temp}°F")

    campaigns = []
    if temp > 100:
        campaigns.append({
            "type": "heat_wave",
            "trigger": f"Temperature: {temp}°F",
            "message": "🌡️ PHOENIX HEAT WAVE ALERT: Beat the heat with energy-efficient windows! FREE thermal scan reveals hidden energy loss.",
            "target_zips": ["85254", "85032", "85308"],
            "urgency": "high"
        })

    for campaign in campaigns:
        print(f"📢 Generated: {campaign['type'].upper()}")
        print(f"   Trigger: {campaign['trigger']}")
        print(f"   Message: {campaign['message'][:60]}...")
        print(f"   Target ZIPs: {', '.join(campaign['target_zips'])}")
        print()

    return campaigns

def demo_competitor_campaigns():
    """Demo competitor-based campaigns"""
    print("🏢 COMPETITOR CAMPAIGN DEMO")
    print("-" * 30)

    campaigns = []
    for comp in MOCK_COMPETITORS:
        rating = comp.get('rating', 0)
        total_ratings = comp.get('total_ratings', 0)

        if rating < 4.0 or total_ratings < 10:
            campaigns.append({
                "type": "competitor_weakness",
                "trigger": f"Competitor: {comp['name']} ({rating}★, {total_ratings} reviews)",
                "message": f"🏆 SUPERIOR SERVICE GUARANTEE: Unlike {comp['name']}, we offer FREE FLIR thermal scans, lifetime warranty, and 5-star reviews from 500+ happy customers!",
                "target_zips": ["85254", "85255", "85258"],
                "urgency": "medium",
                "competitor": comp['name']
            })

    for campaign in campaigns:
        print(f"📢 Generated: {campaign['type'].upper()}")
        print(f"   Trigger: {campaign['trigger']}")
        print(f"   Message: {campaign['message'][:60]}...")
        print(f"   Targeting: {campaign['competitor']}")
        print()

    return campaigns

def demo_permit_campaigns():
    """Demo permit-based campaigns"""
    print("🏗️ PERMIT CAMPAIGN DEMO")
    print("-" * 30)

    # Mock high-income ZIP codes
    high_income_zips = [
        {"zip": "85253", "income": 125000},
        {"zip": "85255", "income": 118000},
        {"zip": "85018", "income": 98000}
    ]

    campaigns = []
    for zip_data in high_income_zips:
        if zip_data["income"] > 100000:
            campaigns.append({
                "type": "luxury_remodel",
                "trigger": f"High-income ZIP: {zip_data['zip']} (${zip_data['income']:,} median)",
                "message": f"🏡 {zip_data['zip']} LUXURY HOME ALERT: Premium window upgrades for discerning homeowners. FLIR thermal imaging included FREE.",
                "target_zips": [zip_data['zip']],
                "urgency": "high",
                "demographics": {
                    "median_income": zip_data['income'],
                    "zip_code": zip_data['zip']
                }
            })

    for campaign in campaigns:
        print(f"📢 Generated: {campaign['type'].upper()}")
        print(f"   Trigger: {campaign['trigger']}")
        print(f"   Message: {campaign['message'][:60]}...")
        print()

    return campaigns

def main():
    """Run the marketing automation demo"""
    print("🚀 MARKETING AUTOMATION DEMO")
    print("=" * 50)
    print("This demo shows how FREE APIs power automated campaigns")
    print("In production, these would use real weather, census, and competitor data\n")

    # Run all campaign types
    weather_campaigns = demo_weather_campaigns()
    competitor_campaigns = demo_competitor_campaigns()
    permit_campaigns = demo_permit_campaigns()

    # Summary
    total_campaigns = len(weather_campaigns) + len(competitor_campaigns) + len(permit_campaigns)

    print("📊 CAMPAIGN SUMMARY")
    print("-" * 30)
    print(f"Total Automated Campaigns: {total_campaigns}")
    print(f"Weather-Based: {len(weather_campaigns)}")
    print(f"Competitor-Based: {len(competitor_campaigns)}")
    print(f"Permit-Based: {len(permit_campaigns)}")

    print("\n💰 COST SAVINGS")
    print("-" * 30)
    print("• Google Maps API: $0 (vs $0.005-$0.0025 per call)")
    print("• OpenWeather API: FREE (vs $0.0006 per call)")
    print("• Census Bureau API: FREE (vs paid alternatives)")
    print("• OpenStreetMap: FREE (vs Google Maps)")
    print("• Foursquare Places: FREE tier (vs Google Places)")

    print("\n✅ MARKETING AUTOMATION READY!")
    print("Set up API keys and run daily_automation.py for live campaigns")

if __name__ == "__main__":
    main()