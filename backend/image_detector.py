import cv2
import numpy as np
from PIL import Image
from utils import get_risk_level
from cnn_model import predictor

def is_photo_like(image, gray):
    """
    Heuristic to determine if an image is photo-like or a graphic/cartoon.
    """
    # 1. Color Variety Check (Photos have high color variance)
    # Convert to HSV to check saturation and value variance
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    _, s, v = cv2.split(hsv)
    s_std = np.std(s)
    
    # 2. Laplacian Variance (Photos usually have some texture/noise)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # 3. Edge density (Cartoons/Logos have very sharp, concentrated edges)
    edges = cv2.Canny(gray, 100, 200)
    edge_density = np.sum(edges > 0) / (gray.shape[0] * gray.shape[1])

    # Graphics/Cartoons often have:
    # - Low saturation standard deviation (flat colors)
    # - Very high edge density or extremely low noise
    if s_std < 15 or laplacian_var < 20 or edge_density > 0.15:
        return False, "Graphic/Cartoon/Screenshot"
    
    return True, "Photograph"

def analyze_image(image_path):
    """
    Analyzes an image for AI generation markers using CNN + Heuristics.
    """
    image = cv2.imread(image_path)
    if image is None:
        return {"error": "Invalid image file"}
        
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Initial Photo-like check
    is_photo, img_type_desc = is_photo_like(image, gray)
    
    # EXIF Metadata Inspection
    has_exif = False
    try:
        with Image.open(image_path) as img:
            exif_data = img._getexif()
            if exif_data:
                has_exif = True
    except Exception:
        pass

    if not is_photo:
        return {
            "image_type": "Other Image",
            "score": 0,
            "risk_level": "Low",
            "result": "Other (Graphic/Illustration)",
            "explanation": f"Detected as a {img_type_desc}. Non-photographic images are not subject to Deepfake analysis.",
            "metrics": {"is_photo": False}
        }

    # 1. CNN Prediction (70% weight)
    cnn_score = predictor.predict(image_path)
    
    # 2. Heuristic Analysis (30% weight)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    f = np.fft.fft2(gray)
    fshift = np.fft.fftshift(f)
    magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)
    fft_mean = np.mean(magnitude_spectrum)

    heuristic_score = 0
    explanations = []

    if not has_exif:
        heuristic_score += 35
        explanations.append("Missing camera EXIF metadata.")
    
    if laplacian_var < 150:
        heuristic_score += 40
        explanations.append("Synthetic smoothness (low noise variance).")
    elif laplacian_var > 1500:
        heuristic_score += 25
        explanations.append("Unusual frequency artifacts detected.")

    if fft_mean < 110:
        heuristic_score += 30
        explanations.append("Anomalous frequency distribution.")

    heuristic_score = min(heuristic_score, 100)

    # 3. Score Fusion (CALIBRATED: 70% CNN, 30% Heuristic)
    final_score = (0.7 * cnn_score) + (0.3 * heuristic_score)
    final_score = round(final_score, 2)
    
    # 4. Uncertainty Adjustment (Diffusion Safety Rule)
    # If high-res and missing metadata, ensure score is at least 55 (Suspicious)
    height, width = image.shape[:2]
    is_high_res = height >= 512 and width >= 512
    
    if cnn_score < 15 and not has_exif and is_high_res and heuristic_score > 20:
        if final_score < 55:
            final_score = 55.0
            explanations.append("Elevated risk due to high realism without source metadata.")

    # 5. SINGLE FINAL DECISION PATH
    if final_score >= 80:
        result = "AI Generated Image"
        risk_level = "High"
    elif final_score >= 50:
        result = "Suspicious Image (Possible AI)"
        risk_level = "Medium"
    else:
        result = "Likely Real Image"
        risk_level = "Low"

    return {
        "image_type": "Photograph",
        "cnn_score": cnn_score,
        "heuristic_score": heuristic_score,
        "score": final_score,
        "risk_level": risk_level,
        "result": result,
        "explanation": f"Audit Result: {result} based on CNN confidence ({cnn_score}%) and structural heuristics ({heuristic_score}%). " + 
                       ("Uncertainty markers detected." if risk_level == "Medium" else ""),
        "metrics": {
            "laplacian_var": round(laplacian_var, 2),
            "fft_mean": round(fft_mean, 2),
            "has_exif": has_exif,
            "resolution": f"{width}x{height}"
        }
    }
