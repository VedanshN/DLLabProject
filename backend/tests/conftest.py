"""
conftest.py — Shared pytest fixtures for backend tests.
"""

import io
import os
import tempfile

import pytest
import torch
from PIL import Image

from ml.model import ColorizationAutoencoder


@pytest.fixture
def dummy_model():
    """Return a randomly initialised ColorizationAutoencoder (no trained weights)."""
    model = ColorizationAutoencoder()
    model.eval()
    return model


@pytest.fixture
def dummy_model_path(dummy_model):
    """Save dummy model weights to a temp file and return the path."""
    with tempfile.NamedTemporaryFile(suffix=".pth", delete=False) as f:
        torch.save(dummy_model.state_dict(), f.name)
        yield f.name
    os.unlink(f.name)


@pytest.fixture
def sample_grayscale_tensor():
    """Return a random (1, 1, 32, 32) tensor in [0, 1]."""
    return torch.rand(1, 1, 32, 32)


@pytest.fixture
def sample_rgb_tensor():
    """Return a random (1, 3, 32, 32) tensor in [0, 1]."""
    return torch.rand(1, 3, 32, 32)


@pytest.fixture
def sample_image_bytes():
    """Create a simple 64×64 grayscale PNG as bytes."""
    img = Image.new("L", (64, 64), color=128)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def sample_color_image_bytes():
    """Create a simple 64×64 RGB JPEG as bytes."""
    img = Image.new("RGB", (64, 64), color=(100, 150, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()
