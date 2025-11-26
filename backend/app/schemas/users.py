"""User schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    """User response schema."""

    id: UUID
    email: str
    role: str
    home_id: Optional[UUID] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_number: Optional[str] = None
    operational_area: Optional[str] = None
    experience_level: Optional[str] = None
    certifications: Optional[str] = None
    profile_picture_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    """User creation schema."""

    email: EmailStr
    password: str
    role: str  # 'owner', 'technician', 'staff', 'admin'
    home_id: Optional[str] = None  # Accept string, will be converted to UUID in service
    
    # New fields
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_number: Optional[str] = None
    
    # Technician specific
    operational_area: Optional[str] = None
    experience_level: Optional[str] = None
    certifications: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "password123",
                "role": "owner",
                "first_name": "John",
                "last_name": "Doe",
                "contact_number": "1234567890",
            }
        }


class UserUpdate(BaseModel):
    """User update schema."""

    email: Optional[EmailStr] = None
    role: Optional[str] = None
    home_id: Optional[str] = None  # Accept string, will be converted to UUID in service
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_number: Optional[str] = None
    operational_area: Optional[str] = None
    experience_level: Optional[str] = None
    certifications: Optional[str] = None
    profile_picture_url: Optional[str] = None
