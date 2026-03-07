"""
test_utils.py — Unit tests for utility functions.
"""

import os
import tempfile

import numpy as np
import torch

from ml.utils import tensor_to_numpy, ensure_dirs, save_comparison_image


class TestTensorToNumpy:
    """Tests for tensor_to_numpy conversion."""

    def test_output_shape(self):
        """(3, 32, 32) → (32, 32, 3)."""
        tensor = torch.rand(3, 32, 32)
        result = tensor_to_numpy(tensor)
        assert result.shape == (32, 32, 3)

    def test_output_dtype(self):
        """Should produce uint8 array."""
        tensor = torch.rand(3, 32, 32)
        result = tensor_to_numpy(tensor)
        assert result.dtype == np.uint8

    def test_value_range(self):
        """Output should be in [0, 255]."""
        tensor = torch.rand(3, 32, 32)
        result = tensor_to_numpy(tensor)
        assert result.min() >= 0
        assert result.max() <= 255

    def test_clamps_values(self):
        """Values outside [0, 1] should be clamped."""
        tensor = torch.tensor([[[1.5, -0.5], [0.5, 0.0]]])  # (1, 2, 2)
        result = tensor_to_numpy(tensor)
        assert result.min() >= 0
        assert result.max() <= 255

    def test_single_channel(self):
        """(1, 32, 32) → (32, 32, 1)."""
        tensor = torch.rand(1, 32, 32)
        result = tensor_to_numpy(tensor)
        assert result.shape == (32, 32, 1)


class TestEnsureDirs:
    """Tests for ensure_dirs."""

    def test_creates_directories(self):
        """Should create saved_models, outputs/predictions, outputs/training_samples."""
        with tempfile.TemporaryDirectory() as tmpdir:
            orig_dir = os.getcwd()
            os.chdir(tmpdir)
            try:
                ensure_dirs()
                assert os.path.isdir("saved_models")
                assert os.path.isdir("outputs/predictions")
                assert os.path.isdir("outputs/training_samples")
            finally:
                os.chdir(orig_dir)


class TestSaveComparisonImage:
    """Tests for save_comparison_image."""

    def test_creates_file(self):
        """Should save a valid image file."""
        gray = torch.rand(1, 32, 32)
        pred = torch.rand(3, 32, 32)
        orig = torch.rand(3, 32, 32)

        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
            save_comparison_image(gray, pred, orig, f.name, title="Test")
            assert os.path.isfile(f.name)
            assert os.path.getsize(f.name) > 0
            os.unlink(f.name)
