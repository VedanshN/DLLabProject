# AI Image Colorization

A full-stack web application that colorizes grayscale images using a convolutional autoencoder trained on the CIFAR-10 dataset. Users can upload a black-and-white photograph through the frontend, and the backend runs inference to produce a colorized RGB output in real time.

## Tech Stack

### Frontend
- React (with TypeScript)
- Vite
- GSAP (scroll animations)
- Lucide React (icons)
- react-dropzone (file uploads)

### Backend
- Python
- FastAPI
- Uvicorn

### ML Layer
- PyTorch (model definition, training, inference)
- Convolutional Autoencoder (encoder-decoder architecture)
- CIFAR-10 dataset (50,000 training images, 10,000 test images)
- MSE loss with Adam optimizer

## Project Structure

```
frontend/       React + Vite frontend
backend/
  app/          FastAPI server (routes, inference, model loader)
  ml/           ML pipeline (model, dataset, training, evaluation)
  tests/        pytest test suite (47 tests)
```

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m ml.train --epochs 25
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:8000`.
