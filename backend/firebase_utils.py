import os
import logging
from typing import Optional

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except Exception:
    firebase_admin = None
    firestore = None

_initialized = False
_db: Optional['firestore.Client'] = None


def init_firebase():
    global _initialized, _db
    if _initialized:
        return
    sa_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_PATH')
    project_id = os.environ.get('FIREBASE_PROJECT_ID')
    if not sa_path or not os.path.exists(sa_path) or firebase_admin is None:
        logging.info('Firebase service account not configured or firebase-admin not installed; skipping Firebase init')
        return
    try:
        cred = credentials.Certificate(sa_path)
        firebase_admin.initialize_app(cred, {'projectId': project_id})
        _db = firestore.client()
        _initialized = True
        logging.info('Initialized Firebase Admin and Firestore client')
    except Exception as e:
        logging.exception('Failed to initialize Firebase Admin SDK: %s', e)


def add_lead_to_firestore(lead: dict):
    """Attempt to write a lead document to Firestore; safe no-op if Firestore not configured."""
    global _db
    if not _initialized or _db is None:
        logging.debug('Firestore not initialized; skipping add_lead_to_firestore')
        return
    try:
        # Use the SQLite id as the Firestore doc id when available
        doc_id = str(lead.get('id')) if lead.get('id') else None
        data = lead.copy()
        # Optional: avoid storing raw PII in plaintext if configured -> left as-is for now
        if doc_id:
            _db.collection('leads').document(doc_id).set(data)
        else:
            _db.collection('leads').add(data)
        logging.info('Lead synced to Firestore (id=%s)', doc_id)
    except Exception:
        logging.exception('Failed to write lead to Firestore')
