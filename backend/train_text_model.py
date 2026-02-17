
import os
import re
import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, DistilBertConfig
from torch.optim import AdamW
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix
import torch.nn as nn

# --- Configuration ---
MODEL_NAME = "distilbert-base-uncased"
TRAIN_PATH = "text_dataset/train.csv"
VAL_PATH = "text_dataset/val.csv"
SAVE_DIR = "models/text_hallucination_model"
BATCH_SIZE = 16
EPOCHS = 10 # Increased for Early Stopping
LEARNING_RATE = 2e-5
MAX_LEN = 256
DROPOUT = 0.2
PATIENCE = 2

# Ensure directories exist
os.makedirs(SAVE_DIR, exist_ok=True)

def clean_text(text):
    """
    Standard text cleaning for NLP consistency.
    """
    if not isinstance(text, str):
        return ""
    # Lowercase
    text = text.lower()
    # Remove extra spaces/newlines
    text = re.sub(r'\s+', ' ', text).strip()
    return text

class HallucinationDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len):
        self.texts = [clean_text(t) for t in texts]
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, item):
        text = str(self.texts[item])
        label = self.labels[item]

        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=self.max_len,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt',
        )

        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

def train_model():
    print("Initializing Improved DistilBERT Training Pipeline...")
    
    # Load and Preprocess Data
    if not os.path.exists(TRAIN_PATH) or not os.path.exists(VAL_PATH):
        print(f"Error: Dataset not found at {TRAIN_PATH} or {VAL_PATH}")
        return

    df_train = pd.read_csv(TRAIN_PATH)
    df_val = pd.read_csv(VAL_PATH)

    # 1. Dataset Shuffling & Filtering
    df_train = df_train.sample(frac=1).reset_index(drop=True)
    
    # 2. Filter samples shorter than 10 words
    df_train['word_count'] = df_train['text'].apply(lambda x: len(str(x).split()))
    df_train = df_train[df_train['word_count'] >= 10]
    
    print(f"Filtered Training Samples: {len(df_train)}")

    # 4. Class Balancing
    class_counts = df_train['label'].value_counts().to_dict()
    print(f"Class Distribution: {class_counts}")
    
    # Standard mapping 0=Reliable, 1=Hallucinated
    # Calculate weights: N / (num_classes * count)
    total_samples = len(df_train)
    weights = [total_samples / (2 * class_counts.get(i, 1)) for i in [0, 1]]
    class_weights = torch.tensor(weights, dtype=torch.float)
    print(f"Calculated Class Weights: {weights}")

    tokenizer = DistilBertTokenizer.from_pretrained(MODEL_NAME)
    
    # Create DataLoaders
    train_ds = HallucinationDataset(df_train.text.to_numpy(), df_train.label.to_numpy(), tokenizer, MAX_LEN)
    val_ds = HallucinationDataset(df_val.text.to_numpy(), df_val.label.to_numpy(), tokenizer, MAX_LEN)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE)

    # Initialize Model with Custom Dropout
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    config = DistilBertConfig.from_pretrained(MODEL_NAME)
    config.dropout = DROPOUT
    config.attention_dropout = DROPOUT
    config.num_labels = 2
    
    model = DistilBertForSequenceClassification.from_pretrained(MODEL_NAME, config=config)
    model.to(device)

    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE)
    criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))

    # Early Stopping & Best Model Logic
    best_val_acc = 0.0
    early_stop_count = 0

    print("\n--- Starting Training Loop ---")
    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0
        
        for batch in train_loader:
            optimizer.zero_grad()
            
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)

            outputs = model(input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            
            loss = criterion(logits, labels)
            total_loss += loss.item()
            
            loss.backward()
            optimizer.step()

        avg_train_loss = total_loss / len(train_loader)
        
        # Validation
        model.eval()
        val_preds, val_labels = [], []
        
        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                labels = batch['labels'].to(device)

                outputs = model(input_ids, attention_mask=attention_mask)
                logits = outputs.logits
                preds = torch.argmax(logits, dim=1).cpu().numpy()
                
                val_preds.extend(preds)
                val_labels.extend(labels.cpu().numpy())

        acc = accuracy_score(val_labels, val_preds)
        f1 = f1_score(val_labels, val_preds)
        cm = confusion_matrix(val_labels, val_preds)
        
        print(f"Epoch {epoch+1}/{EPOCHS}")
        print(f"  Train Loss: {avg_train_loss:.4f}")
        print(f"  Val Acc: {acc:.4f} | F1 Score: {f1:.4f}")
        print(f"  Confusion Matrix:\n{cm}")

        # Checkpoint: Save Best Model Only
        if acc > best_val_acc:
            best_val_acc = acc
            early_stop_count = 0
            print(f"  New Best Model Found! Saving to {SAVE_DIR}...")
            model.save_pretrained(SAVE_DIR)
            tokenizer.save_pretrained(SAVE_DIR)
        else:
            early_stop_count += 1
            print(f"  No improvement for {early_stop_count} epoch(s).")

        # Early Stopping
        if early_stop_count >= PATIENCE:
            print(f"  Early stopping triggered after {epoch+1} epochs.")
            break

    print(f"\nTraining Complete. Best Validation Accuracy: {best_val_acc:.4f}")

if __name__ == "__main__":
    train_model()
