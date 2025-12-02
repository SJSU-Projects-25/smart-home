"""Admin analytics service."""
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.models import Alert, Device, Home, User
from app.services.events_repository import EventsRepository


def get_admin_overview(db: Session, settings: Settings) -> dict:
    """Get admin overview statistics for entire platform."""
    # Count all entities
    total_homes = db.query(func.count(Home.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_devices = db.query(func.count(Device.id)).scalar() or 0
    total_devices_online = (
        db.query(func.count(Device.id))
        .filter(Device.status == "online")
        .scalar()
        or 0
    )

    # Count alerts by severity
    open_alerts = db.query(Alert).filter(Alert.status == "open").all()
    alerts_by_severity = {"low": 0, "medium": 0, "high": 0}
    for alert in open_alerts:
        alerts_by_severity[alert.severity] = alerts_by_severity.get(alert.severity, 0) + 1

    # Get events from MongoDB
    events_repo = EventsRepository(settings.mongo_uri)
    events_by_home = events_repo.count_events_by_home_last_24h()
    total_events = sum(item["count"] for item in events_by_home)

    # Get device uptime summary (aggregate across all homes)
    all_homes = db.query(Home).all()
    device_uptime_summary = []
    for home in all_homes:
        home_uptime = events_repo.device_uptime_summary(home.id)
        device_uptime_summary.extend(home_uptime)

    # Get users by role
    users_by_role = {}
    for role in ["owner", "technician", "staff", "admin"]:
        count = db.query(func.count(User.id)).filter(User.role == role).scalar() or 0
        users_by_role[role] = count

    # Get homes with most alerts
    homes_with_alerts = (
        db.query(Home.id, Home.name, func.count(Alert.id).label("alert_count"))
        .join(Alert, Alert.home_id == Home.id)
        .filter(Alert.status == "open")
        .group_by(Home.id, Home.name)
        .order_by(func.count(Alert.id).desc())
        .limit(5)
        .all()
    )

    top_homes = [
        {
            "home_id": str(home.id),
            "home_name": home.name,
            "alert_count": home.alert_count,
        }
        for home in homes_with_alerts
    ]

    return {
        "totalHomes": total_homes,
        "totalUsers": total_users,
        "totalDevices": total_devices,
        "totalDevicesOnline": total_devices_online,
        "openAlertsBySeverity": alerts_by_severity,
        "eventsByHomeLast24h": events_by_home,
        "totalEventsLast24h": total_events,
        "deviceUptimeSummary": device_uptime_summary,
        "usersByRole": users_by_role,
        "topHomesByAlerts": top_homes,
    }

