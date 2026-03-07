# Automatic Image Colorization using Autoencoders

A deep learning system that converts **grayscale images** into **colourised RGB images** using a convolutional autoencoder trained on CIFAR-10.

```
Grayscale Image → Encoder → Bottleneck → Decoder → RGB Image
```

## Project Structure

```
backend/
├── app/                        # FastAPI backend
│   ├── main.py                 # App entry point
│   ├── routes.py               # API endpoints
│   ├── inference.py            # Preprocessing + inference
│   └── model_loader.py         # Loads trained model at startup
├── ml/                         # ML pipeline
│   ├── dataset.py              # CIFAR-10 dataset wrapper
│   ├── model.py                # Autoencoder architecture
│   ├── train.py                # Training script
│   ├── evaluate.py             # Evaluation & visualisation
│   └── utils.py                # Helpers (comparison images, etc.)
├── saved_models/               # Trained weights (.pth)
├── outputs/
│   ├── predictions/            # Evaluation outputs
│   └── training_samples/       # Training-time samples
├── requirements.txt
└── README.md
```

## Setup

```bash
cd backend
pip install -r requirements.txt
```

## Train the Model

```bash
# Default: 25 epochs, batch size 64, lr 0.001
python -m ml.train

# Custom
python -m ml.train --epochs 50 --batch-size 128
```

CIFAR-10 is downloaded automatically on the first run.  
The best model is saved to `saved_models/colorization_autoencoder.pth`.

## Evaluate

```bash
python -m ml.evaluate
python -m ml.evaluate --num-samples 20
```

Comparison images (grayscale | prediction | original) are saved to `outputs/predictions/`.

## Run the API Server

```bash
uvicorn app.main:app --reload
```

The server starts at **http://localhost:8000**.

### Endpoints

| Method | Path        | Description                                  |
|--------|-------------|----------------------------------------------|
| GET    | `/`         | Health check → `{ "status": "server running" }` |
| POST   | `/colorize` | Upload an image → receive a colourised PNG   |

### Interactive Docs

Open **http://localhost:8000/docs** for the Swagger UI, where you can upload an image directly in the browser.

### Example (curl)

```bash
curl -X POST http://localhost:8000/colorize \
     -F "file=@my_image.jpg" \
     --output colorized.png
```

## Tech Stack

| Layer            | Technology                  |
|------------------|-----------------------------|
| ML Framework     | PyTorch                     |
| Backend          | FastAPI + Uvicorn           |
| Image Processing | OpenCV, Pillow              |
| Dataset          | CIFAR-10 (via torchvision)  |
| Utilities        | NumPy, Matplotlib, tqdm     |
| Python           | 3.10+                       |

## Model Architecture

**Encoder**
- Conv2d(1→64) → ReLU → MaxPool2d  *(32×32 → 16×16)*
- Conv2d(64→128) → ReLU → MaxPool2d  *(16×16 → 8×8)*
- Conv2d(128→256) → ReLU  *(bottleneck)*

**Decoder**
- ConvTranspose2d(256→128, stride=2) → ReLU  *(8×8 → 16×16)*
- ConvTranspose2d(128→64, stride=2) → ReLU  *(16×16 → 32×32)*
- Conv2d(64→3) → Sigmoid  *(RGB output)*

**Loss**: MSE  |  **Optimiser**: Adam (lr=0.001)
