"""Authentication schemas."""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response schema."""

    id: UUID
    email: str
    role: str
    home_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """Login response schema."""

    user: UserResponse
    token: str


class TokenData(BaseModel):
    """Token data schema."""

    user_id: str
    role: str
    home_id: Optional[str] = None


class RegisterRequest(BaseModel):
    """Register request schema."""

    email: EmailStr
    password: str
    role: str  # 'owner', 'technician'
    first_name: str
    last_name: str
    contact_number: str

    # Home Owner fields
    home_name: Optional[str] = None
    home_address: Optional[str] = None
    home_size: Optional[str] = None
    number_of_rooms: Optional[int] = None
    house_type: Optional[str] = None

    # Technician fields
    operational_area: Optional[str] = None
    experience_level: Optional[str] = None
    certifications: Optional[str] = None
