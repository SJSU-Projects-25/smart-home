"""Data ingestion schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class PresignRequest(BaseModel):
    """Presign request schema."""

    device_id: UUID
    home_id: UUID
    mime: str


class PresignResponse(BaseModel):
    """Presign response schema."""

    upload_url: str
    s3_key: str
    expires_in: int


class ConfirmUploadRequest(BaseModel):
    """Confirm upload request schema."""

    s3_key: str
    device_id: UUID
    home_id: UUID
    duration_ms: Optional[int] = None


class ConfirmUploadResponse(BaseModel):
    """Confirm upload response schema."""

    job_id: str
