from utils import get_risk_level
import re

def verify_text(text):
    """
    Analyzes text for potential hallucinations or over-confidence using weighted signals.
    """
    if not text or len(text.strip()) == 0:
        return {
            "text_score": 0,
            "risk_level": "Low",
            "explanation": "No text provided.",
            "detected_signals": []
        }

    # Signal definitions
    overconfidence_words = [r'\bdefinitely\b', r'\bguaranteed\b', r'\b100%\b', r'\bperfectly\b', r'\babsolute truth\b']
    absolute_claims = [r'\balways\b', r'\bnever\b', r'\bcompletely\b', r'\bentirely\b']
    speculative_language = [r'\bwill\b', r'\bmust\b', r'\bcannot be wrong\b']
    uncertainty_words = [r'\bmaybe\b', r'\bmight\b', r'\bpossibly\b', r'\bappears to\b', r'\bsuggests\b', r'\bperhaps\b', r'\bbased on\b']

    text_score = 0
    detected_signals = []
    explanation_parts = []

    # 1. Overconfidence Words (+30)
    if any(re.search(w, text, re.IGNORECASE) for w in overconfidence_words):
        text_score += 30
        detected_signals.append("Overconfidence markers")
        explanation_parts.append("Contains hyperbolic confidence markers.")

    # 2. Absolute Claims (+25)
    if any(re.search(w, text, re.IGNORECASE) for w in absolute_claims):
        text_score += 25
        detected_signals.append("Absolute claims")
        explanation_parts.append("Uses absolute terminology (Always/Never).")

    # 3. Speculative Language (+20)
    if any(re.search(w, text, re.IGNORECASE) for w in speculative_language):
        text_score += 20
        detected_signals.append("Speculative language")
        explanation_parts.append("Presence of definitive speculative phrasing.")

    # 4. Missing Uncertainty Words (+15)
    if not any(re.search(w, text, re.IGNORECASE) for w in uncertainty_words):
        text_score += 15
        detected_signals.append("Lack of hedging")
        explanation_parts.append("Missing necessary uncertainty or hedging markers.")

    # Cap score at 100
    text_score = min(text_score, 100)
    risk_level = get_risk_level(text_score)

    return {
        "text_score": text_score,
        "risk_level": risk_level,
        "explanation": " ".join(explanation_parts) if explanation_parts else "Text is balanced and moderate.",
        "detected_signals": detected_signals
    }
