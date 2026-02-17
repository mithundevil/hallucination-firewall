
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
import os
import sys

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), 'dataset')
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), 'models', 'ai_image_cnn.pth')
BATCH_SIZE = 32
EPOCHS = 10
LEARNING_RATE = 0.001

def train_model():
    # check if dataset exists
    if not os.path.exists(os.path.join(DATA_DIR, 'real')) or not os.path.exists(os.path.join(DATA_DIR, 'ai')):
        print(f"Error: Dataset not found at {DATA_DIR}")
        print("Please create 'real' and 'ai' directories inside 'backend/dataset' and add images.")
        return

    # Check if there are images
    real_count = len(os.listdir(os.path.join(DATA_DIR, 'real')))
    ai_count = len(os.listdir(os.path.join(DATA_DIR, 'ai')))
    
    if real_count == 0 or ai_count == 0:
        print(f"Error: Dataset is empty. Found {real_count} real images and {ai_count} AI images.")
        print("Please add images to the 'backend/dataset/real' and 'backend/dataset/ai' folders.")
        return

    print(f"Starting training with {real_count} real images and {ai_count} AI images...")

    # Data Transforms
    data_transforms = {
        'train': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
    }

    # Load Dataset
    image_dataset = datasets.ImageFolder(DATA_DIR, data_transforms['train'])
    dataloader = DataLoader(image_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    
    dataset_size = len(image_dataset)
    class_names = image_dataset.classes
    
    print(f"Classes: {class_names}")
    # Ensure correct mapping: 0 -> AI, 1 -> Real (alphabetical by default: ai, real)
    # If folder names are 'ai' and 'real', then 'ai' is 0, 'real' is 1.
    # Our inference logic expects: 0 -> AI Generated, but the previous 'cnn_model.py' had inversion issues.
    # Let's verify the mapping.
    print(f"Class Mapping: {image_dataset.class_to_idx}")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Load Pretrained Model
    model = models.resnet18(weights='DEFAULT')
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, 2)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.SGD(model.parameters(), lr=LEARNING_RATE, momentum=0.9)

    # Training Loop
    for epoch in range(EPOCHS):
        print(f'Epoch {epoch}/{EPOCHS - 1}')
        print('-' * 10)

        model.train()
        running_loss = 0.0
        running_corrects = 0

        for inputs, labels in dataloader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            with torch.set_grad_enabled(True):
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)

                loss.backward()
                optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

        epoch_loss = running_loss / dataset_size
        epoch_acc = running_corrects.double() / dataset_size

        print(f'Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

    print('Training complete')
    
    # Save Model
    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"Model saved to {MODEL_SAVE_PATH}")

if __name__ == '__main__':
    try:
        train_model()
    except Exception as e:
        print(f"An error occurred: {e}")
