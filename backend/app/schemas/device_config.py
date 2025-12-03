"""Device configuration schemas."""
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class DeviceConfigBase(BaseModel):
    heartbeat_timeout_seconds: int = Field(ge=30, le=86400, description="Timeout in seconds (30s to 24h)")
    enabled: bool = True
    notes: Optional[str] = None


class DeviceConfigCreate(DeviceConfigBase):
    device_id: UUID


class DeviceConfigUpdate(BaseModel):
    heartbeat_timeout_seconds: Optional[int] = Field(None, ge=30, le=86400)
    enabled: Optional[bool] = None
    notes: Optional[str] = None


class DeviceConfigResponse(DeviceConfigBase):
    id: UUID
    device_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
