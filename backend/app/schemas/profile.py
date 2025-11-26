"""Profile management schemas."""
from typing import Optional

from pydantic import BaseModel


class ProfileUpdateRequest(BaseModel):
    """Profile update schema - excludes email and role changes."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_number: Optional[str] = None
    operational_area: Optional[str] = None
    experience_level: Optional[str] = None
    certifications: Optional[str] = None


class ProfilePictureUploadResponse(BaseModel):
    """Response for profile picture upload request."""

    upload_url: str
    picture_key: str
