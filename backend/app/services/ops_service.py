"""Operations service."""
from typing import Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.models import Alert, Device, Home, User
from app.services.events_repository import EventsRepository


def get_ops_overview(db: Session, settings: Settings) -> dict:
    """Get operations overview statistics."""
    total_homes = db.query(func.count(Home.id)).scalar() or 0
    total_devices = db.query(func.count(Device.id)).scalar() or 0
    total_devices_online = db.query(func.count(Device.id)).filter(Device.status == "online").scalar() or 0

    # Count alerts by severity
    open_alerts = db.query(Alert).filter(Alert.status == "open").all()
    alerts_by_severity = {"low": 0, "medium": 0, "high": 0}
    for alert in open_alerts:
        alerts_by_severity[alert.severity] = alerts_by_severity.get(alert.severity, 0) + 1

    # Get events from MongoDB
    events_repo = EventsRepository(settings.mongo_uri)
    events_by_home = events_repo.count_events_by_home_last_24h()
    
    # Get device uptime summary (aggregate across all homes)
    all_homes = db.query(Home).all()
    device_uptime_summary = []
    for home in all_homes:
        home_uptime = events_repo.device_uptime_summary(home.id)
        device_uptime_summary.extend(home_uptime)

    return {
        "totalHomes": total_homes,
        "totalDevices": total_devices,
        "totalDevicesOnline": total_devices_online,
        "openAlertsBySeverity": alerts_by_severity,
        "eventsByHomeLast24h": events_by_home,
        "deviceUptimeSummary": device_uptime_summary,
    }


def list_ops_homes(db: Session) -> list[dict]:
    """List all homes with statistics for ops view."""
    homes = db.query(Home).all()
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
        rooms_count = db.query(func.count()).select_from(Home).filter(Home.id == home.id).scalar() or 0
        # Get rooms count properly
        from app.db.models import Room
        rooms_count = db.query(func.count(Room.id)).filter(Room.home_id == home.id).scalar() or 0

        result.append(
            {
                "id": str(home.id),
                "name": home.name,
                "owner_email": owner.email if owner else "Unknown",
                "devices_count": devices_count,
                "online_count": online_count,
                "open_alerts_count": open_alerts_count,
            }
        )
    return result

