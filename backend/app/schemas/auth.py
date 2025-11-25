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
