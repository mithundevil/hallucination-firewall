from image_detector import analyze_image
from text_verifier import verify_text
from utils import get_risk_level

def process_firewall_request(text, image_path=None):
    """
    Combines text and image analysis into a final firewall decision based on risk levels.
    """
    image_result = None
    if image_path:
        image_result = analyze_image(image_path)

    text_result = verify_text(text)

    # Risk level extraction
    text_risk = text_result['risk_level']
    image_risk = image_result['risk_level'] if image_result else "Low"

    # Aggregated Score (Max of both for safety)
    text_score = text_result.get('text_score', 0)
    image_score = image_result.get('score', 0) if image_result else 0
    final_score = max(text_score, image_score)
    final_risk_level = get_risk_level(final_score)

    # Decision Logic (MANDATORY per requirements)
    if text_risk == "High" or image_risk == "High":
        verdict = "BLOCKED"
        decision = "Critical risk detected in multimodal payload. Access blocked for security."
    elif text_risk == "Medium" or image_risk == "Medium":
        verdict = "WARNING"
        decision = "Potential inconsistencies detected. Recommend human verification."
    else:
        verdict = "SAFE"
        decision = "Content passed security heuristics with low hallucination risk."

    return {
        "text_analysis": text_result,
        "image_analysis": image_result,
        "firewall_verdict": {
            "verdict": verdict,
            "risk_level": final_risk_level,
            "score": round(final_score, 2),
            "decision": decision
        }
    }
