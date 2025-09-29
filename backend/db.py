import sqlite3
import os
from typing import List, Dict

DB_PATH = os.path.join(os.path.dirname(__file__), 'leads.db')

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(seed: bool = True):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company TEXT,
            contact_name TEXT,
            email TEXT,
            phone TEXT,
            website TEXT,
            zipcode TEXT,
            county TEXT,
            notes TEXT,
            status TEXT DEFAULT 'new',
            source TEXT DEFAULT 'manual',
            urgency TEXT DEFAULT 'normal',
            service_type TEXT DEFAULT 'general',
            preferred_contact TEXT DEFAULT 'email',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS competitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT,
            rating REAL,
            total_ratings INTEGER,
            latitude REAL,
            longitude REAL,
            place_id TEXT,
            place_type TEXT DEFAULT 'general_contractor',
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            zip_code TEXT
        )
    ''')
    conn.commit()
    if seed:
        seed_sample_leads(conn)
    conn.close()

def seed_sample_leads(conn):
    # Add a few example leads in Maricopa zips for testing
    sample = [
        ("AZ Windows Co","John Doe","john@azwindows.example","602-555-0101","https://azwindows.example","85001","Maricopa","Installed windows"),
        ("Desert Baths","Jane Roe","jane@desertbaths.example","480-555-0202","https://desertbaths.example","85201","Maricopa","Bathroom remodels"),
        ("Phoenix Glass","Bill Smith","bill@phoenixglass.example","623-555-0303","https://phoenixglass.example","85003","Maricopa","Glass repairs"),
    ]
    cur = conn.cursor()
    cur.executemany('''
        INSERT INTO leads (company, contact_name, email, phone, website, zipcode, county, notes)
        VALUES (?,?,?,?,?,?,?,?)
    ''', sample)
    conn.commit()

def search_by_zipcodes(zipcodes: List[str], limit: int = 100) -> List[Dict]:
    conn = get_conn()
    cur = conn.cursor()
    placeholders = ','.join('?' for _ in zipcodes)
    query = f"SELECT * FROM leads WHERE zipcode IN ({placeholders}) AND county = 'Maricopa' LIMIT ?"
    params = zipcodes + [limit]
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def add_lead(lead: Dict):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO leads (company, contact_name, email, phone, website, zipcode, county, notes, status, source, urgency, service_type, preferred_contact)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', (
        lead.get('company'),
        lead.get('contact_name'),
        lead.get('email'),
        lead.get('phone'),
        lead.get('website'),
        lead.get('zipcode'),
        lead.get('county'),
        lead.get('notes'),
        lead.get('status', 'new'),
        lead.get('source', 'manual'),
        lead.get('urgency', 'normal'),
        lead.get('service_type', 'general'),
        lead.get('preferred_contact', 'email'),
    ))
    conn.commit()
    last_id = cur.lastrowid
    conn.close()
    return last_id

# Competitor data functions
def save_competitors(competitors: List[Dict], zip_code: str):
    """Save competitor data to database"""
    conn = get_conn()
    cur = conn.cursor()
    
    # Clear old data for this zip code
    cur.execute('DELETE FROM competitors WHERE zip_code = ?', (zip_code,))
    
    # Insert new data
    for comp in competitors:
        cur.execute('''
            INSERT INTO competitors (name, address, rating, total_ratings, latitude, longitude, place_id, place_type, zip_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            comp.get('name', ''),
            comp.get('address', ''),
            comp.get('rating'),
            comp.get('total_ratings', 0),
            comp.get('latitude'),
            comp.get('longitude'),
            comp.get('place_id'),
            comp.get('place_type', 'general_contractor'),
            zip_code
        ))
    
    conn.commit()
    conn.close()

def get_competitors(zip_code: str, limit: int = 5) -> List[Dict]:
    """Get competitor data from database"""
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute('''
        SELECT name, address, rating, total_ratings, latitude, longitude, place_id
        FROM competitors 
        WHERE zip_code = ? 
        ORDER BY rating DESC, total_ratings DESC 
        LIMIT ?
    ''', (zip_code, limit))
    results = [dict(row) for row in rows]
    conn.close()
    return results

def get_competitor_last_updated(zip_code: str) -> str:
    """Get when competitor data was last updated"""
    conn = get_conn()
    cur = conn.cursor()
    row = cur.execute('''
        SELECT MAX(last_updated) as last_updated 
        FROM competitors 
        WHERE zip_code = ?
    ''', (zip_code,)).fetchone()
    conn.close()
    return row['last_updated'] if row and row['last_updated'] else None

def get_analytics_data():
    """Get live analytics data for dashboard"""
    conn = get_conn()
    cur = conn.cursor()

    try:
        # Get total leads count
        total_leads = cur.execute('SELECT COUNT(*) as count FROM leads').fetchone()['count']

        # Get leads from today (fallback if created_at doesn't exist)
        try:
            today_leads = cur.execute('''
                SELECT COUNT(*) as count FROM leads
                WHERE DATE(created_at) = DATE('now')
            ''').fetchone()['count']
        except:
            today_leads = 0  # Fallback if created_at column doesn't exist

        # Get leads from this week
        try:
            week_leads = cur.execute('''
                SELECT COUNT(*) as count FROM leads
                WHERE created_at >= datetime('now', '-7 days')
            ''').fetchone()['count']
        except:
            week_leads = total_leads  # Fallback

        # Get leads by status (fallback if status doesn't exist)
        try:
            status_counts = cur.execute('''
                SELECT status, COUNT(*) as count FROM leads GROUP BY status
            ''').fetchall()
        except:
            status_counts = [{'status': 'new', 'count': total_leads}]  # Fallback

        # Get leads by urgency (fallback if urgency doesn't exist)
        try:
            urgency_counts = cur.execute('''
                SELECT urgency, COUNT(*) as count FROM leads GROUP BY urgency
            ''').fetchall()
        except:
            urgency_counts = [{'urgency': 'normal', 'count': total_leads}]  # Fallback

        # Get leads by service type (fallback if service_type doesn't exist)
        try:
            service_counts = cur.execute('''
                SELECT service_type, COUNT(*) as count FROM leads GROUP BY service_type
            ''').fetchall()
        except:
            service_counts = [{'service_type': 'general', 'count': total_leads}]  # Fallback

        # Calculate conversion rate (assuming 'converted' status means appointment set)
        converted_count = sum(row['count'] for row in status_counts if row['status'] == 'converted')
        conversion_rate = (converted_count / total_leads * 100) if total_leads > 0 else 0

        # Calculate average cost per acquisition (mock calculation - in real app this would be actual costs)
        cost_per_acquisition = 152.80 - (today_leads * 2.5)  # Decrease cost as volume increases

    except Exception as e:
        print(f"Analytics error: {e}")
        # Return default values if anything fails
        total_leads = 0
        today_leads = 0
        week_leads = 0
        converted_count = 0
        conversion_rate = 0
        cost_per_acquisition = 152.80
        status_counts = []
        urgency_counts = []
        service_counts = []

    conn.close()

    return {
        'total_leads': total_leads,
        'today_leads': today_leads,
        'week_leads': week_leads,
        'conversion_rate': round(conversion_rate, 1),
        'appointments_set': converted_count,
        'cost_per_acquisition': round(cost_per_acquisition, 2),
        'status_breakdown': {row['status']: row['count'] for row in status_counts},
        'urgency_breakdown': {row['urgency']: row['count'] for row in urgency_counts},
        'service_breakdown': {row['service_type']: row['count'] for row in service_counts}
    }
