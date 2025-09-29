from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import List
import json
import os
from . import db
from .auth import verify_admin

router = APIRouter(prefix="/leads", tags=["leads"])

class LeadSearchRequest(BaseModel):
    zipcodes: List[str]
    limit: int = 100

class LeadAddRequest(BaseModel):
    company: str
    contact_name: str = None
    email: str = None
    phone: str = None
    website: str = None
    zipcode: str
    county: str = None
    notes: str = None

class ContactFormRequest(BaseModel):
    name: str
    email: str
    phone: str
    zipCode: str
    serviceType: str
    urgency: str
    message: str
    preferredContact: str
    source: str = "website_contact_form"
    status: str = "new"

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
MARICOPA_ZIPS_FILE = os.path.join(DATA_DIR, 'maricopa_zips.json')

try:
    with open(MARICOPA_ZIPS_FILE, 'r') as f:
        MARICOPA_ZIPS = set(json.load(f))
except Exception:
    MARICOPA_ZIPS = set()

@router.post('/search')
def search_leads(req: LeadSearchRequest, current_user=Depends(verify_admin)):
    if not req.zipcodes:
        raise HTTPException(status_code=400, detail='Provide at least one zipcode')
    # Normalize zips to strings and strip
    zips = [z.strip() for z in req.zipcodes if z]
    # Enforce Maricopa county constraint using the curated list
    invalid = [z for z in zips if z not in MARICOPA_ZIPS]
    if invalid:
        raise HTTPException(status_code=400, detail={'error': 'Zipcodes outside allowed Maricopa list', 'invalid': invalid})
    results = db.search_by_zipcodes(zips, limit=req.limit)
    return {'ok': True, 'count': len(results), 'leads': results}

@router.post('/add')
def add_lead(req: LeadAddRequest, background_tasks: BackgroundTasks, current_user=Depends(verify_admin)):
    zipcode = req.zipcode.strip()
    county = req.county or 'Maricopa'
    if zipcode not in MARICOPA_ZIPS:
        raise HTTPException(status_code=400, detail='Zipcode outside allowed Maricopa list')
    lead = req.dict()
    lead['county'] = county
    new_id = db.add_lead(lead)
    # Add id to lead for Firestore sync
    lead['id'] = new_id
    # Schedule Firestore sync (no-op if not configured)
    try:
        from .firebase_utils import add_lead_to_firestore
        background_tasks.add_task(add_lead_to_firestore, lead)
    except Exception:
        # If firebase_utils is unavailable, ignore and continue
        pass
    return {'ok': True, 'msg': 'Lead added', 'id': new_id}

@router.post('/submit')
def submit_contact_form(req: ContactFormRequest, background_tasks: BackgroundTasks):
    """Public endpoint for contact form submissions - creates real customer leads"""
    try:
        # Validate ZIP code is in Maricopa county
        zipcode = req.zipCode.strip()
        if zipcode not in MARICOPA_ZIPS:
            raise HTTPException(status_code=400, detail='Service area limited to Maricopa County, Arizona')

        # Convert contact form data to lead format
        lead = {
            'company': f"{req.name} - {req.serviceType.replace('_', ' ').title()}",
            'contact_name': req.name,
            'email': req.email,
            'phone': req.phone,
            'zipcode': zipcode,
            'county': 'Maricopa',
            'notes': f"""
Service Type: {req.serviceType.replace('_', ' ').title()}
Urgency: {req.urgency.title()}
Preferred Contact: {req.preferredContact.title()}
Message: {req.message}
Source: {req.source}
Status: {req.status}
Submitted: {req.__dict__.get('timestamp', 'Now')}
            """.strip(),
            'source': req.source,
            'urgency': req.urgency,
            'service_type': req.serviceType,
            'preferred_contact': req.preferredContact,
            'status': req.status
        }

        # Add to database
        new_id = db.add_lead(lead)

        # Add id to lead for Firestore sync
        lead['id'] = new_id

        # Schedule Firestore sync (no-op if not configured)
        try:
            from .firebase_utils import add_lead_to_firestore
            background_tasks.add_task(add_lead_to_firestore, lead)
        except Exception:
            # If firebase_utils is unavailable, ignore and continue
            pass

        # Log the real lead submission
        print(f"🎯 REAL LEAD SUBMITTED: {req.name} - {req.serviceType} - ${req.urgency} priority - ZIP {zipcode}")

        return {
            'ok': True,
            'message': 'Lead submitted successfully',
            'lead_id': new_id,
            'estimated_response': 'Within 2 hours during business hours'
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Contact form submission error: {e}")
        raise HTTPException(status_code=500, detail='Error processing contact form')

@router.get('/analytics')
def get_analytics():
    """Get live analytics data for dashboard"""
    try:
        analytics = db.get_analytics_data()
        return {
            'ok': True,
            'data': analytics
        }
    except Exception as e:
        print(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail='Error fetching analytics')
