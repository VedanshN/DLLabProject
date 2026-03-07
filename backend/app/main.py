"""
main.py — FastAPI application entry point.

Initialises the app, mounts the router, configures CORS (for future
React frontend integration), and loads the trained model at startup.

Run with:
    uvicorn app.main:app --reload
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.model_loader import load_model
from app.routes import router


# ── Lifespan event — load model once on startup ─────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the ML model before the server starts accepting requests."""
    load_model()
    yield  # Application runs here
    # (cleanup code, if any, goes after yield)


# ── App creation ─────────────────────────────────────────────────────────

app = FastAPI(
    title="Image Colorization API",
    description=(
        "Upload a grayscale image and receive a colourised RGB version, "
        "powered by a convolutional autoencoder trained on CIFAR-10."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS — allow requests from any origin (useful for React dev server) ─
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount routes ─────────────────────────────────────────────────────────
app.include_router(router)
