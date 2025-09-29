# Competitor Data Automation

This system automatically updates competitor data to minimize Google Places API costs.

## How It Works

- **Daily Briefings**: Use cached competitor data (no API calls)
- **Weekly Updates**: Run update script once per week
- **Database Storage**: Competitors stored locally in SQLite

## Setup Instructions

### 1. Run Initial Update
```bash
# Start your backend server first
uvicorn backend.main:app --reload

# Then run the update script
python update_competitors.py
```

### 2. Schedule Weekly Updates (Windows)

#### Option A: Task Scheduler
1. Open Windows Task Scheduler
2. Create new task:
   - Name: "Update Woo Competitors"
   - Trigger: Weekly, every 1 week
   - Action: Start a program
   - Program: `C:\Users\solar\Desktop\woo win\update_competitors.bat`
   - Start in: `C:\Users\solar\Desktop\woo win`

#### Option B: Manual Weekly Run
Just double-click `update_competitors.bat` once per week.

### 3. Verify It's Working
- Check the console output for success messages
- Generate a briefing - should include competitor names
- Costs: ~$0.005 per weekly update instead of $0.11-0.21 daily

## Cost Savings

| Frequency | Old Cost | New Cost | Savings |
|-----------|----------|----------|---------|
| Daily | $0.11-0.21 | $0.005 | 95-98% |
| Weekly | $0.77-1.47 | $0.005 | 99% |
| Monthly | $3.30-6.30 | $0.02 | 99.5% |

## Data Provided

For automation, you need:
- **ZIP Code**: Your service area (default: 85254)
- **Coordinates**: Lat/Lng for your location (default: Scottsdale area)
- **Schedule**: How often to update (recommend weekly)

That's it! The system handles the rest automatically.