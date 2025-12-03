"""Schemas for installation requests (owner ↔ technician workflow)."""
from datetime import datetime
from typing import Optional, Sequence
from uuid import UUID

from pydantic import BaseModel


class InstallationItemBase(BaseModel):
    """Base fields for an installation item."""

    room_id: Optional[UUID] = None
    coverage_type: str
    desired_device_count: int = 1
    notes: Optional[str] = None


class InstallationItemCreate(InstallationItemBase):
    """Create payload for an installation item."""

    pass


class InstallationItemResponse(InstallationItemBase):
    """Response schema for an installation item."""

    id: UUID
    proposed_device_type: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


class InstallationRequestCreate(BaseModel):
    """Owner creates a new installation request."""

    home_id: Optional[UUID] = None
    notes: Optional[str] = None
    items: Sequence[InstallationItemCreate]


class InstallationRequestResponse(BaseModel):
    """Full installation request with nested items."""

    id: UUID
    home_id: UUID
    owner_id: UUID
    technician_id: Optional[UUID] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: list[InstallationItemResponse]

    class Config:
        from_attributes = True


class OwnerInstallationStatusUpdate(BaseModel):
    """Owner approves or requests changes."""

    action: str  # 'approve' or 'request_changes'
    notes: Optional[str] = None


class TechInstallationUpdate(BaseModel):
    """Technician updates request status or notes."""

    status: Optional[str] = None  # 'in_review','plan_ready','installed'
    notes: Optional[str] = None


class TechInstallationItemUpdate(BaseModel):
    """Technician updates a single room item within a request."""

    status: Optional[str] = None  # 'pending','approved','rejected','installed'
    desired_device_count: Optional[int] = None
    notes: Optional[str] = None


