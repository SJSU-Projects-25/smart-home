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


def create_user(db: Session, email: str, password: str, role: str, home_id: Optional[UUID] = None) -> User:
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
    user = User(email=email, password_hash=password_hash, role=role)
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
    db: Session, user_id: UUID, email: Optional[str] = None, role: Optional[str] = None, home_id: Optional[UUID] = None
) -> User:
    """Update a user."""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if email:
        # Check if email is already taken by another user
        existing = db.query(User).filter(User.email == email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")
        user.email = email

    if role:
        if role not in ["owner", "technician", "staff", "admin"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
        user.role = role

    if home_id and user.role == "owner":
        home = db.query(Home).filter(Home.id == home_id).first()
        if not home:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")
        home.owner_id = user.id

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
