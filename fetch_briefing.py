#!/usr/bin/env python3
"""
Fetch Data from URL
A simple script to fetch data from any URL and display it.
Supports both JSON and plain text responses.
Can save JSON responses to file with --save option.
"""

import requests
import json
import sys
import os
from datetime import datetime

def fetch_url(url: str):
    """
    Fetch data from a URL and display it.
    Automatically detects JSON vs plain text.
    """
    try:
        print(f"🌐 Fetching: {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        print(f"✅ Status: {response.status_code}")
        print(f"📄 Content-Type: {response.headers.get('content-type', 'unknown')}")

        # Try JSON first
        try:
            data = response.json()
            print("\n📋 JSON Response:")
            print(json.dumps(data, indent=2))
        except ValueError:
            # Not JSON → just print raw text
            print("\n📄 Text Response:")
            print(response.text)

    except requests.exceptions.Timeout:
        print("❌ Request timed out (10s limit)", file=sys.stderr)
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - check if server is running", file=sys.stderr)
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP error: {e}", file=sys.stderr)
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}", file=sys.stderr)

def main():
    """Main function with multiple usage examples"""
    if len(sys.argv) < 2:
        print("🚀 WooConsulting Data Fetcher")
        print()
        print("Usage: python fetch_briefing.py <URL>")
        print()
        print("Examples:")
        print("  python fetch_briefing.py http://localhost:8001/")
        print("  python fetch_briefing.py http://localhost:8001/api/usage/status")
        print("  python fetch_briefing.py http://localhost:8001/api/briefing-data")
        print("  python fetch_briefing.py http://localhost:8001/api/competitors?zip_code=85254")
        print("  python fetch_briefing.py https://api.github.com/user")
        print()
        print("� Make sure your backend server is running on port 8001")
        sys.exit(1)

    url = sys.argv[1]
    fetch_url(url)

if __name__ == "__main__":
    main()