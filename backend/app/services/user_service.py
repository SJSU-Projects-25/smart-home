"""User management service."""
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.models import Home, User


def get_user(db: Session, user_id: UUID) -> Optional[User]:
    """Get a user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def list_users(db: Session) -> list[User]:
    """List all users."""
    return db.query(User).all()


def create_user(
    db: Session,
    email: str,
    password: str,
    role: str,
    home_id: Optional[UUID] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    contact_number: Optional[str] = None,
    operational_area: Optional[str] = None,
    experience_level: Optional[str] = None,
    certifications: Optional[str] = None,
) -> User:
    """Create a new user."""
    # Check if user already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email already exists")

    # Validate role
    if role not in ["owner", "technician", "staff", "admin"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    # Hash password
    password_hash = get_password_hash(password)

    # Create user
    user = User(
        email=email,
        password_hash=password_hash,
        role=role,
        first_name=first_name,
        last_name=last_name,
        contact_number=contact_number,
        operational_area=operational_area,
        experience_level=experience_level,
        certifications=certifications,
    )
    db.add(user)
    db.flush()

    # If home_id is provided and role is owner, create/assign home
    if home_id and role == "owner":
        home = db.query(Home).filter(Home.id == home_id).first()
        if not home:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")
        home.owner_id = user.id

    db.commit()
    db.refresh(user)
    return user


def update_user(
    db: Session,
    user_id: UUID,
    email: Optional[str] = None,
    role: Optional[str] = None,
    home_id: Optional[UUID] = None,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    contact_number: Optional[str] = None,
    operational_area: Optional[str] = None,
    experience_level: Optional[str] = None,
    certifications: Optional[str] = None,
    profile_picture_url: Optional[str] = None,
) -> User:
    """Update a user."""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if email is not None:
        # Check if email is already taken by another user
        existing = db.query(User).filter(User.email == email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")
        user.email = email

    if role is not None:
        if role not in ["owner", "technician", "staff", "admin"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
        user.role = role

    if home_id is not None and user.role == "owner":
        home = db.query(Home).filter(Home.id == home_id).first()
        if not home:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")
        home.owner_id = user.id

    if first_name is not None:
        user.first_name = first_name
    if last_name is not None:
        user.last_name = last_name
    if contact_number is not None:
        user.contact_number = contact_number
    if operational_area is not None:
        user.operational_area = operational_area
    if experience_level is not None:
        user.experience_level = experience_level
    if certifications is not None:
        user.certifications = certifications
    if profile_picture_url is not None:
        user.profile_picture_url = profile_picture_url

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: UUID) -> None:
    """Delete a user."""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    db.commit()
