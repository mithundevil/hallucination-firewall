import json
import os
from datetime import datetime

HISTORY_FILE = 'history.json'

def save_to_history(scan_type, result):
    """
    Saves a scan result to a local JSON file.
    """
    history = []
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
        except Exception:
            history = []

    # Prepare historical record
    record = {
        "id": datetime.now().strftime("%Y%m%d%H%M%S%f"),
        "timestamp": datetime.now().isoformat(),
        "type": scan_type,
        "verdict": result.get('firewall_verdict', {}).get('verdict') or result.get('result') or "Analyzed",
        "risk": result.get('firewall_verdict', {}).get('risk_level') or result.get('risk_level') or "N/A",
        "score": result.get('firewall_verdict', {}).get('score') or result.get('score') or result.get('text_score') or 0,
        "details": result
    }

    history.insert(0, record)
    
    # Keep last 50 records
    history = history[:50]

    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=4)

    return record

def get_history():
    """
    Retrieves history records.
    """
    if not os.path.exists(HISTORY_FILE):
        return []
    
    try:
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return []
