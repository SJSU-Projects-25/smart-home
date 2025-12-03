"""Devices router."""
from datetime import datetime
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
    # Convert to response with room names
    return [
        DeviceResponse(
            id=device.id,
            home_id=device.home_id,
            room_id=device.room_id,
            room_name=device.room.name if device.room else None,
            name=device.name,
            type=device.type,
            status=device.status,
            last_seen_at=device.last_seen_at,
            firmware_version=device.firmware_version,
            created_at=device.created_at,
        )
        for device in devices
    ]


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
    # Load room for response
    from app.db.models import Room
    if device.room_id:
        device.room = db.query(Room).filter(Room.id == device.room_id).first()
    return DeviceResponse(
        id=device.id,
        home_id=device.home_id,
        room_id=device.room_id,
        room_name=device.room.name if device.room else None,
        name=device.name,
        type=device.type,
        status=device.status,
        last_seen_at=device.last_seen_at,
        firmware_version=device.firmware_version,
        created_at=device.created_at,
    )


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

    # Load room for response
    from app.db.models import Room
    if device.room_id:
        device.room = db.query(Room).filter(Room.id == device.room_id).first()
    return DeviceResponse(
        id=device.id,
        home_id=device.home_id,
        room_id=device.room_id,
        room_name=device.room.name if device.room else None,
        name=device.name,
        type=device.type,
        status=device.status,
        last_seen_at=device.last_seen_at,
        firmware_version=device.firmware_version,
        created_at=device.created_at,
    )


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
    # Load room for response
    from app.db.models import Room
    if device.room_id:
        device.room = db.query(Room).filter(Room.id == device.room_id).first()
    return DeviceResponse(
        id=device.id,
        home_id=device.home_id,
        room_id=device.room_id,
        room_name=device.room.name if device.room else None,
        name=device.name,
        type=device.type,
        status=device.status,
        last_seen_at=device.last_seen_at,
        firmware_version=device.firmware_version,
        created_at=device.created_at,
    )


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

    # Check if device is enabled
    from app.services.device_config_service import get_device_configuration
    config = get_device_configuration(db, device_id)
    if config and not config.enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Device is disabled and cannot receive heartbeats",
        )

    device = heartbeat_device(db, device_id, heartbeat_data.firmware_version)
    # Load room for response
    from app.db.models import Room
    if device.room_id:
        device.room = db.query(Room).filter(Room.id == device.room_id).first()
    return DeviceResponse(
        id=device.id,
        home_id=device.home_id,
        room_id=device.room_id,
        room_name=device.room.name if device.room else None,
        name=device.name,
        type=device.type,
        status=device.status,
        last_seen_at=device.last_seen_at,
        firmware_version=device.firmware_version,
        created_at=device.created_at,
    )


@router.post("/{device_id}/disable", response_model=DeviceResponse)
async def disable_device_endpoint(
    device_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Disable a device. Requires technician or admin role."""
    if current_user.role not in ["technician", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only technicians and admins can disable devices",
        )

    device = get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(device.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Disable device via configuration
    from app.services.device_config_service import get_or_create_device_configuration
    from app.schemas.device_config import DeviceConfigUpdate
    
    config = get_or_create_device_configuration(db, device_id, default_timeout=86400)
    config.enabled = False
    config.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(config)
    
    # Mark device as offline
    device.status = "offline"
    db.commit()
    db.refresh(device)
    
    # Load room for response
    from app.db.models import Room
    if device.room_id:
        device.room = db.query(Room).filter(Room.id == device.room_id).first()
    return DeviceResponse(
        id=device.id,
        home_id=device.home_id,
        room_id=device.room_id,
        room_name=device.room.name if device.room else None,
        name=device.name,
        type=device.type,
        status=device.status,
        last_seen_at=device.last_seen_at,
        firmware_version=device.firmware_version,
        created_at=device.created_at,
    )


@router.post("/{device_id}/enable", response_model=DeviceResponse)
async def enable_device_endpoint(
    device_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Enable a device. Requires technician or admin role."""
    if current_user.role not in ["technician", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only technicians and admins can enable devices",
        )

    device = get_device(db, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(device.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Enable device via configuration
    from app.services.device_config_service import get_or_create_device_configuration
    
    config = get_or_create_device_configuration(db, device_id, default_timeout=86400)
    config.enabled = True
    config.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(config)
    
    # Check if device should be online based on heartbeat
    from app.services.device_config_service import check_device_online_status
    check_device_online_status(db, device)
    db.refresh(device)
    
    # Load room for response
    from app.db.models import Room
    if device.room_id:
        device.room = db.query(Room).filter(Room.id == device.room_id).first()
    return DeviceResponse(
        id=device.id,
        home_id=device.home_id,
        room_id=device.room_id,
        room_name=device.room.name if device.room else None,
        name=device.name,
        type=device.type,
        status=device.status,
        last_seen_at=device.last_seen_at,
        firmware_version=device.firmware_version,
        created_at=device.created_at,
    )
