"""
model.py — Convolutional Autoencoder for Image Colorization

Architecture
============

Encoder:
    Conv2d(1 → 64)  → ReLU → MaxPool2d(2)       # 32×32 → 16×16
    Conv2d(64 → 128) → ReLU → MaxPool2d(2)       # 16×16 →  8×8
    Conv2d(128 → 256) → ReLU                      #  8×8  →  8×8  (bottleneck)

Decoder:
    ConvTranspose2d(256 → 128, stride=2) → ReLU   #  8×8  → 16×16
    ConvTranspose2d(128 → 64, stride=2)  → ReLU   # 16×16 → 32×32
    Conv2d(64 → 3)  → Sigmoid                     # 32×32  (3-channel RGB)

Input shape  : (B, 1, 32, 32)
Output shape : (B, 3, 32, 32)
"""

import torch
import torch.nn as nn


class ColorizationAutoencoder(nn.Module):
    """
    Convolutional autoencoder that maps a single-channel grayscale image
    to a 3-channel RGB image.
    """

    def __init__(self) -> None:
        super().__init__()

        # ── Encoder ──────────────────────────────────────────────────
        self.encoder = nn.Sequential(
            # Block 1: 1×32×32 → 64×16×16
            nn.Conv2d(
                in_channels=1,
                out_channels=64,
                kernel_size=3,
                padding=1,
            ),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            # Block 2: 64×16×16 → 128×8×8
            nn.Conv2d(
                in_channels=64,
                out_channels=128,
                kernel_size=3,
                padding=1,
            ),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            # Block 3 (bottleneck): 128×8×8 → 256×8×8
            nn.Conv2d(
                in_channels=128,
                out_channels=256,
                kernel_size=3,
                padding=1,
            ),
            nn.ReLU(inplace=True),
        )

        # ── Decoder ──────────────────────────────────────────────────
        self.decoder = nn.Sequential(
            # Up-block 1: 256×8×8 → 128×16×16
            nn.ConvTranspose2d(
                in_channels=256,
                out_channels=128,
                kernel_size=3,
                stride=2,
                padding=1,
                output_padding=1,
            ),
            nn.ReLU(inplace=True),
            # Up-block 2: 128×16×16 → 64×32×32
            nn.ConvTranspose2d(
                in_channels=128,
                out_channels=64,
                kernel_size=3,
                stride=2,
                padding=1,
                output_padding=1,
            ),
            nn.ReLU(inplace=True),
            # Final projection: 64×32×32 → 3×32×32
            nn.Conv2d(
                in_channels=64,
                out_channels=3,
                kernel_size=3,
                padding=1,
            ),
            # Sigmoid to clamp output to [0, 1]
            nn.Sigmoid(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.

        Args:
            x: Input grayscale tensor of shape (B, 1, 32, 32).

        Returns:
            Colourised RGB tensor of shape (B, 3, 32, 32).
        """
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded
