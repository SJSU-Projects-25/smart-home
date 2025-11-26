"""Home schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class HomeResponse(BaseModel):
    """Home response schema."""

    id: UUID
    name: str
    owner_id: UUID
    timezone: str
    created_at: datetime

    class Config:
        from_attributes = True


class HomeCreate(BaseModel):
    """Home creation schema."""

    name: str
    owner_id: UUID
    timezone: str


class HomeUpdate(BaseModel):
    """Home update schema."""

    name: Optional[str] = None
    timezone: Optional[str] = None

