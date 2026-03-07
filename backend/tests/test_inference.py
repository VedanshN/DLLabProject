"""
test_inference.py — Unit tests for the inference pipeline.
"""

import io
from unittest.mock import patch, MagicMock

import torch
from PIL import Image

from app.inference import _preprocess, _postprocess, predict


class TestPreprocess:
    """Tests for the _preprocess function."""

    def test_output_shape(self, sample_image_bytes):
        """Should produce (1, 1, 32, 32) tensor."""
        tensor = _preprocess(sample_image_bytes)
        assert tensor.shape == (1, 1, 32, 32)

    def test_output_range(self, sample_image_bytes):
        """Output values should be in [0, 1]."""
        tensor = _preprocess(sample_image_bytes)
        assert tensor.min() >= 0.0
        assert tensor.max() <= 1.0

    def test_output_dtype(self, sample_image_bytes):
        """Should be float32."""
        tensor = _preprocess(sample_image_bytes)
        assert tensor.dtype == torch.float32

    def test_handles_color_input(self, sample_color_image_bytes):
        """Should convert color images to grayscale."""
        tensor = _preprocess(sample_color_image_bytes)
        assert tensor.shape == (1, 1, 32, 32)

    def test_handles_various_sizes(self):
        """Should resize any image to 32×32."""
        for size in [(16, 16), (100, 100), (256, 128)]:
            img = Image.new("L", size, color=100)
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            tensor = _preprocess(buf.getvalue())
            assert tensor.shape == (1, 1, 32, 32)


class TestPostprocess:
    """Tests for the _postprocess function."""

    def test_output_is_pil_image(self):
        """Should return a PIL Image."""
        tensor = torch.rand(1, 3, 32, 32)
        result = _postprocess(tensor)
        assert isinstance(result, Image.Image)

    def test_output_mode_is_rgb(self):
        """Output image should be RGB mode."""
        tensor = torch.rand(1, 3, 32, 32)
        result = _postprocess(tensor)
        assert result.mode == "RGB"

    def test_output_size(self):
        """Output image should be 32×32."""
        tensor = torch.rand(1, 3, 32, 32)
        result = _postprocess(tensor)
        assert result.size == (32, 32)

    def test_clamps_out_of_range(self):
        """Values outside [0, 1] should be clamped, not crash."""
        tensor = torch.tensor([[[[1.5]], [[-0.5]], [[0.5]]]])  # (1, 3, 1, 1)
        result = _postprocess(tensor)
        assert isinstance(result, Image.Image)


class TestPredict:
    """Tests for the end-to-end predict function."""

    def test_predict_returns_image(self, sample_image_bytes, dummy_model):
        """predict() should return a PIL Image."""
        with patch("app.inference.get_model", return_value=dummy_model), \
             patch("app.inference.get_device", return_value=torch.device("cpu")):
            result = predict(sample_image_bytes)
            assert isinstance(result, Image.Image)
            assert result.mode == "RGB"
            assert result.size == (32, 32)
