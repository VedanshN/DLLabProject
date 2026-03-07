"""
utils.py — Utility helpers for the colorization project.

Provides functions for:
    • converting tensors ↔ NumPy images
    • saving side-by-side comparison images (grayscale | prediction | original)
    • creating output directories
"""

import os
from typing import Optional

import matplotlib
matplotlib.use("Agg")  # non-interactive backend — safe for servers / scripts
import matplotlib.pyplot as plt
import numpy as np
import torch


# ── Directory helpers ─────────────────────────────────────────────────────

def ensure_dirs() -> None:
    """Create the standard output directories if they do not exist."""
    dirs = [
        "saved_models",
        "outputs/predictions",
        "outputs/training_samples",
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)


# ── Tensor / image conversion ────────────────────────────────────────────

def tensor_to_numpy(tensor: torch.Tensor) -> np.ndarray:
    """
    Convert a (C, H, W) float tensor in [0, 1] to a (H, W, C) uint8 NumPy
    array suitable for display with matplotlib or saving with PIL.
    """
    img = tensor.detach().cpu().clamp(0, 1).numpy()
    img = np.transpose(img, (1, 2, 0))  # C,H,W → H,W,C
    img = (img * 255).astype(np.uint8)
    return img


# ── Visualisation ────────────────────────────────────────────────────────

def save_comparison_image(
    grayscale: torch.Tensor,
    prediction: torch.Tensor,
    original: torch.Tensor,
    save_path: str,
    title: Optional[str] = None,
) -> None:
    """
    Save a side-by-side comparison: grayscale | prediction | original.

    Args:
        grayscale:  (1, H, W) tensor — the input grayscale image.
        prediction: (3, H, W) tensor — the model's colourised output.
        original:   (3, H, W) tensor — the ground-truth RGB image.
        save_path:  File path where the figure will be saved.
        title:      Optional super-title for the figure.
    """
    gray_np = tensor_to_numpy(grayscale.repeat(3, 1, 1))   # repeat to 3-ch for display
    pred_np = tensor_to_numpy(prediction)
    orig_np = tensor_to_numpy(original)

    fig, axes = plt.subplots(1, 3, figsize=(10, 4))

    axes[0].imshow(gray_np)
    axes[0].set_title("Grayscale Input")
    axes[0].axis("off")

    axes[1].imshow(pred_np)
    axes[1].set_title("Predicted Color")
    axes[1].axis("off")

    axes[2].imshow(orig_np)
    axes[2].set_title("Original RGB")
    axes[2].axis("off")

    if title:
        fig.suptitle(title, fontsize=14)

    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close(fig)


def save_batch_comparisons(
    grayscale_batch: torch.Tensor,
    prediction_batch: torch.Tensor,
    original_batch: torch.Tensor,
    output_dir: str,
    prefix: str = "sample",
    max_images: int = 8,
) -> None:
    """
    Save comparison images for the first ``max_images`` samples in a batch.

    Args:
        grayscale_batch:  (B, 1, H, W) tensor.
        prediction_batch: (B, 3, H, W) tensor.
        original_batch:   (B, 3, H, W) tensor.
        output_dir:       Directory to save images into.
        prefix:           Filename prefix.
        max_images:       Maximum number of samples to save.
    """
    os.makedirs(output_dir, exist_ok=True)
    n = min(max_images, grayscale_batch.size(0))

    for i in range(n):
        save_path = os.path.join(output_dir, f"{prefix}_{i + 1}.png")
        save_comparison_image(
            grayscale=grayscale_batch[i],
            prediction=prediction_batch[i],
            original=original_batch[i],
            save_path=save_path,
            title=f"Sample {i + 1}",
        )
