
import cv2
import os
import numpy as np
from cnn_model import predictor
from PIL import Image

def extract_frames(video_path, max_frames=100):
    """
    Extracts frames from a video file at a rate of 1 frame per second.
    Limit to max_frames for performance.
    """
    frames = []
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return []

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0: fps = 30 # Fallback
    
    interval = int(fps) # Approximately 1 frame per second
    frame_count = 0
    extracted_count = 0

    while extracted_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % interval == 0:
            # Convert BGR (OpenCV) to RGB (CNN expects RGB)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame_rgb)
            extracted_count += 1
            
        frame_count += 1
        
    cap.release()
    return frames

def analyze_video(video_path):
    """
    Performs frame-by-frame analysis of a video and aggregates results.
    """
    if not os.path.exists(video_path):
        return {"error": "Video file not found"}

    print(f"Starting analysis for video: {video_path}")
    
    # 1. Extract Frames
    frames = extract_frames(video_path)
    if not frames:
        return {"error": "Could not extract frames from video"}

    total_frames = len(frames)
    ai_scores = []
    
    # 2. Sequential Analysis (Temporary files for CNNPredictor)
    # Note: Our CNNPredictor expects a file path. We'll save frames temporarily.
    # This is safer than refactoring the whole predictor for now.
    temp_frame_path = os.path.join(os.path.dirname(video_path), "temp_frame.jpg")
    
    ai_frame_count = 0
    suspicious_frame_count = 0

    for frame in frames:
        # Save frame to disk compatible with cnn_model's PIL-based loader
        img = Image.fromarray(frame)
        img.save(temp_frame_path)
        
        # Predict using existing CNN
        score = predictor.predict(temp_frame_path)
        ai_scores.append(score)
        
        if score >= 80:
            ai_frame_count += 1
        if score >= 50:
            suspicious_frame_count += 1

    # Cleanup temp frame
    if os.path.exists(temp_frame_path):
        os.remove(temp_frame_path)

    # 3. Aggregate Results
    ai_ratio = ai_frame_count / total_frames
    suspicious_ratio = suspicious_frame_count / total_frames
    
    # Final Decision Logic
    if ai_ratio >= 0.7:
        label = "AI Generated Video"
        risk_level = "High"
    elif suspicious_ratio >= 0.5:
        label = "Suspicious Video"
        risk_level = "Medium"
    else:
        label = "Likely Real Video"
        risk_level = "Low"

    explanation = (
        f"Video analysis complete. Processed {total_frames} frames. "
        f"{int(ai_ratio * 100)}% of frames showed high AI indicators, "
        f"while {int(suspicious_ratio * 100)}% showed moderate signs."
    )

    return {
        "video_label": label,
        "ai_frame_percentage": round(ai_ratio * 100, 2),
        "total_frames_analyzed": total_frames,
        "risk_level": risk_level,
        "explanation": explanation,
        "average_ai_score": round(sum(ai_scores) / total_frames, 2) if total_frames > 0 else 0
    }
