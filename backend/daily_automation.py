#!/usr/bin/env python3
# daily_automation.py - Run daily marketing automation tasks
# Usage: python daily_automation.py

import os
import sys
import json
from datetime import datetime

# Add backend directory to path
sys.path.append(os.path.dirname(__file__))

from marketing_automation import run_daily_campaigns, get_campaign_report

def main():
    """Run daily automation tasks"""
    print("🚀 Running Daily Marketing Automation...")
    print("=" * 50)

    try:
        # Run all automated campaigns
        result = run_daily_campaigns()

        print(f"✅ Campaigns Generated: {result['total_campaigns']}")
        print(f"   Weather Campaigns: {result['weather_campaigns']}")
        print(f"   Permit Campaigns: {result['permit_campaigns']}")
        print(f"   Competitor Campaigns: {result['competitor_campaigns']}")

        # Show active campaigns
        if result['campaigns']:
            print("\n📢 Active Campaigns:")
            for i, campaign in enumerate(result['campaigns'], 1):
                print(f"{i}. {campaign['type'].upper()}: {campaign['trigger']}")
                print(f"   Target ZIPs: {', '.join(campaign['target_zips'])}")
                print(f"   Urgency: {campaign['urgency']}")
                print(f"   Message: {campaign['message'][:80]}...")
                print()

        # Get performance report
        report = get_campaign_report()
        print("📊 Campaign Performance:")
        print(f"   Total ROI Tracking: {len(report['roi_tracking'])} campaign types")

        for campaign_type, data in report['roi_tracking'].items():
            leads = data['total_leads']
            revenue = data['total_revenue']
            count = data['campaign_count']
            print(f"   {campaign_type}: {leads} leads, ${revenue:,.2f} revenue from {count} campaigns")

        # Save results to log file
        log_file = os.path.join(os.path.dirname(__file__), 'automation_log.json')
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "campaigns_generated": result['total_campaigns'],
            "campaign_details": result['campaigns']
        }

        # Load existing log or create new
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                log_data = json.load(f)
        else:
            log_data = {"automation_runs": []}

        log_data["automation_runs"].append(log_entry)

        # Keep only last 30 days
        log_data["automation_runs"] = log_data["automation_runs"][-30:]

        with open(log_file, 'w') as f:
            json.dump(log_data, f, indent=2, default=str)

        print(f"\n✅ Automation complete! Results saved to {log_file}")

    except Exception as e:
        print(f"❌ Automation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()