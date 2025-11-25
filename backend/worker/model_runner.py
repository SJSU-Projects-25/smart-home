"""ML model runner for processing device data."""
from typing import Any


class ModelRunner:
    """Stub model runner for inference."""

    def load(self) -> None:
        """Load the model (no-op for now)."""
        print("ModelRunner: Model loaded (stub)")

    def predict(self, wav_bytes: bytes) -> dict[str, Any]:
        """
        Run inference on audio data.

        For now, returns a fixed decision.
        """
        return {
            "type": "scream",
            "severity": "high",
            "score": 0.95,
            "scores": {"scream": 0.95},
        }
