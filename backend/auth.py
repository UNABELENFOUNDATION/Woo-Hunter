from fastapi import Request, HTTPException, Depends
import os
import logging
import json

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth
except Exception:
    firebase_admin = None
    firebase_auth = None

# ADMIN_UID: prefer environment var, fallback to backend/admin_config.json for visibility
ADMIN_UID = os.environ.get('ADMIN_UID')
if not ADMIN_UID:
    try:
        config_path = os.path.join(os.path.dirname(__file__), 'admin_config.json')
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                conf = json.load(f)
            ADMIN_UID = conf.get('admin_uid')
    except Exception:
        ADMIN_UID = None


def verify_admin(request: Request):
    """Dependency: verifies Firebase ID token in Authorization header and enforces ADMIN_UID if set."""
    if firebase_auth is None:
        logging.debug('firebase_admin not available; authentication disabled')
        return None

    header = request.headers.get('Authorization')
    if not header or not header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Missing or invalid Authorization header')
    id_token = header.split(' ', 1)[1]
    try:
        decoded = firebase_auth.verify_id_token(id_token)
    except Exception as e:
        logging.exception('Failed to verify ID token: %s', e)
        raise HTTPException(status_code=401, detail='Invalid ID token')

    uid = decoded.get('uid')
    if ADMIN_UID and uid != ADMIN_UID:
        raise HTTPException(status_code=403, detail='Forbidden: requires admin')

    # Return decoded token for callers that need it
    return decoded
