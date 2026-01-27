import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os

# Define the model architecture (ResNet18 for binary classification)
def get_model():
    model = models.resnet18(weights=None)
    num_ftrs = model.fc.in_features
    # Binary classification: Real vs AI
    model.fc = nn.Linear(num_ftrs, 2)
    return model

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'ai_image_cnn.pth')

class CNNPredictor:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = get_model()
        
        if os.path.exists(MODEL_PATH):
            try:
                self.model.load_state_dict(torch.load(MODEL_PATH, map_location=self.device))
                print(f"CNN Model loaded successfully from {MODEL_PATH}")
            except Exception as e:
                print(f"Warning: Failed to load CNN weights: {e}. Using initialized weights.")
        else:
            print(f"Warning: CNN model weights not found at {MODEL_PATH}. Initializing with random weights for demo.")
        
        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def predict(self, image_path):
        """
        Predicts the probability of an image being AI-generated.
        Returns: Score (0-100)
        """
        try:
            img = Image.open(image_path).convert('RGB')
            img_t = self.transform(img)
            batch_t = torch.unsqueeze(img_t, 0).to(self.device)

            with torch.no_grad():
                outputs = self.model(batch_t)
                probs = torch.nn.functional.softmax(outputs, dim=1)
                
                # FIX: Correcting Class Mapping
                # If model was yielding Real at index 1, we invert to get AI probability.
                # Based on user feedback of inversion, we now treat index 0 as AI Generated.
                ai_prob = probs[0][0].item() * 100 
                return round(ai_prob, 2)
        except Exception as e:
            print(f"CNN Prediction Error: {e}")
            return 50.0  # Conservative fallback

# Global instance for reuse
predictor = CNNPredictor()

if __name__ == "__main__":
    # Quick test
    print("Testing CNN Predictor Instance...")
    test_score = predictor.predict("image_detector.py")  # Should fail gracefully
    print(f"Test Score: {test_score}")
