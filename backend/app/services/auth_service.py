"""Authentication service."""
from datetime import timedelta
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.db.models import Assignment, Home, User
from app.schemas.auth import RegisterRequest


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


def register_user(db: Session, register_data: RegisterRequest) -> User:
    """Register a new user."""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == register_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create User
    user = User(
        email=register_data.email,
        password_hash=get_password_hash(register_data.password),
        role=register_data.role,
        first_name=register_data.first_name,
        last_name=register_data.last_name,
        contact_number=register_data.contact_number,
        operational_area=register_data.operational_area,
        experience_level=register_data.experience_level,
        certifications=register_data.certifications,
    )
    db.add(user)
    db.flush()  # Get ID

    # If Owner, create Home
    if register_data.role == "owner":
        if not register_data.home_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Home name required for owners",
            )

        home = Home(
            name=register_data.home_name,
            owner_id=user.id,
            timezone="UTC",  # Default
            address=register_data.home_address,
            contact_number=register_data.contact_number,
            home_size=register_data.home_size,
            number_of_rooms=register_data.number_of_rooms,
            house_type=register_data.house_type,
            status="New Home Registered",
        )
        db.add(home)

    db.commit()
    db.refresh(user)
    return user
