"""Authentication service."""
from datetime import timedelta
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import create_access_token, verify_password
from app.db.models import Assignment, Home, User


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_access_token_for_user(
    user: User, settings: Settings, home_id: Optional[UUID] = None, expires_delta: Optional[timedelta] = None
) -> str:
    """Create an access token for a user."""
    token_data = {
        "user_id": str(user.id),
        "role": user.role,
    }
    if home_id:
        token_data["home_id"] = str(home_id)
    return create_access_token(token_data, settings, expires_delta)


def get_user_home_id(db: Session, user: User) -> Optional[UUID]:
    """Get the primary home ID for a user (owner's first home, or first assignment)."""
    if user.role == "owner":
        home = db.query(Home).filter(Home.owner_id == user.id).first()
        if home:
            return home.id
    else:
        assignment = db.query(Assignment).filter(Assignment.user_id == user.id).first()
        if assignment:
            return assignment.home_id
    return None
