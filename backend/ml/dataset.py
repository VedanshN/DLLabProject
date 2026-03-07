"""
dataset.py — Custom PyTorch Dataset for Image Colorization

Wraps the CIFAR-10 dataset and produces (grayscale, RGB) training pairs.
Grayscale images are computed from the original RGB images using the
luminance formula:  L = 0.2989*R + 0.5870*G + 0.1140*B

Each sample returns:
    input_tensor  : torch.Tensor of shape (1, 32, 32)  — grayscale
    target_tensor : torch.Tensor of shape (3, 32, 32)  — original RGB
Both tensors are normalised to the [0, 1] range.
"""

from typing import Tuple

import torch
from torch.utils.data import Dataset
from torchvision import datasets, transforms


class ColorizationDataset(Dataset):
    """
    A dataset that wraps CIFAR-10 and returns (grayscale, RGB) image pairs
    for training an image-colorization autoencoder.

    Args:
        root:      Directory where CIFAR-10 will be downloaded / cached.
        train:     If True, use the training split; otherwise the test split.
        download:  If True, download CIFAR-10 when it is not found locally.
    """

    def __init__(
        self,
        root: str = "./data",
        train: bool = True,
        download: bool = True,
    ) -> None:
        super().__init__()

        # ToTensor() converts a PIL Image (H×W×C, 0-255)
        # to a FloatTensor (C×H×W, 0.0-1.0)
        self.transform = transforms.ToTensor()

        # Load CIFAR-10 (32×32 RGB images)
        self.dataset = datasets.CIFAR10(
            root=root,
            train=train,
            download=download,
            transform=self.transform,
        )

    def __len__(self) -> int:
        """Return the total number of samples."""
        return len(self.dataset)

    def __getitem__(self, index: int) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Fetch a single (grayscale, RGB) pair.

        Args:
            index: Index of the sample to retrieve.

        Returns:
            grayscale_tensor: (1, 32, 32) float tensor in [0, 1].
            rgb_tensor:       (3, 32, 32) float tensor in [0, 1].
        """
        # rgb_tensor shape: (3, 32, 32), already normalised by ToTensor()
        rgb_tensor, _ = self.dataset[index]

        # Convert RGB → grayscale using the ITU-R BT.601 luminance weights
        # This produces a (1, 32, 32) tensor
        grayscale_tensor = (
            0.2989 * rgb_tensor[0:1, :, :]
            + 0.5870 * rgb_tensor[1:2, :, :]
            + 0.1140 * rgb_tensor[2:3, :, :]
        )

        return grayscale_tensor, rgb_tensor


def get_dataloaders(
    root: str = "./data",
    batch_size: int = 64,
    num_workers: int = 2,
) -> Tuple[torch.utils.data.DataLoader, torch.utils.data.DataLoader]:
    """
    Convenience helper that returns ready-to-use train and test DataLoaders.

    Args:
        root:        Path where CIFAR-10 is stored.
        batch_size:  Mini-batch size.
        num_workers: Number of subprocesses for data loading.

    Returns:
        train_loader: DataLoader for the training split.
        test_loader:  DataLoader for the test split.
    """
    train_dataset = ColorizationDataset(root=root, train=True, download=True)
    test_dataset = ColorizationDataset(root=root, train=False, download=True)

    train_loader = torch.utils.data.DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True,
    )

    test_loader = torch.utils.data.DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
    )

    return train_loader, test_loader
