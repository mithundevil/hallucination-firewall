# Hallucination Firewall for Multimodal AI Systems (React Edition)

## 1. Abstract
The **Multimodal Hallucination Firewall** is an advanced security framework designed to sanitize and verify AI-generated content. Utilizing a modern React-based architecture and specialized Python backend heuristics, the system detects "Semantic Hallucinations" — anomalous synthetic images (Deepfakes) and factually baseless text outputs. It acts as a protective audit layer between generative AI systems and end-users.

## 2. Problem Statement
The rise of Large Language Models (LLMs) and Diffusion Models has introduced the risk of highly plausible but false generations:
- **Linguistic Hallucinations**: Plausible-sounding text that lacks factual grounding.
- **Visual Hallucinations**: AI-generated images with structural inconsistencies.
Existing security tools lack the capability to verify the *semantic integrity* of AI outputs, necessitating a dedicated "Hallucination Firewall".

## 3. System Architecture
The project utilizes a decoupled Client-Server architecture:
- **Frontend (React Stack)**: A premium multi-page application built with **React 18** and **Vite**. It features a futuristic **Glassmorphism UI** and uses **Axios** for asynchronous communication.
- **Backend (Python Flask)**:
    - `image_detector.py`: Structural analysis using FFT and Laplacian Noise variance.
    - `text_verifier.py`: Linguistic auditing for over-confidence and repetition.
    - `firewall_engine.py`: Logic layer for multimodal risk aggregation.
    - `history_manager.py`: Local persistent storage for security audit logs.

## 4. Key Features
- **Hybrid Image Verification**: Combines a pretrained **CNN (ResNet-18)** with structural heuristics for maximum accuracy.
- **Score Fusion Engine**: 60% CNN + 40% Heuristic weight distribution for final risk verdict.
- **3-Class Image Classification**: Automatically distinguishes between Photographs, AI Generated Images, and non-photographic content (Cartoons/Logos).
- **Weighted Text Hallucination Scoring**: Heuristic module tracking overconfidence, absolute claims, and speculative phrasing.
- **Unified Risk Mapping**: Globally consistent mapping (0-30 Low, 31-60 Medium, 61-100 High).

## 5. Tech Stack
- **Frontend**: React.js, Vite, Axios, Lucide Icons, Vanilla CSS.
- **Backend**: Python 3.10+, Flask, OpenCV, NumPy, Pillow.
- **Data**: JSON-based persistent storage via `history.json`.

## 6. Installation & Execution

### Backend Setup
1. Navigate to the `backend/` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the `frontend-react/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the local address provided (usually `http://localhost:5173`).

## 7. Future Scope
- Integration of ONNX-based lightweight neural detectors.
- RAG-based real-time fact-checking.
- Browser extension for on-the-fly AI output verification.

---
*Developed as a Final Year Academic Major Project.*
