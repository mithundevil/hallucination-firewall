# Multimodal Hallucination Firewall: Deep Learning & Forensic Audit

![Project Banner](https://img.shields.io/badge/AI_Safety-Certified-blueviolet?style=for-the-badge&logo=shield)
![Technology](https://img.shields.io/badge/Stack-React_|_Flask_|_PyTorch-blue?style=for-the-badge)
![UI](https://img.shields.io/badge/UI-Premium_Glassmorphism-green?style=for-the-badge)

## 🌌 Overview
The **Multimodal Hallucination Firewall** is a state-of-the-art security framework designed to sanitize and audit AI-generated content across multiple formats. In an era of pervasive Deepfakes and highly plausible LLM hallucinations, this system serves as a "Zero-Trust" audit layer.

It utilizes fine-tuned **Transformer (DistilBERT)** networks for linguistic verification and **CNN (ResNet-18)** architectures for visual forensic sampling, providing a unified risk verdict for complex multimodal data.

---

## 🛡️ Core Verification Modules

### 1. Linguistic Integrity Audit (Text)
- **Engine**: Fine-tuned **DistilBERT** (HuggingFace Transformers).
- **Function**: Classifies text into **Reliable** (Class 0) or **Hallucinated** (Class 1).
- **Inference**: Uses softmax probability scoring with a weighted cross-entropy loss to handle class imbalance.
- **Preprocessing**: Implements word-count filtering (>10 words), whitespace normalization, and linguistic cleaning.
- **Risk Index**: 
    - `Low`: < 50% Hallucination probability.
    - `Medium`: 50-74% Hallucination probability.
    - `High`: ≥ 75% Hallucination probability.

### 2. Forensic Sampling Audit (Image)
- **Engine**: **ResNet-18** Deep Learning architecture.
- **Detection Logic**: Combines neural inference (CNN) with structural heuristic analysis (FFT & Laplacian Noise).
- **Uncertainty Rule**: Employs an uncertainty-aware threshold system (80% for high confidence) to categorize images as "Generative" or "Likely Real".
- **Fusion Engine**: Final score is a weighted blend (70% CNN + 30% Structural Heuristics).

### 3. Temporal Consistency Audit (Video)
- **Engine**: ResNet-18 (Frame-based processing).
- **Methodology**: Samples video streams at **1 Frame Per Second (FPS)**.
- **Aggregation**: Aggregates individual frame scores to detect synthetic temporal patterns.
- **Verdict**: Classifies video as **AI Generated**, **Suspicious**, or **Likely Real** based on the ratio of suspicious frames.

---

## 🛠️ Implementation Details

### Backend (Python/Flask)
- **Inference Server**: `app.py` serves as the centralized API gateway.
- **Model Loader**: `cnn_model.py` and `text_verifier.py` handle lazy-loading of deep learning weights to optimize RAM.
- **Training Pipelines**:
    - `train_text_model.py`: Optimized training with **Early Stopping (patience=2)**, Dropout (0.2), and F1-Score monitoring.
    - `train_model.py`: Robust image training supporting palette/transparency handling and ResNet fine-tuning.

### Frontend (React/Vite)
- **Architecture**: Decoupled, multi-page application using **React Router 6**.
- **Design System**: A custom **Premium Glassmorphism** library using Backdrop Filters, Neon Accents, and 2.5D shadowing.
- **State Management**: React `useState` and `useEffect` with **Axios Interceptors** for non-blocking API communication.
- **Animations**: CSS-driven `reveal-animation`, progress bar shimmers, and scanner effects.

---

## 🚀 Installation & Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PyTorch (CPU/GPU)

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. Frontend Setup
```bash
cd frontend-react
npm install
npm run dev
```

---

## 📊 API Endpoints

| Endpoint | Method | Input | Description |
| :--- | :--- | :--- | :--- |
| `/analyze/text` | POST | `{ text: string }` | DistilBERT text hallucination audit. |
| `/analyze/image`| POST | `Multipart/Form-Data`| ResNet-18 + Heuristic image audit. |
| `/analyze/video`| POST | `Multipart/Form-Data`| Frame-by-frame temporal video audit. |
| `/firewall` | POST | `JSON / Mixed` | Unified multimodal security assessment. |

---

## 🎨 Design Philosophy
The system prioritizes **Communicative Security**. Rather than a black-box "True/False" output, it provides:
- **Risk Indicators**: Color-coded badges and linear progress bars.
- **Confidence Metrics**: Raw probability scores for granular auditing.
- **Linguistic/Structural Breakdown**: Human-readable explanations for every model verdict.

---

## 📜 Academic Attribution
This project was developed as a **Final Year Academic Major Project** in Computer Science & Artificial Intelligence.

---
*Verified Security Level: HIGH* | *Build version: 2.1.0*
