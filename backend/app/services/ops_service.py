"""Operations service."""
from typing import Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import Alert, Device, Home, User


def get_ops_overview(db: Session) -> dict:
    """Get operations overview statistics."""
    total_homes = db.query(func.count(Home.id)).scalar() or 0
    total_devices_online = db.query(func.count(Device.id)).filter(Device.status == "online").scalar() or 0

    # Count alerts by severity
    open_alerts = db.query(Alert).filter(Alert.status == "open").all()
    alerts_by_severity = {"low": 0, "medium": 0, "high": 0}
    for alert in open_alerts:
        alerts_by_severity[alert.severity] = alerts_by_severity.get(alert.severity, 0) + 1

    return {
        "total_homes": total_homes,
        "total_devices_online": total_devices_online,
        "open_alerts_by_severity": alerts_by_severity,
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

