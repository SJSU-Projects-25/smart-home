"""Devices router."""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db, get_user_home_access
from app.db.models import User
from app.schemas.devices import DeviceCreate, DeviceHeartbeatRequest, DeviceResponse, DeviceUpdate
from app.services.device_service import (
    create_device,
    delete_device,
    get_device,
    heartbeat_device,
    list_devices,
    update_device,
)

router = APIRouter(prefix="/devices", tags=["devices"])


@router.get("", response_model=list[DeviceResponse])
async def list_devices_endpoint(
    home_id: Annotated[UUID, Query()],
    room_id: Annotated[Optional[UUID], Query()] = None,
    status: Annotated[Optional[str], Query()] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List devices for a home."""
    _, validated_home_id = get_user_home_access(current_user, db, str(home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No home access")

    devices = list_devices(db, UUID(validated_home_id), room_id, status)
    return devices


@router.post("", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def create_device_endpoint(
    device_data: DeviceCreate,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Create a new device."""
    _, validated_home_id = get_user_home_access(current_user, db, str(device_data.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No home access")

    # Ensure home_id matches validated access
    device_data.home_id = UUID(validated_home_id)
    device = create_device(db, device_data)
    return device


@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device_endpoint(
    device_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Get a device by ID."""
    device = get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(device.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return device


@router.patch("/{device_id}", response_model=DeviceResponse)
async def update_device_endpoint(
    device_id: UUID,
    device_data: DeviceUpdate,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Update a device."""
    device = get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(device.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    device = update_device(db, device_id, device_data)
    return device


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device_endpoint(
    device_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Delete a device."""
    device = get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(device.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    delete_device(db, device_id)


@router.post("/{device_id}/heartbeat", response_model=DeviceResponse)
async def heartbeat_device_endpoint(
    device_id: UUID,
    heartbeat_data: DeviceHeartbeatRequest,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Update device heartbeat."""
    device = get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(device.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    device = heartbeat_device(db, device_id, heartbeat_data.firmware_version)
    return device
