"""Device schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DeviceCreate(BaseModel):
    """Device creation schema."""

    home_id: UUID
    room_id: Optional[UUID] = None
    name: str
    type: str
    firmware_version: Optional[str] = None


class DeviceUpdate(BaseModel):
    """Device update schema."""

    name: Optional[str] = None
    room_id: Optional[UUID] = None
    type: Optional[str] = None
    status: Optional[str] = None
    firmware_version: Optional[str] = None


class DeviceResponse(BaseModel):
    """Device response schema."""

    id: UUID
    home_id: UUID
    room_id: Optional[UUID]
    name: str
    type: str
    status: str
    last_seen_at: Optional[datetime]
    firmware_version: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DeviceHeartbeatRequest(BaseModel):
    """Device heartbeat request schema."""

    firmware_version: Optional[str] = None
