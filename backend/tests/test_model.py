"""
test_model.py — Unit tests for ColorizationAutoencoder.
"""

import torch

from ml.model import ColorizationAutoencoder


class TestColorizationAutoencoder:
    """Tests for the autoencoder architecture."""

    def test_model_instantiation(self):
        model = ColorizationAutoencoder()
        assert model is not None
        assert hasattr(model, "encoder")
        assert hasattr(model, "decoder")

    def test_forward_pass_shape(self, dummy_model, sample_grayscale_tensor):
        """Input (B,1,32,32) should produce output (B,3,32,32)."""
        output = dummy_model(sample_grayscale_tensor)
        assert output.shape == (1, 3, 32, 32)

    def test_forward_pass_batch(self, dummy_model):
        """Batch of 4 should produce batch of 4."""
        batch = torch.rand(4, 1, 32, 32)
        output = dummy_model(batch)
        assert output.shape == (4, 3, 32, 32)

    def test_output_range(self, dummy_model, sample_grayscale_tensor):
        """Output should be in [0, 1] due to Sigmoid activation."""
        output = dummy_model(sample_grayscale_tensor)
        assert output.min() >= 0.0
        assert output.max() <= 1.0

    def test_encoder_output_shape(self, dummy_model):
        """Encoder should produce (B, 256, 8, 8) bottleneck."""
        x = torch.rand(1, 1, 32, 32)
        encoded = dummy_model.encoder(x)
        assert encoded.shape == (1, 256, 8, 8)

    def test_decoder_output_shape(self, dummy_model):
        """Decoder should produce (B, 3, 32, 32) from bottleneck."""
        bottleneck = torch.rand(1, 256, 8, 8)
        decoded = dummy_model.decoder(bottleneck)
        assert decoded.shape == (1, 3, 32, 32)

    def test_model_is_deterministic_in_eval(self, dummy_model):
        """Two forward passes with same input should produce same output in eval mode."""
        x = torch.rand(1, 1, 32, 32)
        out1 = dummy_model(x)
        out2 = dummy_model(x)
        assert torch.allclose(out1, out2)

    def test_parameter_count(self):
        """Model should have a reasonable number of parameters."""
        model = ColorizationAutoencoder()
        num_params = sum(p.numel() for p in model.parameters())
        assert num_params > 0
        assert num_params < 10_000_000  # Should be well under 10M params
