"""Model configuration schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ModelConfigUpdate(BaseModel):
    """Model config update schema."""

    enabled: Optional[bool] = None
    threshold: Optional[float] = None
    params_json: Optional[dict] = None


class ModelConfigResponse(BaseModel):
    """Model config response schema."""

    id: UUID
    home_id: UUID
    model_key: str
    enabled: bool
    threshold: Optional[float]
    params_json: Optional[dict]

    class Config:
        from_attributes = True
