"""
test_dataset.py — Unit tests for ColorizationDataset and get_dataloaders.
"""

import torch

from ml.dataset import ColorizationDataset, get_dataloaders


class TestColorizationDataset:
    """Tests for the CIFAR-10 dataset wrapper."""

    def test_dataset_length(self):
        """Training split should have 50,000 samples."""
        ds = ColorizationDataset(root="./data", train=True, download=True)
        assert len(ds) == 50_000

    def test_test_dataset_length(self):
        """Test split should have 10,000 samples."""
        ds = ColorizationDataset(root="./data", train=False, download=True)
        assert len(ds) == 10_000

    def test_sample_shapes(self):
        """Each sample should return (1,32,32) grayscale and (3,32,32) RGB."""
        ds = ColorizationDataset(root="./data", train=False, download=True)
        gray, rgb = ds[0]
        assert gray.shape == (1, 32, 32)
        assert rgb.shape == (3, 32, 32)

    def test_value_range(self):
        """Tensor values should be normalised to [0, 1]."""
        ds = ColorizationDataset(root="./data", train=False, download=True)
        gray, rgb = ds[0]
        assert gray.min() >= 0.0
        assert gray.max() <= 1.0
        assert rgb.min() >= 0.0
        assert rgb.max() <= 1.0

    def test_grayscale_is_single_channel(self):
        """Grayscale tensor should have exactly 1 channel."""
        ds = ColorizationDataset(root="./data", train=False, download=True)
        gray, _ = ds[0]
        assert gray.shape[0] == 1

    def test_tensor_dtype(self):
        """Both tensors should be float32."""
        ds = ColorizationDataset(root="./data", train=False, download=True)
        gray, rgb = ds[0]
        assert gray.dtype == torch.float32
        assert rgb.dtype == torch.float32


class TestGetDataloaders:
    """Tests for the get_dataloaders convenience function."""

    def test_returns_two_loaders(self):
        train_loader, test_loader = get_dataloaders(batch_size=16, num_workers=0)
        assert train_loader is not None
        assert test_loader is not None

    def test_loader_dataset_sizes(self):
        train_loader, test_loader = get_dataloaders(batch_size=16, num_workers=0)
        assert len(train_loader.dataset) == 50_000
        assert len(test_loader.dataset) == 10_000

    def test_batch_shape(self):
        """First batch should have correct shape for batch_size=16."""
        _, test_loader = get_dataloaders(batch_size=16, num_workers=0)
        gray_batch, rgb_batch = next(iter(test_loader))
        assert gray_batch.shape == (16, 1, 32, 32)
        assert rgb_batch.shape == (16, 3, 32, 32)
