"""Device management service."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import Device
from app.schemas.devices import DeviceCreate, DeviceUpdate


def list_devices(
    db: Session, home_id: UUID, room_id: Optional[UUID] = None, status_filter: Optional[str] = None
) -> list[Device]:
    """List devices for a home, optionally filtered by room and status."""
    from app.db.models import Room
    
    query = db.query(Device).filter(Device.home_id == home_id)

    if room_id:
        query = query.filter(Device.room_id == room_id)
    if status_filter:
        query = query.filter(Device.status == status_filter)

    devices = query.all()
    
    # Eagerly load room relationships for better performance
    for device in devices:
        if device.room_id:
            device.room = db.query(Room).filter(Room.id == device.room_id).first()
    
    return devices


def get_device(db: Session, device_id: UUID) -> Optional[Device]:
    """Get a device by ID."""
    return db.query(Device).filter(Device.id == device_id).first()


def create_device(db: Session, device_data: DeviceCreate) -> Device:
    """Create a new device."""
    device = Device(
        home_id=device_data.home_id,
        room_id=device_data.room_id,
        name=device_data.name,
        type=device_data.type,
        status="offline",
        firmware_version=device_data.firmware_version,
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


def update_device(db: Session, device_id: UUID, device_data: DeviceUpdate) -> Device:
    """Update a device."""
    device = get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    if device_data.name is not None:
        device.name = device_data.name
    if device_data.room_id is not None:
        device.room_id = device_data.room_id
    if device_data.type is not None:
        device.type = device_data.type
    if device_data.status is not None:
        device.status = device_data.status
    if device_data.firmware_version is not None:
        device.firmware_version = device_data.firmware_version

    db.commit()
    db.refresh(device)
    return device


def delete_device(db: Session, device_id: UUID) -> None:
    """Delete a device."""
    device = get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    db.delete(device)
    db.commit()


def heartbeat_device(db: Session, device_id: UUID, firmware_version: Optional[str] = None) -> Device:
    """Update device heartbeat (mark online, update last_seen_at)."""
    device = get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    device.status = "online"
    device.last_seen_at = datetime.utcnow()
    if firmware_version is not None:
        device.firmware_version = firmware_version

    db.commit()
    db.refresh(device)
    return device
