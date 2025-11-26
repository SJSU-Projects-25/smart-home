"""Home management service."""
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import Device, Home, Room, User


def get_home(db: Session, home_id: UUID) -> Optional[Home]:
    """Get a home by ID."""
    return db.query(Home).filter(Home.id == home_id).first()


def list_homes(db: Session) -> list[Home]:
    """List all homes."""
    return db.query(Home).all()


def create_home(db: Session, name: str, owner_id: UUID, timezone: str) -> Home:
    """Create a new home."""
    # Verify owner exists
    owner = db.query(User).filter(User.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Owner not found")

    home = Home(name=name, owner_id=owner_id, timezone=timezone)
    db.add(home)
    db.commit()
    db.refresh(home)
    return home


def update_home(db: Session, home_id: UUID, name: Optional[str] = None, timezone: Optional[str] = None) -> Home:
    """Update a home."""
    home = get_home(db, home_id)
    if not home:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")

    if name:
        home.name = name
    if timezone:
        home.timezone = timezone

    db.commit()
    db.refresh(home)
    return home


def delete_home(db: Session, home_id: UUID) -> None:
    """Delete a home."""
    home = get_home(db, home_id)
    if not home:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")

    db.delete(home)
    db.commit()

