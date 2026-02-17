
# CNN Model Training Instructions

This document explains how to train the CNN model for the Hallucination Firewall using your own dataset.

## Prerequisites

1.  **Python Environment**: Ensure you are in the `backend` directory and have the dependencies installed.
    ```bash
    pip install -r requirements.txt
    ```
    (Note: `torch` an `torchvision` are required)

2.  **Dataset Preparation**:
    The training script expects a specific folder structure in `backend/dataset`.
    
    Create the following directories:
    -   `backend/dataset/ai` : Place your **AI-generated** training images here.
    -   `backend/dataset/real` : Place your **Real/Authentic** training images here.
    
    *Supported formats: JPG, PNG, WEBP.*
    *Recommended size: At least 50-100 images per category for basic fine-tuning.*

## Running the Training

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Run the training script:
    ```bash
    python train_cnn.py
    ```

3.  **Monitoring**:
    The script will print the training loss and accuracy for each epoch (default 10 epochs).
    
    *Example Output:*
    ```
    Starting training with 150 real images and 150 AI images...
    Classes: ['ai', 'real']
    Using device: cpu
    Epoch 0/9
    ----------
    Loss: 0.6543 Acc: 0.5833
    ...
    Training complete
    Model saved to .../backend/models/ai_image_cnn.pth
    ```

## Post-Training

Once training is complete, the new model weights will be saved to `backend/models/ai_image_cnn.pth`.
The application will automatically use these new weights the next time it restarts.

## Troubleshooting

-   **"Dataset not found"**: Ensure the `backend/dataset` folder exists and contains `ai` and `real` subfolders.
-   **"Dataset is empty"**: Ensure there are actual image files in the subfolders.
-   **"CUDA not available"**: The script will default to CPU if GPU is not available. Training will be slower but still functional.
