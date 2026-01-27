import numpy as np

def normalize_confidence(value, min_val=0, max_val=100):
    """Normalize a value to a 0-100 range."""
    return float(np.clip(value, min_val, max_val))

def get_risk_level(score):
    """Map a score (0-100) to a risk level."""
    if score <= 30:
        return "Low"
    elif score <= 60:
        return "Medium"
    else:
        return "High"

def format_response(success, message, data=None):
    """Standardize API response format."""
    return {
        "success": success,
        "message": message,
        "data": data or {}
    }
