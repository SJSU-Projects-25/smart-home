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
    address: Optional[str] = None
    contact_number: Optional[str] = None
    home_size: Optional[str] = None
    number_of_rooms: Optional[int] = None
    house_type: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class HomeCreate(BaseModel):
    """Home creation schema."""

    name: str
    owner_id: Optional[UUID] = None # Optional because it might be created with user
    timezone: str
    address: Optional[str] = None
    contact_number: Optional[str] = None
    home_size: Optional[str] = None
    number_of_rooms: Optional[int] = None
    house_type: Optional[str] = None


class HomeUpdate(BaseModel):
    """Home update schema."""

    name: Optional[str] = None
    timezone: Optional[str] = None
    address: Optional[str] = None
    contact_number: Optional[str] = None
    home_size: Optional[str] = None
    number_of_rooms: Optional[int] = None
    house_type: Optional[str] = None
    status: Optional[str] = None

