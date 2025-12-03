"""Device configuration router."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db, get_user_home_access
from app.db.models import User, Device
from app.schemas.device_config import DeviceConfigResponse, DeviceConfigUpdate
from app.services.device_config_service import (
    get_or_create_device_configuration,
    update_device_configuration,
)

router = APIRouter(prefix="/device-config", tags=["device-config"])


@router.get("/{device_id}", response_model=DeviceConfigResponse)
async def get_device_config_endpoint(
    device_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Get device configuration. Creates default config if not exists."""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(device.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Get or create configuration with default timeout (24h for demo)
    config = get_or_create_device_configuration(db, device_id, default_timeout=86400)
    
    return DeviceConfigResponse(
        id=config.id,
        device_id=config.device_id,
        heartbeat_timeout_seconds=config.heartbeat_timeout_seconds,
        enabled=config.enabled,
        notes=config.notes,
        created_at=config.created_at,
        updated_at=config.updated_at,
    )


@router.patch("/{device_id}", response_model=DeviceConfigResponse)
async def update_device_config_endpoint(
    device_id: UUID,
    config_data: DeviceConfigUpdate,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Update device configuration. Requires technician or admin role."""
    # Only technicians and admins can configure devices
    if current_user.role not in ["technician", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only technicians and admins can configure devices",
        )

    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(device.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    config = update_device_configuration(db, device_id, config_data)
    
    return DeviceConfigResponse(
        id=config.id,
        device_id=config.device_id,
        heartbeat_timeout_seconds=config.heartbeat_timeout_seconds,
        enabled=config.enabled,
        notes=config.notes,
        created_at=config.created_at,
        updated_at=config.updated_at,
    )
