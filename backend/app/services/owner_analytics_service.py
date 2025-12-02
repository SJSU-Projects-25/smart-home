"""Owner analytics service."""
from typing import Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.models import Alert, Device, Home, Room
from app.services.events_repository import EventsRepository


def get_owner_overview(db: Session, settings: Settings, home_id: UUID) -> dict:
    """Get owner overview statistics for a specific home."""
    # Count open alerts
    open_alerts_count = (
        db.query(func.count(Alert.id))
        .filter(Alert.home_id == home_id, Alert.status == "open")
        .scalar()
        or 0
    )
    
    open_alerts_high = (
        db.query(func.count(Alert.id))
        .filter(Alert.home_id == home_id, Alert.status == "open", Alert.severity == "high")
        .scalar()
        or 0
    )

    # Count devices
    devices_online_count = (
        db.query(func.count(Device.id))
        .filter(Device.home_id == home_id, Device.status == "online")
        .scalar()
        or 0
    )
    
    total_devices = (
        db.query(func.count(Device.id))
        .filter(Device.home_id == home_id)
        .scalar()
        or 0
    )

    # Count rooms
    rooms_count = (
        db.query(func.count(Room.id))
        .filter(Room.home_id == home_id)
        .scalar()
        or 0
    )

    # Get events from MongoDB
    events_repo = EventsRepository(settings.mongo_uri)
    events_last_24h = events_repo.count_events_last_24h(home_id)

    # Per-room stats with alerts
    rooms = db.query(Room).filter(Room.home_id == home_id).all()
    per_room_stats = []
    for room in rooms:
        room_devices_count = (
            db.query(func.count(Device.id))
            .filter(Device.room_id == room.id)
            .scalar()
            or 0
        )
        room_alerts_count = (
            db.query(func.count(Alert.id))
            .filter(Alert.room_id == room.id, Alert.status == "open")
            .scalar()
            or 0
        )
        per_room_stats.append({
            "room_id": str(room.id),
            "room_name": room.name,
            "devices_count": room_devices_count,
            "alert_count": room_alerts_count,
        })

    # Get alert trends (last 7 days)
    from datetime import datetime, timedelta
    alert_trends = []
    for i in range(7):
        date = datetime.utcnow() - timedelta(days=6 - i)
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        high_count = (
            db.query(func.count(Alert.id))
            .filter(
                Alert.home_id == home_id,
                Alert.severity == "high",
                Alert.created_at >= start_of_day,
                Alert.created_at <= end_of_day,
            )
            .scalar()
            or 0
        )
        medium_count = (
            db.query(func.count(Alert.id))
            .filter(
                Alert.home_id == home_id,
                Alert.severity == "medium",
                Alert.created_at >= start_of_day,
                Alert.created_at <= end_of_day,
            )
            .scalar()
            or 0
        )
        low_count = (
            db.query(func.count(Alert.id))
            .filter(
                Alert.home_id == home_id,
                Alert.severity == "low",
                Alert.created_at >= start_of_day,
                Alert.created_at <= end_of_day,
            )
            .scalar()
            or 0
        )
        
        alert_trends.append({
            "date": start_of_day.isoformat(),
            "high": high_count,
            "medium": medium_count,
            "low": low_count,
        })

    return {
        "openAlertsCount": open_alerts_count,
        "openAlertsHigh": open_alerts_high,
        "devicesOnlineCount": devices_online_count,
        "eventsLast24h": events_last_24h,
        "totalDevices": total_devices,
        "roomsCount": rooms_count,
        "perRoomStats": per_room_stats,
        "alertTrends": alert_trends,
    }

