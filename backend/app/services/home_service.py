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


def create_home(
    db: Session,
    name: str,
    owner_id: UUID,
    timezone: str,
    address: Optional[str] = None,
    contact_number: Optional[str] = None,
    home_size: Optional[str] = None,
    number_of_rooms: Optional[int] = None,
    house_type: Optional[str] = None,
) -> Home:
    """Create a new home."""
    # Verify owner exists
    owner = db.query(User).filter(User.id == owner_id).first()
    if not owner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Owner not found")

    home = Home(
        name=name,
        owner_id=owner_id,
        timezone=timezone,
        address=address,
        contact_number=contact_number,
        home_size=home_size,
        number_of_rooms=number_of_rooms,
        house_type=house_type,
    )
    db.add(home)
    db.commit()
    db.refresh(home)
    return home


def update_home(
    db: Session,
    home_id: UUID,
    name: Optional[str] = None,
    timezone: Optional[str] = None,
    address: Optional[str] = None,
    contact_number: Optional[str] = None,
    home_size: Optional[str] = None,
    number_of_rooms: Optional[int] = None,
    house_type: Optional[str] = None,
    status: Optional[str] = None,
) -> Home:
    """Update a home."""
    home = get_home(db, home_id)
    if not home:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")

    if name is not None:
        home.name = name
    if timezone is not None:
        home.timezone = timezone
    if address is not None:
        home.address = address
    if contact_number is not None:
        home.contact_number = contact_number
    if home_size is not None:
        home.home_size = home_size
    if number_of_rooms is not None:
        home.number_of_rooms = number_of_rooms
    if house_type is not None:
        home.house_type = house_type
    if status is not None:
        home.status = status

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

