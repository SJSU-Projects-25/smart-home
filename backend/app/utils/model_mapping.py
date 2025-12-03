"""Utility functions for mapping between ML model types and config keys."""

# Mapping from ML model output types to model config keys
# ML model returns types like "Fall / Impact", "Distress / Pain", etc.
# Config keys are snake_case versions like "fall_impact", "distress_pain", etc.
ML_TYPE_TO_CONFIG_KEY = {
    "Fall / Impact": "fall_impact",
    "Distress / Pain": "distress_pain",
    "Choking / Vomiting": "choking_vomiting",
    "Breathing Emergency": "breathing_emergency",
    "Fire / Smoke Alarm": "fire_smoke_alarm",
    "Glass Break": "glass_break",
    "Coughing": "coughing",
    "Water Running": "water_running",
    "Door / Knock": "door_knock",
    "Footsteps": "footsteps",
}

# Reverse mapping for display purposes
CONFIG_KEY_TO_ML_TYPE = {v: k for k, v in ML_TYPE_TO_CONFIG_KEY.items()}


def ml_type_to_config_key(ml_type: str) -> str | None:
    """Convert ML model output type to config key."""
    return ML_TYPE_TO_CONFIG_KEY.get(ml_type)


def config_key_to_ml_type(config_key: str) -> str | None:
    """Convert config key to ML model output type."""
    return CONFIG_KEY_TO_ML_TYPE.get(config_key)

