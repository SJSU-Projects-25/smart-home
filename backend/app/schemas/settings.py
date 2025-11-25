"""Settings schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ContactCreate(BaseModel):
    """Contact creation schema."""

    home_id: UUID
    name: str
    channel: str  # 'sms', 'email'
    value: str
    priority: int = 0


class ContactResponse(BaseModel):
    """Contact response schema."""

    id: UUID
    home_id: UUID
    name: str
    channel: str
    value: str
    priority: int

    class Config:
        from_attributes = True


class PolicyUpdate(BaseModel):
    """Policy update schema."""

    quiet_start_time: Optional[str] = None  # HH:MM:SS format
    quiet_end_time: Optional[str] = None  # HH:MM:SS format
    auto_escalate_after_seconds: Optional[int] = None


class PolicyResponse(BaseModel):
    """Policy response schema."""

    id: UUID
    home_id: UUID
    quiet_start_time: Optional[str]
    quiet_end_time: Optional[str]
    auto_escalate_after_seconds: Optional[int]

    class Config:
        from_attributes = True
