"""Admin router."""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.deps import get_current_user, get_db, get_settings, require_role
from app.db.models import User
from app.schemas.homes import HomeCreate, HomeResponse, HomeUpdate
from app.schemas.users import UserCreate, UserResponse, UserUpdate
from app.services.admin_analytics_service import get_admin_overview
from app.services.home_service import create_home, delete_home, get_home, list_homes, update_home
from app.services.user_service import create_user, delete_user, get_user, list_users, update_user

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/overview")
async def admin_overview_endpoint(
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
    settings: Annotated[Settings, Depends(get_settings)] = None,
):
    """Get admin overview statistics for entire platform."""
    return get_admin_overview(db, settings)


@router.get("/users", response_model=list[UserResponse])
async def list_users_endpoint(
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List all users (admin only)."""
    from app.db.models import Home

    users = list_users(db)
    # Add home_id to response
    result = []
    for user in users:
        home_id = None
        if user.role == "owner":
            home = db.query(Home).filter(Home.owner_id == user.id).first()
            if home:
                home_id = home.id
        result.append(
            UserResponse(
                id=user.id,
                email=user.email,
                role=user.role,
                home_id=home_id,
                first_name=user.first_name,
                last_name=user.last_name,
                contact_number=user.contact_number,
                operational_area=user.operational_area,
                experience_level=user.experience_level,
                certifications=user.certifications,
                profile_picture_url=user.profile_picture_url,
                created_at=user.created_at,
            )
        )
    return result


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_endpoint(
    user_data: UserCreate,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Create a new user (admin only)."""
    # Convert home_id string to UUID if provided
    home_id_uuid = None
    if user_data.home_id:
        # Handle empty string, None, or whitespace
        home_id_str = str(user_data.home_id).strip() if user_data.home_id else ""
        if home_id_str:
            try:
                home_id_uuid = UUID(home_id_str)
            except (ValueError, AttributeError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid home_id format: '{home_id_str}'. Must be a valid UUID.",
                )

    user = create_user(
        db,
        user_data.email,
        user_data.password,
        user_data.role,
        home_id_uuid,
        user_data.first_name,
        user_data.last_name,
        user_data.contact_number,
        user_data.operational_area,
        user_data.experience_level,
        user_data.certifications,
    )
    home_id = None
    if user.role == "owner" and home_id_uuid:
        home_id = home_id_uuid
    elif user.role == "owner":
        # Check if user has a home
        from app.db.models import Home
        home = db.query(Home).filter(Home.owner_id == user.id).first()
        if home:
            home_id = home.id
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        home_id=home_id,
        first_name=user.first_name,
        last_name=user.last_name,
        contact_number=user.contact_number,
        operational_area=user.operational_area,
        experience_level=user.experience_level,
        certifications=user.certifications,
        profile_picture_url=user.profile_picture_url,
        created_at=user.created_at,
    )


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user_endpoint(
    user_id: UUID,
    user_data: UserUpdate,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Update a user (admin only)."""
    # Convert home_id string to UUID if provided
    home_id_uuid = None
    if user_data.home_id:
        # Handle empty string, None, or whitespace
        home_id_str = str(user_data.home_id).strip() if user_data.home_id else ""
        if home_id_str:
            try:
                home_id_uuid = UUID(home_id_str)
            except (ValueError, AttributeError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid home_id format: '{home_id_str}'. Must be a valid UUID.",
                )

    user = update_user(
        db,
        user_id,
        user_data.email,
        user_data.role,
        home_id_uuid,
        user_data.first_name,
        user_data.last_name,
        user_data.contact_number,
        user_data.operational_area,
        user_data.experience_level,
        user_data.certifications,
        user_data.profile_picture_url,
    )
    home_id = None
    if user.role == "owner":
        from app.db.models import Home
        home = db.query(Home).filter(Home.owner_id == user.id).first()
        if home:
            home_id = home.id
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        home_id=home_id,
        first_name=user.first_name,
        last_name=user.last_name,
        contact_number=user.contact_number,
        operational_area=user.operational_area,
        experience_level=user.experience_level,
        certifications=user.certifications,
        profile_picture_url=user.profile_picture_url,
        created_at=user.created_at,
    )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(
    user_id: UUID,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Delete a user (admin only)."""
    delete_user(db, user_id)
    return None


@router.get("/homes")
async def list_homes_endpoint(
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List all homes with statistics (admin only)."""
    from app.db.models import Device, Room, Alert
    from sqlalchemy import func

    homes = list_homes(db)
    result = []
    for home in homes:
        owner = db.query(User).filter(User.id == home.owner_id).first()
        devices_count = db.query(func.count(Device.id)).filter(Device.home_id == home.id).scalar() or 0
        online_count = (
            db.query(func.count(Device.id)).filter(Device.home_id == home.id, Device.status == "online").scalar() or 0
        )
        open_alerts_count = (
            db.query(func.count(Alert.id)).filter(Alert.home_id == home.id, Alert.status == "open").scalar() or 0
        )
        rooms_count = db.query(func.count(Room.id)).filter(Room.home_id == home.id).scalar() or 0

        result.append(
            {
                "id": str(home.id),
                "name": home.name,
                "owner_id": str(home.owner_id),
                "owner_email": owner.email if owner else "Unknown",
                "timezone": home.timezone,
                "address": home.address,
                "contact_number": home.contact_number,
                "home_size": home.home_size,
                "number_of_rooms": home.number_of_rooms,
                "house_type": home.house_type,
                "status": home.status,
                "rooms_count": rooms_count,
                "devices_count": devices_count,
                "open_alerts_count": open_alerts_count,
                "created_at": home.created_at.isoformat(),
            }
        )
    return result


@router.post("/homes", response_model=HomeResponse, status_code=status.HTTP_201_CREATED)
async def create_home_endpoint(
    home_data: HomeCreate,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Create a new home (admin only)."""
    if not home_data.owner_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="owner_id is required")
    return create_home(
        db,
        home_data.name,
        home_data.owner_id,
        home_data.timezone,
        home_data.address,
        home_data.contact_number,
        home_data.home_size,
        home_data.number_of_rooms,
        home_data.house_type,
    )


@router.patch("/homes/{home_id}", response_model=HomeResponse)
async def update_home_endpoint(
    home_id: UUID,
    home_data: HomeUpdate,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Update a home (admin only)."""
    return update_home(
        db,
        home_id,
        home_data.name,
        home_data.timezone,
        home_data.address,
        home_data.contact_number,
        home_data.home_size,
        home_data.number_of_rooms,
        home_data.house_type,
        home_data.status,
    )


@router.delete("/homes/{home_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_home_endpoint(
    home_id: UUID,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Delete a home (admin only)."""
    delete_home(db, home_id)
    return None


@router.get("/alerts")
async def list_all_alerts_endpoint(
    status: Annotated[Optional[str], Query()] = None,
    severity: Annotated[Optional[str], Query()] = None,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List all alerts across all homes (admin only)."""
    from app.db.models import Alert, Home
    from app.schemas.alerts import AlertResponse

    query = db.query(Alert)
    
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    
    alerts = query.order_by(Alert.created_at.desc()).limit(500).all()
    
    result = []
    for alert in alerts:
        home = db.query(Home).filter(Home.id == alert.home_id).first()
        result.append(
            AlertResponse(
                id=alert.id,
                type=alert.type,
                severity=alert.severity,
                status=alert.status,
                score=alert.score,
                home_id=alert.home_id,
                room_id=alert.room_id,
                device_id=alert.device_id,
                created_at=alert.created_at,
                acked_at=alert.acked_at,
                escalated_at=alert.escalated_at,
                closed_at=alert.closed_at,
            )
        )
    return result


@router.get("/devices")
async def list_all_devices_endpoint(
    status: Annotated[Optional[str], Query()] = None,
    device_type: Annotated[Optional[str], Query()] = None,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List all devices across all homes (admin only)."""
    from app.db.models import Device, Home, Room

    query = db.query(Device)
    
    if status:
        query = query.filter(Device.status == status)
    if device_type:
        query = query.filter(Device.type == device_type)
    
    devices = query.order_by(Device.created_at.desc()).limit(500).all()
    
    result = []
    for device in devices:
        home = db.query(Home).filter(Home.id == device.home_id).first()
        room = db.query(Room).filter(Room.id == device.room_id).first() if device.room_id else None
        result.append({
            "id": str(device.id),
            "name": device.name,
            "type": device.type,
            "status": device.status,
            "home_id": str(device.home_id),
            "home_name": home.name if home else None,
            "room_id": str(device.room_id) if device.room_id else None,
            "room_name": room.name if room else None,
            "last_seen_at": device.last_seen_at.isoformat() if device.last_seen_at else None,
            "firmware_version": device.firmware_version,
            "created_at": device.created_at.isoformat(),
        })
    return result


@router.get("/models")
async def list_all_models_endpoint(
    enabled: Annotated[Optional[bool], Query()] = None,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List all model configs across all homes (admin only)."""
    from app.db.models import ModelConfig, Home

    query = db.query(ModelConfig)
    
    if enabled is not None:
        query = query.filter(ModelConfig.enabled == enabled)
    
    configs = query.order_by(ModelConfig.home_id).all()
    
    result = []
    for config in configs:
        home = db.query(Home).filter(Home.id == config.home_id).first()
        result.append({
            "id": str(config.id),
            "model_key": config.model_key,
            "enabled": config.enabled,
            "threshold": config.threshold,
            "params": config.params_json or {},
            "home_id": str(config.home_id),
            "home_name": home.name if home else None,
        })
    return result


@router.get("/audit")
async def list_audit_logs_endpoint(
    user: Annotated[Optional[str], Query()] = None,
    action: Annotated[Optional[str], Query()] = None,
    start_date: Annotated[Optional[str], Query()] = None,
    end_date: Annotated[Optional[str], Query()] = None,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List audit logs (admin only)."""
    # For now, return mock audit logs based on recent user actions and home/device changes
    from app.db.models import User, Home, Device, Alert
    from datetime import datetime, timedelta
    
    # Generate audit logs from recent activities
    audit_logs = []
    
    # Recent user creations
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(10).all()
    for user_obj in recent_users:
        audit_logs.append({
            "id": str(user_obj.id),
            "user_email": user_obj.email,
            "action": "user_created",
            "resource_type": "user",
            "resource_id": str(user_obj.id),
            "timestamp": user_obj.created_at.isoformat(),
            "details": f"User {user_obj.email} created with role {user_obj.role}",
        })
    
    # Recent home creations
    recent_homes = db.query(Home).order_by(Home.created_at.desc()).limit(10).all()
    for home in recent_homes:
        audit_logs.append({
            "id": str(home.id),
            "user_email": "system",
            "action": "home_created",
            "resource_type": "home",
            "resource_id": str(home.id),
            "timestamp": home.created_at.isoformat(),
            "details": f"Home {home.name} created",
        })
    
    # Recent alerts
    recent_alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(20).all()
    for alert in recent_alerts:
        audit_logs.append({
            "id": str(alert.id),
            "user_email": "system",
            "action": "alert_created",
            "resource_type": "alert",
            "resource_id": str(alert.id),
            "timestamp": alert.created_at.isoformat(),
            "details": f"Alert {alert.type} ({alert.severity}) created",
        })
    
    # Filter by query params
    if user:
        audit_logs = [log for log in audit_logs if user.lower() in log.get("user_email", "").lower()]
    if action:
        audit_logs = [log for log in audit_logs if log.get("action") == action]
    
    # Sort by timestamp descending
    audit_logs.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return audit_logs[:100]  # Return top 100
