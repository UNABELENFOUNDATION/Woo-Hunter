# 🚀 Marketing Automation System

**100% FREE automated marketing campaigns** powered by weather, permits, and competitor data. Eliminates Google Maps API costs while generating hyper-targeted leads.

## 🎯 What It Does

Automatically generates marketing campaigns based on:
- **Weather Triggers**: Heat waves, monsoons, cold fronts
- **Permit Triggers**: Construction activity in high-income areas
- **Competitor Triggers**: Position against low-rated competitors

## 💰 Cost Savings

| Service | Cost with Google | Cost with FREE APIs | Savings |
|---------|------------------|-------------------|---------|
| Maps/Geocoding | $0.005/call | **$0** | 100% |
| Places API | $0.0025/call | **$0** | 100% |
| Weather Data | $0.0006/call | **$0** | 100% |
| Census Data | Paid services | **$0** | 100% |

## 🛠️ Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up API Keys (Optional but Recommended)
Create a `.env` file in the backend directory:
```bash
OPENWEATHER_API_KEY=your_openweather_key
FOURSQUARE_API_KEY=your_foursquare_key
CENSUS_API_KEY=your_census_key  # Optional
```

### 3. Initialize Database
```bash
python -c "from db import init_db; init_db()"
```

## 🚀 Usage

### Run Daily Automation
```bash
python daily_automation.py
```

### Test with Demo Data
```bash
python demo_automation.py
```

### API Endpoints

#### Run Campaigns
```bash
curl http://localhost:8000/api/marketing/run-campaigns
```

#### Get Campaign Report
```bash
curl http://localhost:8000/api/marketing/campaign-report
```

#### Track ROI
```bash
curl -X POST "http://localhost:8000/api/marketing/track-roi?campaign_type=heat_wave&leads=5&revenue=1500"
```

## 📊 Campaign Types

### 🌡️ Weather Campaigns
- **Heat Wave** (>100°F): Energy efficiency messaging
- **Monsoon** (rain): Water damage prevention
- **Cold Front** (<60°F): Energy savings focus

### 🏗️ Permit Campaigns
- Targets high-income ZIP codes ($100K+ median)
- Luxury home positioning
- Premium service messaging

### 🏢 Competitor Campaigns
- Identifies competitors with <4.0 rating or <10 reviews
- Superior service positioning
- Social proof messaging

## 🎨 Frontend Dashboard

The `MarketingDashboard.tsx` component provides:
- One-click campaign generation
- Real-time campaign display
- ROI tracking visualization
- Performance analytics

## 📈 ROI Tracking

Track campaign performance:
```python
from marketing_automation import track_campaign_roi

# After a campaign generates leads
track_campaign_roi("heat_wave", leads=3, revenue=750.0)
```

## 🔧 Technical Details

### FREE APIs Used
- **OpenWeather API**: Weather triggers
- **U.S. Census Bureau**: Demographics for targeting
- **Foursquare Places**: Competitor data (FREE tier: 1,000/day)
- **OpenStreetMap**: Fallback mapping and places

### Database Schema
- `campaigns_log.json`: Campaign history and ROI tracking
- `automation_log.json`: Daily automation results
- SQLite database: Competitor and lead storage

### Automation Flow
1. Check weather conditions via OpenWeather
2. Analyze permit activity via Census demographics
3. Scan competitors from database
4. Generate targeted campaigns
5. Log results for ROI tracking

## 📋 Daily Automation Script

Set up a cron job or scheduled task:
```bash
# Windows Task Scheduler
# Command: python daily_automation.py
# Schedule: Daily at 9:00 AM

# Linux/Mac cron
# 0 9 * * * cd /path/to/backend && python daily_automation.py
```

## 🎯 Sample Campaign Output

```
📢 HEAT_WAVE: Temperature: 105°F
   🌡️ PHOENIX HEAT WAVE ALERT: Beat the heat with energy-efficient windows!
   FREE thermal scan reveals hidden energy loss.
   Target ZIPs: 85254, 85032, 85308

📢 COMPETITOR_WEAKNESS: Competitor: Bob's Windows (3.5★, 8 reviews)
   🏆 SUPERIOR SERVICE GUARANTEE: Unlike Bob's Windows, we offer FREE FLIR
   thermal scans, lifetime warranty, and 5-star reviews!
   Targeting: Bob's Windows
```

## ✅ Success Metrics

- **100% cost reduction** on mapping and weather APIs
- **Automated lead generation** without manual targeting
- **Hyper-local campaigns** based on real-time data
- **Competitive positioning** against weaker competitors
- **ROI tracking** for campaign optimization

## 🔄 Integration

The marketing automation integrates seamlessly with:
- Existing competitor database
- Cost tracking system (`wooCost.py`)
- Frontend dashboard
- Lead management system

**Ready to generate FREE, automated marketing campaigns! 🎯**