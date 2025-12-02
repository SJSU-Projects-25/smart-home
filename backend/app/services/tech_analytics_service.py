"""Technician analytics service."""
from typing import Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.models import Alert, Assignment, Device, Home, Room
from app.services.events_repository import EventsRepository


def get_tech_overview(db: Session, settings: Settings, user_id: UUID) -> dict:
    """Get technician overview statistics for assigned homes."""
    # Get technician's assignments
    assignments = db.query(Assignment).filter(Assignment.user_id == user_id).all()
    
    if not assignments:
        return {
            "assignedHomes": 0,
            "totalDevices": 0,
            "devicesOnline": 0,
            "openAlerts": 0,
            "highPriorityAlerts": 0,
            "eventsLast24h": 0,
            "homes": [],
        }

    home_ids = [assignment.home_id for assignment in assignments]
    
    # Count devices across all assigned homes
    total_devices = (
        db.query(func.count(Device.id))
        .filter(Device.home_id.in_(home_ids))
        .scalar()
        or 0
    )
    
    devices_online = (
        db.query(func.count(Device.id))
        .filter(Device.home_id.in_(home_ids), Device.status == "online")
        .scalar()
        or 0
    )

    # Count alerts
    open_alerts = (
        db.query(func.count(Alert.id))
        .filter(Alert.home_id.in_(home_ids), Alert.status == "open")
        .scalar()
        or 0
    )
    
    high_priority_alerts = (
        db.query(func.count(Alert.id))
        .filter(Alert.home_id.in_(home_ids), Alert.status == "open", Alert.severity == "high")
        .scalar()
        or 0
    )

    # Get events from MongoDB
    events_repo = EventsRepository(settings.mongo_uri)
    total_events = 0
    for home_id in home_ids:
        total_events += events_repo.count_events_last_24h(home_id)

    # Get per-home stats
    homes_data = []
    for assignment in assignments:
        home = db.query(Home).filter(Home.id == assignment.home_id).first()
        if not home:
            continue
            
        home_devices = (
            db.query(func.count(Device.id))
            .filter(Device.home_id == home.id)
            .scalar()
            or 0
        )
        
        home_devices_online = (
            db.query(func.count(Device.id))
            .filter(Device.home_id == home.id, Device.status == "online")
            .scalar()
            or 0
        )
        
        home_alerts = (
            db.query(func.count(Alert.id))
            .filter(Alert.home_id == home.id, Alert.status == "open")
            .scalar()
            or 0
        )
        
        home_events = events_repo.count_events_last_24h(home.id)
        
        homes_data.append({
            "home_id": str(home.id),
            "home_name": home.name,
            "devices_count": home_devices,
            "devices_online": home_devices_online,
            "open_alerts": home_alerts,
            "events_last_24h": home_events,
        })

    return {
        "assignedHomes": len(home_ids),
        "totalDevices": total_devices,
        "devicesOnline": devices_online,
        "openAlerts": open_alerts,
        "highPriorityAlerts": high_priority_alerts,
        "eventsLast24h": total_events,
        "homes": homes_data,
    }

