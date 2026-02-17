
import os
import time
import copy
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split
from PIL import Image

# ==========================================
# CONFIGURATION
# ==========================================
# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'dataset')
MODEL_SAVE_PATH = os.path.join(BASE_DIR, 'models', 'ai_image_cnn.pth')

# Hyperparameters
BATCH_SIZE = 32
EPOCHS = 15
LEARNING_RATE = 0.001
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Class Setup: 0 -> Real, 1 -> AI
CLASSES = ['real', 'ai']  # We will enforce this order

print(f"Using device: {DEVICE}")

# ==========================================
# CUSTOM LOADER (FIX PIL WARNINGS)
# ==========================================
def safe_pil_loader(path):
    """
    Robust loader that converts RGBA/P images to RGB.
    Fixes: UserWarning: Palette images with Transparency...
    """
    try:
        with open(path, 'rb') as f:
            img = Image.open(f)
            # Handle P-mode images with transparency info specifically
            if img.mode == 'P' and 'transparency' in img.info:
                img = img.convert('RGBA')
            return img.convert('RGB')
    except Exception as e:
        print(f"Warning: Could not load {path}: {e}")
        # Return a black image to prevent crash, or raise
        return Image.new('RGB', (224, 224))

# ==========================================
# CUSTOM DATASET (ENFORCE CLASS MAPPING)
# ==========================================
class CustomImageFolder(datasets.ImageFolder):
    """
    Override to enforce specific class-to-index mapping.
    We want:
      Class 0: "real"
      Class 1: "ai"
    """
    def __init__(self, root, transform=None):
        # Use our safe loader
        super().__init__(root, transform=transform, loader=safe_pil_loader)

    def find_classes(self, directory):
        # Scan directory to find classes, but force our specific order
        classes = sorted([d.name for d in os.scandir(directory) if d.is_dir()])
        
        # Check if required folders exist
        if 'real' not in classes or 'ai' not in classes:
            raise FileNotFoundError(f"Dataset must contain 'real' and 'ai' folders. Found: {classes}")
            
        # Hardcode the mapping as requested
        # 'real' -> 0
        # 'ai'   -> 1
        class_to_idx = {
            'real': 0,
            'ai': 1
        }
        
        # Helper list for index->name
        # Index 0 is 'real', Index 1 is 'ai'
        classes_ordered = ['real', 'ai']
        
        return classes_ordered, class_to_idx

# ==========================================
# 1. DATA PREPARATION
# ==========================================
def create_dataloaders():
    print("\n[1/5] Preparing Data...")
    
    # Define Transforms (Resize -> Tensor -> Normalize)
    # Using ImageNet mean and std as requested
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])

    # Check if dataset directory exists
    if not os.path.exists(DATA_DIR):
        print(f"Error: Dataset directory not found at {DATA_DIR}")
        return None, None

    # Load Dataset with Custom Mapping
    try:
        full_dataset = CustomImageFolder(root=DATA_DIR, transform=transform)
        print(f"Dataset classes: {full_dataset.classes}")
        print(f"Class mapping: {full_dataset.class_to_idx}")
    except FileNotFoundError as e:
        print(e)
        return None, None
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None, None

    # Split: 80% Train, 20% Validation
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    
    if train_size == 0:
        print("Error: Not enough images to split. Add more images.")
        return None, None

    train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])

    print(f"Training samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")

    # Create Loaders
    dataloaders = {
        'train': DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True),
        'val': DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)
    }
    
    return dataloaders, len(full_dataset)

# ==========================================
# 2. MODEL SETUP
# ==========================================
def get_model():
    print("\n[2/5] Setting up ResNet18...")
    # Load pretrained ResNet18
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    
    # Replace final fully connected layer for binary classification
    # Input features of the last layer
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, 2)
    
    return model.to(DEVICE)

# ==========================================
# 3. TRAINING LOOP
# ==========================================
def train_model(model, dataloaders, dataset_size):
    print("\n[3/5] Starting Training...")
    since = time.time()

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0
    
    for epoch in range(EPOCHS):
        print(f'Epoch {epoch+1}/{EPOCHS}')
        print('-' * 10)

        # Each epoch has a training and validation phase
        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()  # Set model to training mode
            else:
                model.eval()   # Set model to evaluate mode

            running_loss = 0.0
            running_corrects = 0

            # Iterate over data
            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(DEVICE)
                labels = labels.to(DEVICE)

                # Zero the parameter gradients
                optimizer.zero_grad()

                # Forward
                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    # Backward + optimize only if in training phase
                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                # Statistics
                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / len(dataloaders[phase].dataset)
            epoch_acc = running_corrects.double() / len(dataloaders[phase].dataset)

            print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

            # Deep copy the model if it's the best so far
            if phase == 'val' and epoch_acc > best_acc:
                best_acc = epoch_acc
                best_model_wts = copy.deepcopy(model.state_dict())

        print()

    time_elapsed = time.time() - since
    print(f'Training complete in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s')
    print(f'Best val Acc: {best_acc:.4f}')

    # Load best model weights
    model.load_state_dict(best_model_wts)
    return model

# ==========================================
# 4. SAVE MODEL
# ==========================================
def save_model(model):
    print("\n[4/5] Saving Model...")
    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"Model saved to: {MODEL_SAVE_PATH}")

# ==========================================
# 5. INFERENCE FUNCTION (PREDICTION)
# ==========================================
def predict_image(image_path):
    """
    Predicts if an image is Real (Class 0) or AI (Class 1).
    Returns: AI Probability, Real Probability
    """
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return

    # Load and Preprocess
    img = Image.open(image_path).convert('RGB')
    
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    
    img_t = transform(img)
    batch_t = torch.unsqueeze(img_t, 0).to(DEVICE)

    # Load Model structure
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 2)
    
    # Load Weights
    # If called immediately after training, we could pass the memory object, 
    # but for standalone utility, we load from file.
    if os.path.exists(MODEL_SAVE_PATH):
        model.load_state_dict(torch.load(MODEL_SAVE_PATH, map_location=DEVICE))
    else:
        print("Model file not found. Train first.")
        return

    model.to(DEVICE)
    model.eval()

    with torch.no_grad():
        outputs = model(batch_t)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        
        # Mapping: 0 -> Real, 1 -> AI
        real_prob = probs[0][0].item() * 100
        ai_prob = probs[0][1].item() * 100
        
        print(f"\n--- Inference: {os.path.basename(image_path)} ---")
        print(f"Real Probability: {real_prob:.2f}%")
        print(f"AI Generated Probability: {ai_prob:.2f}%")
        
        if ai_prob > real_prob:
            print("Verdict: AI GENERATED")
        else:
            print("Verdict: REAL IMAGE")
            
        return ai_prob, real_prob

# ==========================================
# MAIN EXECUTION
# ==========================================
if __name__ == '__main__':
    # Prepare Data
    dataloaders, dataset_size = create_dataloaders()
    
    if dataloaders:
        # Initialize Model
        model = get_model()
        
        # Train
        model = train_model(model, dataloaders, dataset_size)
        
        # Save
        save_model(model)
        
        # Optional: Test Inference (Uncomment to test)
        # predict_image("path/to/test_image.jpg")
