"""
test_model_loader.py — Unit tests for the singleton model loader.
"""

import os
from unittest.mock import patch

import pytest
import torch

import app.model_loader as model_loader_module
from app.model_loader import load_model, get_model, get_device


class TestModelLoader:
    """Tests for load_model, get_model, get_device."""

    def setup_method(self):
        """Reset the module-level state before each test."""
        model_loader_module._model = None
        model_loader_module._device = None

    def test_load_model_success(self, dummy_model_path):
        """Should load model from a valid .pth file without error."""
        load_model(model_path=dummy_model_path)
        model = get_model()
        assert model is not None
        assert not model.training  # should be in eval mode

    def test_load_model_missing_file(self):
        """Should raise FileNotFoundError for a missing path."""
        with pytest.raises(FileNotFoundError):
            load_model(model_path="/nonexistent/path.pth")

    def test_get_model_before_load(self):
        """Should raise RuntimeError if model hasn't been loaded."""
        with pytest.raises(RuntimeError, match="Model not loaded"):
            get_model()

    def test_get_device_before_load(self):
        """Should raise RuntimeError if model hasn't been loaded."""
        with pytest.raises(RuntimeError, match="Model not loaded"):
            get_device()

    def test_get_device_after_load(self, dummy_model_path):
        """Should return a valid torch.device after loading."""
        load_model(model_path=dummy_model_path)
        device = get_device()
        assert isinstance(device, torch.device)

    def test_idempotent_load(self, dummy_model_path):
        """Calling load_model twice should not reload (idempotent)."""
        load_model(model_path=dummy_model_path)
        model1 = get_model()
        load_model(model_path=dummy_model_path)
        model2 = get_model()
        assert model1 is model2  # same object
