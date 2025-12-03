"""Room schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class RoomResponse(BaseModel):
    """Room response schema."""

    id: UUID
    home_id: UUID
    name: str
    type: Optional[str] = None

    class Config:
        from_attributes = True


class RoomCreate(BaseModel):
    """Create a new room."""

    name: str
    type: Optional[str] = None


class RoomUpdate(BaseModel):
    """Update an existing room."""

    name: Optional[str] = None
    type: Optional[str] = None


