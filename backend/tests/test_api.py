"""
test_api.py — Integration tests for the FastAPI endpoints.

Uses FastAPI's TestClient with a mock model to avoid needing
a trained .pth file for API testing.
"""

import io
from unittest.mock import patch

import pytest
import torch
from fastapi.testclient import TestClient
from PIL import Image

from ml.model import ColorizationAutoencoder
from app.main import app


@pytest.fixture
def client():
    """
    Create a TestClient with a dummy model injected
    so we don't need a real .pth file.
    """
    dummy = ColorizationAutoencoder()
    dummy.eval()

    with patch("app.model_loader._model", dummy), \
         patch("app.model_loader._device", torch.device("cpu")):
        with TestClient(app, raise_server_exceptions=False) as c:
            yield c


class TestHealthCheck:
    """Tests for GET /."""

    def test_health_check_status(self, client):
        response = client.get("/")
        assert response.status_code == 200

    def test_health_check_body(self, client):
        response = client.get("/")
        assert response.json() == {"status": "server running"}


class TestColorizeEndpoint:
    """Tests for POST /colorize."""

    def _make_image_bytes(self, mode="L", size=(64, 64), fmt="PNG"):
        img = Image.new(mode, size, color=128 if mode == "L" else (128, 128, 128))
        buf = io.BytesIO()
        img.save(buf, format=fmt)
        buf.seek(0)
        return buf

    def test_colorize_grayscale_png(self, client):
        """Should accept a grayscale PNG and return a PNG image."""
        buf = self._make_image_bytes("L", fmt="PNG")
        response = client.post(
            "/colorize",
            files={"file": ("test.png", buf, "image/png")},
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "image/png"

    def test_colorize_rgb_jpeg(self, client):
        """Should accept an RGB JPEG and return a PNG image."""
        buf = self._make_image_bytes("RGB", fmt="JPEG")
        response = client.post(
            "/colorize",
            files={"file": ("test.jpg", buf, "image/jpeg")},
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "image/png"

    def test_colorize_returns_valid_image(self, client):
        """Returned bytes should be a valid PNG image."""
        buf = self._make_image_bytes("L")
        response = client.post(
            "/colorize",
            files={"file": ("test.png", buf, "image/png")},
        )
        result_image = Image.open(io.BytesIO(response.content))
        assert result_image.mode == "RGB"
        assert result_image.size == (32, 32)

    def test_colorize_rejects_non_image(self, client):
        """Should return 400 for non-image content type."""
        buf = io.BytesIO(b"not an image")
        response = client.post(
            "/colorize",
            files={"file": ("test.txt", buf, "text/plain")},
        )
        assert response.status_code == 400

    def test_colorize_no_file(self, client):
        """Should return 422 when no file is provided."""
        response = client.post("/colorize")
        assert response.status_code == 422
