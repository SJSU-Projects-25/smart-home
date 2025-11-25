"""Model configuration router."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db, get_user_home_access
from app.db.models import User
from app.schemas.models_cfg import ModelConfigResponse, ModelConfigUpdate
from app.services.model_config_service import create_or_update_model_config, list_model_configs

router = APIRouter(prefix="/model-config", tags=["models"])


@router.get("", response_model=list[ModelConfigResponse])
async def list_model_configs_endpoint(
    home_id: Annotated[UUID, Query()],
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List model configs for a home."""
    _, validated_home_id = get_user_home_access(current_user, db, str(home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No home access")

    configs = list_model_configs(db, UUID(validated_home_id))
    return configs


@router.patch("/{model_key}", response_model=ModelConfigResponse)
async def update_model_config_endpoint(
    model_key: str,
    config_data: ModelConfigUpdate,
    home_id: Annotated[UUID, Query()],
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Update a model config."""
    _, validated_home_id = get_user_home_access(current_user, db, str(home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No home access")

    config = create_or_update_model_config(db, UUID(validated_home_id), model_key, config_data)
    return config
