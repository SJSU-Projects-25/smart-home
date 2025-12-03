"""Device configuration service."""
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import DeviceConfiguration, Device
from app.schemas.device_config import DeviceConfigCreate, DeviceConfigUpdate


def get_or_create_device_configuration(
    db: Session, device_id: UUID, default_timeout: int = 300
) -> DeviceConfiguration:
    """Get device configuration or create with defaults if not exists."""
    config = db.query(DeviceConfiguration).filter(DeviceConfiguration.device_id == device_id).first()
    
    if not config:
        config = DeviceConfiguration(
            device_id=device_id,
            heartbeat_timeout_seconds=default_timeout,
            enabled=True,
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    
    return config


def get_device_configuration(db: Session, device_id: UUID) -> Optional[DeviceConfiguration]:
    """Get device configuration by device ID."""
    return db.query(DeviceConfiguration).filter(DeviceConfiguration.device_id == device_id).first()


def update_device_configuration(
    db: Session, device_id: UUID, config_data: DeviceConfigUpdate
) -> DeviceConfiguration:
    """Update device configuration."""
    config = get_or_create_device_configuration(db, device_id)
    
    if config_data.heartbeat_timeout_seconds is not None:
        config.heartbeat_timeout_seconds = config_data.heartbeat_timeout_seconds
    if config_data.enabled is not None:
        config.enabled = config_data.enabled
    if config_data.notes is not None:
        config.notes = config_data.notes
    
    config.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(config)
    return config


def check_device_online_status(db: Session, device: Device) -> None:
    """Check and update device online status based on heartbeat timeout and configuration."""
    # Get device configuration (with defaults)
    config = get_or_create_device_configuration(db, device.id, default_timeout=86400)  # Default 24h for demo
    
    # If device is disabled, mark as offline
    if not config.enabled:
        if device.status != "offline":
            device.status = "offline"
            db.commit()
        return
    
    # Check heartbeat timeout
    timeout_seconds = config.heartbeat_timeout_seconds
    
    if device.last_seen_at:
        # Handle timezone-aware datetime
        last_seen = device.last_seen_at
        if last_seen.tzinfo is not None:
            # Convert to UTC naive datetime for comparison
            last_seen = last_seen.replace(tzinfo=None)
        
        time_since_heartbeat = datetime.utcnow() - last_seen
        if time_since_heartbeat.total_seconds() > timeout_seconds:
            if device.status != "offline":
                device.status = "offline"
                db.commit()
        elif device.status == "offline":
            # Device came back online
            device.status = "online"
            db.commit()
    elif device.status == "online":
        # Device marked online but never sent heartbeat - mark offline
        device.status = "offline"
        db.commit()
