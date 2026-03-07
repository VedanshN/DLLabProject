"""
inference.py — Inference logic for the Colorization API.

Provides a ``predict()`` function that takes raw image bytes, preprocesses
them into the format expected by the autoencoder, runs inference, and returns
the colourised result as a PIL Image.
"""

import io
from typing import Union

import numpy as np
import torch
from PIL import Image

from app.model_loader import get_device, get_model


def _preprocess(image_bytes: bytes) -> torch.Tensor:
    """
    Convert raw image bytes into a model-ready tensor.

    Steps:
        1. Open the image with PIL.
        2. Convert to grayscale (mode ``"L"``).
        3. Resize to 32×32 (matching CIFAR-10 dimensions).
        4. Normalise pixel values to [0, 1].
        5. Shape into (1, 1, 32, 32) — batch of one.

    Args:
        image_bytes: Raw bytes of the uploaded image.

    Returns:
        A float tensor of shape (1, 1, 32, 32).
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("L")  # → grayscale
    image = image.resize((32, 32), Image.Resampling.LANCZOS)

    # Convert to float tensor in [0, 1]
    arr = np.array(image, dtype=np.float32) / 255.0      # (32, 32)
    tensor = torch.from_numpy(arr).unsqueeze(0).unsqueeze(0)  # (1, 1, 32, 32)
    return tensor


def _postprocess(output_tensor: torch.Tensor) -> Image.Image:
    """
    Convert the model's output tensor back to a PIL RGB Image.

    Args:
        output_tensor: (1, 3, 32, 32) float tensor in [0, 1].

    Returns:
        A PIL Image in RGB mode.
    """
    # Remove batch dim → (3, 32, 32), detach, move to CPU
    img = output_tensor.squeeze(0).detach().cpu().clamp(0, 1)
    # (3, H, W) → (H, W, 3), scale to 0-255
    img_np = (img.permute(1, 2, 0).numpy() * 255).astype(np.uint8)
    return Image.fromarray(img_np, mode="RGB")


@torch.no_grad()
def predict(image_bytes: bytes) -> Image.Image:
    """
    End-to-end inference: image bytes in → colourised PIL Image out.

    Args:
        image_bytes: Raw bytes of the uploaded image (any common format).

    Returns:
        A PIL Image (RGB, 32×32) containing the colourised output.
    """
    model = get_model()
    device = get_device()

    input_tensor = _preprocess(image_bytes).to(device)
    output_tensor = model(input_tensor)

    return _postprocess(output_tensor)
