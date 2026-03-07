"""
model_loader.py — Singleton model loader for the FastAPI backend.

Loads the trained ColorizationAutoencoder once at server startup and exposes
a ``get_model()`` accessor that other modules can import.
"""

import os
from typing import Optional

import torch

from ml.model import ColorizationAutoencoder


# ── Module-level state ───────────────────────────────────────────────────

_model: Optional[ColorizationAutoencoder] = None
_device: Optional[torch.device] = None

# Default path — can be overridden via the MODEL_PATH env var
DEFAULT_MODEL_PATH = os.path.join("saved_models", "colorization_autoencoder.pth")


def _select_device() -> torch.device:
    """Pick the best available device (CUDA → MPS → CPU)."""
    if torch.cuda.is_available():
        return torch.device("cuda")
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


def load_model(model_path: Optional[str] = None) -> None:
    """
    Load the trained model weights into memory.

    This function is idempotent — calling it twice has no additional effect
    unless the module-level ``_model`` is explicitly reset.

    Args:
        model_path: Path to the ``.pth`` file. Falls back to
                    ``DEFAULT_MODEL_PATH`` or the ``MODEL_PATH`` env var.
    """
    global _model, _device

    if _model is not None:
        return  # Already loaded

    _device = _select_device()

    path = model_path or os.environ.get("MODEL_PATH", DEFAULT_MODEL_PATH)

    if not os.path.isfile(path):
        raise FileNotFoundError(
            f"Trained model not found at '{path}'. "
            "Run  python -m ml.train  first to train the model."
        )

    _model = ColorizationAutoencoder().to(_device)
    _model.load_state_dict(
        torch.load(path, map_location=_device, weights_only=True)
    )
    _model.eval()
    print(f"✓ Model loaded from {path}  (device={_device})")


def get_model() -> ColorizationAutoencoder:
    """Return the loaded model. Raises if ``load_model()`` has not been called."""
    if _model is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")
    return _model


def get_device() -> torch.device:
    """Return the device the model is on."""
    if _device is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")
    return _device
