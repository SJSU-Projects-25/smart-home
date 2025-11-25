"""Model configuration service."""
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import ModelConfig
from app.schemas.models_cfg import ModelConfigUpdate


def list_model_configs(db: Session, home_id: UUID) -> list[ModelConfig]:
    """List model configs for a home."""
    return db.query(ModelConfig).filter(ModelConfig.home_id == home_id).all()


def get_model_config(db: Session, home_id: UUID, model_key: str) -> Optional[ModelConfig]:
    """Get a model config by home_id and model_key."""
    return db.query(ModelConfig).filter(ModelConfig.home_id == home_id, ModelConfig.model_key == model_key).first()


def create_or_update_model_config(
    db: Session, home_id: UUID, model_key: str, config_data: ModelConfigUpdate
) -> ModelConfig:
    """Create or update a model config."""
    config = get_model_config(db, home_id, model_key)

    if config:
        # Update existing
        if config_data.enabled is not None:
            config.enabled = config_data.enabled
        if config_data.threshold is not None:
            config.threshold = config_data.threshold
        if config_data.params_json is not None:
            config.params_json = config_data.params_json
    else:
        # Create new
        config = ModelConfig(
            home_id=home_id,
            model_key=model_key,
            enabled=config_data.enabled if config_data.enabled is not None else True,
            threshold=config_data.threshold,
            params_json=config_data.params_json,
        )
        db.add(config)

    db.commit()
    db.refresh(config)
    return config
