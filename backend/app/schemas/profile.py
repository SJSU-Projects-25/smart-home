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


class PasswordChangeRequest(BaseModel):
    """Password change request schema."""

    current_password: str
    new_password: str


class TechnicianInfo(BaseModel):
    """Technician information schema."""

    id: str
    first_name: str | None
    last_name: str | None
    email: str
    contact_number: str | None
    operational_area: str | None

    class Config:
        from_attributes = True


class HomeProfileResponse(BaseModel):
    """Home profile response schema."""

    id: str
    name: str
    address: str | None
    contact_number: str | None
    home_size: str | None
    number_of_rooms: int | None
    house_type: str | None
    status: str
    assigned_technicians: list[TechnicianInfo]

    class Config:
        from_attributes = True


class HomeProfileUpdateRequest(BaseModel):
    """Home profile update request schema."""

    name: str | None = None
    address: str | None = None
    contact_number: str | None = None
    home_size: str | None = None
    number_of_rooms: int | None = None
    house_type: str | None = None
