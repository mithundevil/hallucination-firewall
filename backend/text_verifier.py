
import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F
from utils import get_risk_level

# Model Path Configuration (Absolute path to weights)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "text_hallucination_model")

class TextHallucinationPredictor:
    def __init__(self):
        # Use CPU for deployment stability unless GPU is confirmed
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.tokenizer = None
        self.is_loaded = self.load_model()

    def load_model(self):
        """Loads model and tokenizer from the same directory."""
        try:
            if os.path.exists(MODEL_PATH) and os.listdir(MODEL_PATH):
                # Step 3: Ensure tokenizer matches model (loading from same path)
                self.tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
                self.model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
                
                # Ensure model is in eval mode and moved to device
                self.model.to(self.device)
                self.model.eval()
                return True
            else:
                return False
        except Exception as e:
            print(f"CRITICAL: Failed to load text model: {e}")
            return False

    def predict(self, text):
        """Standardized Inference Pipeline."""
        if not self.is_loaded:
            # Step 4: No rule-based logic allowed. Return safe defaults if model missing.
            return 0.0, 100.0, 0 

        # Tokenize with strict max_length=256
        inputs = self.tokenizer(
            text, 
            return_tensors="pt", 
            truncation=True, 
            max_length=256, 
            padding=True
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**inputs)
            
            # Step 2: Fix Softmax Prediction
            probabilities = F.softmax(outputs.logits, dim=1)
            
            # Step 1: Verify Label Consistency (0=Reliable, 1=Hallucinated)
            reliable_prob = probabilities[0][0].item() * 100
            hallucination_prob = probabilities[0][1].item() * 100
            predicted_label = torch.argmax(probabilities, dim=1).item()

            # Step 6: Debug prints
            print(f"\n--- NLP DEBUG ---")
            print(f"Text: {text[:50]}...")
            print(f"Reliable Prob: {reliable_prob:.2f}%")
            print(f"Hallucinated Prob: {hallucination_prob:.2f}%")
            print(f"Predicted Class: {predicted_label}")
            print(f"-----------------\n")
            
            return round(hallucination_prob, 2), round(reliable_prob, 2), predicted_label

# Global Predictor Instance
text_predictor = TextHallucinationPredictor()

def verify_text(text):
    """
    Main entry point for text verification. Strictly model-driven.
    """
    if not text or len(text.strip()) == 0:
        return {
            "text_score": 0,
            "risk_level": "Low",
            "explanation": "Missing input text.",
            "reliable_prob": 100,
            "hallucination_prob": 0
        }

    # Step 5: Fix Risk Mapping (Model-Only)
    hallucination_prob, reliable_prob, label = text_predictor.predict(text)
    
    if hallucination_prob >= 75:
        risk_level = "High"
        explanation = "High probability of hallucinated or overconfident content detected."
    elif hallucination_prob >= 50:
        risk_level = "Medium"
        explanation = "Moderate signs of linguistic uncertainty or ungrounded claims."
    else:
        risk_level = "Low"
        explanation = "Content appears reliable and grounded according to NLP audit."

    return {
        "text_score": hallucination_prob,
        "reliable_prob": reliable_prob,
        "hallucination_prob": hallucination_prob,
        "risk_level": risk_level,
        "explanation": explanation,
        "model_status": "Active" if text_predictor.is_loaded else "Model Missing"
    }

# Step 7: Validation Test Block
if __name__ == "__main__":
    print("Running Pipeline Validation...")
    test_cases = [
        "This is definitely 100% correct.", # Expect High
        "Based on current evidence, this may be true." # Expect Low
    ]
    
    for tc in test_cases:
        res = verify_text(tc)
        print(f"TEST: {tc}")
        print(f"RESULT: {res['risk_level']} (Score: {res['text_score']})")
        print("-" * 30)
