#!/usr/bin/env python3
# morning_briefing.py - Daily Marketing Briefing for Window Company
# Run this every morning to see automated campaigns and next steps

import os
import json
from datetime import datetime, timedelta
from backend.marketing_automation import run_daily_campaigns, get_campaign_report

def print_header():
    """Print the morning briefing header"""
    now = datetime.now()
    print("🌅 GOOD MORNING - WINDOW COMPANY MARKETING BRIEFING")
    print("=" * 60)
    print(f"📅 Date: {now.strftime('%A, %B %d, %Y')}")
    print(f"⏰ Time: {now.strftime('%I:%M %p')}")
    print()

def print_campaign_summary(result):
    """Print summary of automated campaigns"""
    print("🎯 AUTOMATED CAMPAIGNS GENERATED")
    print("-" * 40)

    if result['campaigns']:
        print(f"✅ Generated {result['total_campaigns']} campaigns:")
        print(f"   🌡️ Weather-based: {result['weather_campaigns']}")
        print(f"   🏗️ Permit-based: {result['permit_campaigns']}")
        print(f"   🏢 Competitor-based: {result['competitor_campaigns']}")
        print()

        # Show campaign details
        for i, campaign in enumerate(result['campaigns'][:5], 1):  # Show first 5
            urgency_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(campaign['urgency'], "⚪")
            print(f"{i}. {urgency_emoji} {campaign['type'].upper()}")
            print(f"   📍 Target: {', '.join(campaign['target_zips'])}")
            print(f"   💬 {campaign['message'][:60]}...")
            print()
    else:
        print("⚠️ No campaigns generated today")
        print("   (This might be because API keys aren't set up yet)")
        print()

def print_action_items(result):
    """Print actionable next steps"""
    print("📋 TODAY'S ACTION ITEMS")
    print("-" * 40)

    if result['campaigns']:
        print("1. 📞 CALLING CAMPAIGN:")
        print("   - Review generated campaigns above")
        print("   - Call homeowners in target ZIP codes")
        print("   - Use campaign messaging as conversation starters")
        print()

        print("2. 📊 LEAD TRACKING:")
        print("   - Log all calls and responses")
        print("   - Track which campaigns perform best")
        print("   - Update CRM with new leads")
        print()

        print("3. 🎯 FOLLOW-UP:")
        print("   - Send personalized quotes within 24 hours")
        print("   - Schedule free thermal scans for interested customers")
        print("   - Book appointments for this week")
        print()
    else:
        print("1. 🔧 SETUP TASKS:")
        print("   - Set up API keys for live campaign generation")
        print("   - Test the marketing automation system")
        print("   - Review competitor data in database")
        print()

def print_performance_metrics():
    """Print performance metrics from previous campaigns"""
    print("📈 PERFORMANCE METRICS")
    print("-" * 40)

    try:
        report = get_campaign_report()
        roi_data = report.get('roi_tracking', {})

        if roi_data:
            total_leads = sum(data['total_leads'] for data in roi_data.values())
            total_revenue = sum(data['total_revenue'] for data in roi_data.values())
            total_campaigns = sum(data['campaign_count'] for data in roi_data.values())

            print(f"📞 Total Leads Generated: {total_leads}")
            print(f"💵 Total Revenue: ${total_revenue:,.2f}")            print(f"🎯 Total Campaigns Run: {total_campaigns}")
            print()

            # Show top performing campaigns
            if roi_data:
                print("🏆 TOP PERFORMING CAMPAIGNS:")
                sorted_campaigns = sorted(roi_data.items(), key=lambda x: x[1]['total_leads'], reverse=True)
                for campaign_type, data in sorted_campaigns[:3]:
                    print(f"   • {campaign_type.replace('_', ' ').title()}: {data['total_leads']} leads")
                print()
        else:
            print("📊 No performance data yet")
            print("   (Start running campaigns to see metrics here)")
            print()

    except Exception as e:
        print(f"⚠️ Could not load performance data: {e}")
        print()

def print_motivational_close():
    """Print motivational closing message"""
    print("💪 REMEMBER:")
    print("-" * 40)
    print("• Every 'No' brings you closer to a 'Yes'")
    print("• Free thermal scans convert at 40%+")
    print("• High-income areas = High-value customers")
    print("• Consistent daily activity = Consistent results")
    print()
    print("🚀 TODAY IS A GREAT DAY TO GROW YOUR BUSINESS!")
    print("   You've got this! 💪")
    print()

def main():
    """Run the morning marketing briefing"""
    try:
        # Generate fresh campaigns
        print_header()

        print("🔄 Generating today's automated campaigns...")
        result = run_daily_campaigns()
        print("✅ Campaign generation complete!\n")

        # Show the briefing
        print_campaign_summary(result)
        print_action_items(result)
        print_performance_metrics()
        print_motivational_close()

        # Save briefing to file
        briefing_file = os.path.join(os.path.dirname(__file__), 'morning_briefing_latest.txt')
        import sys
        from io import StringIO

        # Capture output
        old_stdout = sys.stdout
        sys.stdout = captured_output = StringIO()

        print_header()
        print_campaign_summary(result)
        print_action_items(result)
        print_performance_metrics()
        print_motivational_close()

        # Restore stdout and save to file
        sys.stdout = old_stdout
        with open(briefing_file, 'w') as f:
            f.write(captured_output.getvalue())

        print(f"💾 Briefing saved to: {briefing_file}")

    except Exception as e:
        print(f"❌ Error generating briefing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()