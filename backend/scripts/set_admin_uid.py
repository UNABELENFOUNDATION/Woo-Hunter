"""
Set the admin UID for the backend by looking up a Firebase user by email and writing it to backend/admin_config.json.
Usage (after installing dependencies and ensuring FIREBASE_SERVICE_ACCOUNT_PATH is set):
  python backend/scripts/set_admin_uid.py --email admin@example.com

This script requires the firebase-admin SDK and a service account JSON at the path specified by FIREBASE_SERVICE_ACCOUNT_PATH or backend/service_account.json.
"""
import argparse
import json
import os
import sys

try:
    import firebase_admin
    from firebase_admin import credentials, auth
except Exception as e:
    print("Missing firebase_admin. Install with: pip install firebase-admin")
    raise


def init_firebase(sa_path: str = None, project_id: str = None):
    if firebase_admin._apps:
        return
    if not sa_path:
        sa_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_PATH') or os.path.join(os.path.dirname(__file__), '..', 'service_account.json')
    if not os.path.exists(sa_path):
        raise RuntimeError(f'Service account not found at {sa_path}. Set FIREBASE_SERVICE_ACCOUNT_PATH or place service account at backend/service_account.json')
    cred = credentials.Certificate(sa_path)
    firebase_admin.initialize_app(cred, {'projectId': project_id} if project_id else None)


def set_admin_uid_by_email(email: str, output_path: str = None):
    if not output_path:
        output_path = os.path.join(os.path.dirname(__file__), '..', 'admin_config.json')
    try:
        user = auth.get_user_by_email(email)
    except Exception as e:
        print(f'Failed to find user by email {email}: {e}')
        sys.exit(2)
    uid = user.uid
    # Write to admin_config.json (keep readable)
    conf = {"admin_uid": uid}
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(conf, f, indent=2)
    print(f'Wrote admin UID {uid} to {output_path}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Set admin UID by Firebase email')
    parser.add_argument('--email', required=True, help='Admin user email in Firebase Auth')
    parser.add_argument('--service-account', required=False, help='Path to service account JSON')
    parser.add_argument('--project-id', required=False, help='Firebase project id (optional)')
    args = parser.parse_args()

    init_firebase(sa_path=args.service_account, project_id=args.project_id)
    set_admin_uid_by_email(args.email)
