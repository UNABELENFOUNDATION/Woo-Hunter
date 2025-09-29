"""
Generate a list of Maricopa County zipcodes within specified Arizona cities.
Requires: pgeocode

Outputs: backend/data/maricopa_zips.json (overwrites after backup)
"""
import pgeocode
import json
import os

# Arizona cities to include
ARIZONA_CITIES = [
    'Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Gilbert',
    'Glendale', 'Peoria', 'Surprise', 'Goodyear', 'Avondale', 'Tolleson',
    'Litchfield Park', 'Buckeye', 'Maricopa', 'Queen Creek', 'San Tan Valley',
    'Fountain Hills', 'Cave Creek', 'Carefree', 'Paradise Valley'
]

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
OUTPUT_FILE = os.path.join(DATA_DIR, 'maricopa_zips.json')
BACKUP_FILE = os.path.join(DATA_DIR, 'maricopa_zips.backup.json')

# Range of zipcodes to check — Arizona generally falls in 850xx-865xx ranges
ZIP_START = 85000
ZIP_END = 86600

nomi = pgeocode.Nominatim('us')

def get_city_zips():
    found = []
    for z in range(ZIP_START, ZIP_END+1):
        zip_str = f"{z:05d}"
        info = nomi.query_postal_code(zip_str)
        if info is None or info.place_name is None:
            continue

        # Check if the city is in our target list
        city_name = info.place_name.split(',')[0]  # Get city name before comma
        if city_name in ARIZONA_CITIES:
            # Additional check for Maricopa County if available
            county = getattr(info, 'county_name', '')
            if not county or 'maricopa' in county.lower():
                found.append(zip_str)

    return found

# Backup existing file
if os.path.exists(OUTPUT_FILE):
    try:
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            existing = json.load(f)
        with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
            json.dump(existing, f, indent=2)
        print(f'Backed up existing {OUTPUT_FILE} to {BACKUP_FILE}')
    except Exception as e:
        print('Warning: failed to backup existing file:', e)

found_sorted = sorted(set(found))
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(found_sorted, f, indent=2)

print(f'Wrote {len(found_sorted)} zipcodes to {OUTPUT_FILE}')
print(found_sorted)
