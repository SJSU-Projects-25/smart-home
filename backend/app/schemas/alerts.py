"""Alert schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class AlertResponse(BaseModel):
    """Alert response schema."""

    id: UUID
    home_id: UUID
    room_id: Optional[UUID]
    device_id: Optional[UUID]
    type: str
    severity: str
    status: str
    score: Optional[float]
    created_at: datetime
    acked_at: Optional[datetime]
    escalated_at: Optional[datetime]
    closed_at: Optional[datetime]
    notes: Optional[str]

    class Config:
        from_attributes = True
