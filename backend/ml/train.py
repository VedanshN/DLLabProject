"""
train.py — Training pipeline for the Colorization Autoencoder.

Usage (run from the ``backend/`` directory):
    python -m ml.train                    # default 25 epochs
    python -m ml.train --epochs 50        # custom epoch count
    python -m ml.train --batch-size 128   # custom batch size

The best model (lowest validation loss) is saved to:
    saved_models/colorization_autoencoder.pth
"""

import argparse
import os
import time
from typing import Tuple

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from tqdm import tqdm

from ml.dataset import ColorizationDataset, get_dataloaders
from ml.model import ColorizationAutoencoder
from ml.utils import ensure_dirs, save_batch_comparisons


# ── Helpers ──────────────────────────────────────────────────────────────

def _select_device() -> torch.device:
    """Pick the best available device (CUDA → MPS → CPU)."""
    if torch.cuda.is_available():
        return torch.device("cuda")
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
) -> float:
    """
    Train for a single epoch and return the average loss.
    """
    model.train()
    running_loss = 0.0

    for grayscale, rgb in tqdm(loader, desc="  Train", leave=False):
        grayscale = grayscale.to(device)
        rgb = rgb.to(device)

        # Forward
        predictions = model(grayscale)
        loss = criterion(predictions, rgb)

        # Backward
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * grayscale.size(0)

    return running_loss / len(loader.dataset)


@torch.no_grad()
def validate(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> Tuple[float, torch.Tensor, torch.Tensor, torch.Tensor]:
    """
    Evaluate on the validation / test set.

    Returns:
        avg_loss:    Mean MSE over the dataset.
        grayscale:   Last batch of grayscale inputs.
        predictions: Last batch of model outputs.
        originals:   Last batch of ground-truth RGB images.
    """
    model.eval()
    running_loss = 0.0

    for grayscale, rgb in tqdm(loader, desc="  Valid", leave=False):
        grayscale = grayscale.to(device)
        rgb = rgb.to(device)

        predictions = model(grayscale)
        loss = criterion(predictions, rgb)

        running_loss += loss.item() * grayscale.size(0)

    avg_loss = running_loss / len(loader.dataset)
    return avg_loss, grayscale, predictions, rgb


# ── Main training loop ──────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Train the Colorization Autoencoder")
    parser.add_argument("--epochs", type=int, default=25, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=64, help="Mini-batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate")
    parser.add_argument("--num-workers", type=int, default=2, help="DataLoader workers")
    args = parser.parse_args()

    # Setup
    ensure_dirs()
    device = _select_device()
    print(f"Using device: {device}")

    # Data
    train_loader, test_loader = get_dataloaders(
        batch_size=args.batch_size,
        num_workers=args.num_workers,
    )
    print(f"Train samples: {len(train_loader.dataset):,}")
    print(f"Test  samples: {len(test_loader.dataset):,}")

    # Model, loss, optimiser
    model = ColorizationAutoencoder().to(device)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)

    best_val_loss = float("inf")
    save_path = os.path.join("saved_models", "colorization_autoencoder.pth")

    # ── Training loop ────────────────────────────────────────────────
    print(f"\nStarting training for {args.epochs} epochs …\n")
    start_time = time.time()

    for epoch in range(1, args.epochs + 1):
        train_loss = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, gray_batch, pred_batch, orig_batch = validate(
            model, test_loader, criterion, device,
        )

        # Logging
        improved = ""
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), save_path)
            improved = "  ★ saved best model"

        print(
            f"Epoch [{epoch:>3}/{args.epochs}]  "
            f"train_loss={train_loss:.6f}  "
            f"val_loss={val_loss:.6f}{improved}"
        )

        # Save sample comparison images every 5 epochs
        if epoch % 5 == 0 or epoch == 1:
            save_batch_comparisons(
                grayscale_batch=gray_batch.cpu(),
                prediction_batch=pred_batch.cpu(),
                original_batch=orig_batch.cpu(),
                output_dir="outputs/training_samples",
                prefix=f"epoch_{epoch:03d}",
                max_images=4,
            )

    elapsed = time.time() - start_time
    print(f"\nTraining complete in {elapsed / 60:.1f} minutes.")
    print(f"Best validation loss: {best_val_loss:.6f}")
    print(f"Model saved to: {save_path}")


if __name__ == "__main__":
    main()
