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
    created_at: datetime

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    """User creation schema."""

    email: EmailStr
    password: str
    role: str  # 'owner', 'technician', 'staff', 'admin'
    home_id: Optional[str] = None  # Accept string, will be converted to UUID in service

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "password123",
                "role": "owner",
                "home_id": None,
            }
        }


class UserUpdate(BaseModel):
    """User update schema."""

    email: Optional[EmailStr] = None
    role: Optional[str] = None
    home_id: Optional[str] = None  # Accept string, will be converted to UUID in service
