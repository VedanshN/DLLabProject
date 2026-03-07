"""
evaluate.py — Evaluation and visualization for the trained Colorization Autoencoder.

Usage (run from the ``backend/`` directory):
    python -m ml.evaluate
    python -m ml.evaluate --num-samples 16
    python -m ml.evaluate --model-path saved_models/colorization_autoencoder.pth

Generates side-by-side comparison images (grayscale | prediction | original)
and saves them to ``outputs/predictions/``.
"""

import argparse
import os

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from ml.dataset import ColorizationDataset
from ml.model import ColorizationAutoencoder
from ml.utils import ensure_dirs, save_comparison_image, tensor_to_numpy


def _select_device() -> torch.device:
    """Pick the best available device."""
    if torch.cuda.is_available():
        return torch.device("cuda")
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


def load_trained_model(
    model_path: str,
    device: torch.device,
) -> ColorizationAutoencoder:
    """
    Instantiate the model and load trained weights.

    Args:
        model_path: Path to the ``.pth`` state-dict file.
        device:     Device to map the model onto.

    Returns:
        The model in evaluation mode.
    """
    model = ColorizationAutoencoder().to(device)
    model.load_state_dict(
        torch.load(model_path, map_location=device, weights_only=True)
    )
    model.eval()
    print(f"Loaded model from {model_path}")
    return model


@torch.no_grad()
def generate_predictions(
    model: ColorizationAutoencoder,
    loader: DataLoader,
    device: torch.device,
    output_dir: str,
    num_samples: int = 10,
) -> float:
    """
    Run inference on the first ``num_samples`` images from ``loader``,
    save comparison images, and compute the average MSE loss.

    Args:
        model:       Trained model in eval mode.
        loader:      DataLoader (typically the test split).
        device:      Compute device.
        output_dir:  Directory to write comparison PNGs.
        num_samples: Number of samples to evaluate and save.

    Returns:
        Average MSE loss over the evaluated samples.
    """
    os.makedirs(output_dir, exist_ok=True)

    criterion = nn.MSELoss()
    total_loss = 0.0
    count = 0

    for grayscale, rgb in loader:
        grayscale = grayscale.to(device)
        rgb = rgb.to(device)

        predictions = model(grayscale)
        loss = criterion(predictions, rgb)
        total_loss += loss.item() * grayscale.size(0)

        # Save individual comparison images
        for i in range(grayscale.size(0)):
            if count >= num_samples:
                break  # we have enough

            save_path = os.path.join(output_dir, f"prediction_{count + 1:03d}.png")
            save_comparison_image(
                grayscale=grayscale[i].cpu(),
                prediction=predictions[i].cpu(),
                original=rgb[i].cpu(),
                save_path=save_path,
                title=f"Test Sample {count + 1}",
            )
            count += 1

        if count >= num_samples:
            break

    avg_loss = total_loss / max(count, 1)
    return avg_loss


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate the Colorization Autoencoder")
    parser.add_argument(
        "--model-path",
        type=str,
        default="saved_models/colorization_autoencoder.pth",
        help="Path to the trained model weights",
    )
    parser.add_argument(
        "--num-samples",
        type=int,
        default=10,
        help="Number of test samples to visualise",
    )
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    args = parser.parse_args()

    ensure_dirs()
    device = _select_device()
    print(f"Using device: {device}")

    # Load model
    model = load_trained_model(args.model_path, device)

    # Build test DataLoader
    test_dataset = ColorizationDataset(root="./data", train=False, download=True)
    test_loader = DataLoader(test_dataset, batch_size=args.batch_size, shuffle=False)

    # Generate and save predictions
    output_dir = "outputs/predictions"
    avg_loss = generate_predictions(
        model=model,
        loader=test_loader,
        device=device,
        output_dir=output_dir,
        num_samples=args.num_samples,
    )

    print(f"\nAverage MSE loss on evaluated samples: {avg_loss:.6f}")
    print(f"Comparison images saved to: {output_dir}/")


if __name__ == "__main__":
    main()
