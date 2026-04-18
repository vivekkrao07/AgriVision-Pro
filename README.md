# Wheat Disease Prediction Application

This is a full-stack web application that predicts diseases in wheat leaves using an AI model.
The system features a fast backend powered by FastAPI and a modern, glassmorphic UI built with React and Vite.

## Project Structure
- `/backend`: Python FastAPI application and ML model inference.
- `/frontend`: React + Vite frontend application.
- `/backend/download_dataset.py`: Script to download a wheat disease dataset for custom training.

## Prerequisites
- Node.js (v16+)
- Python 3.9+
- `npm`

## 1. Setting up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   *Note: On the first run, the backend will download the Hugging Face Vision Transformer model (~300MB). It will start much faster on subsequent runs.*
   The API will run at `http://localhost:8000`.

## 2. Setting up the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser (usually `http://localhost:5173`).

## 3. Getting Datasets for Custom Training
If you wish to train your own PyTorch or TensorFlow model instead of using the pre-trained HuggingFace model, you can download a standard dataset from Kaggle.

1. Navigate to the `backend` folder.
2. Ensure you have your `kaggle.json` API token setup (see https://github.com/Kaggle/kaggle-api).
3. Run the download script:
   ```bash
   python download_dataset.py
   ```
   This will download the "Wheat Leaf Dataset" into the `backend/datasets/wheat_leaves` folder, categorized by disease class.
