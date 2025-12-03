"""Alerts heatmap service."""
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import Alert, Home


def get_alerts_heatmap(db: Session, period: str = "24h") -> list[dict]:
    """
    Get alerts heatmap data aggregated by home and severity.
    
    Args:
        db: Database session
        period: "24h" or "7d"
    
    Returns:
        List of alerts heatmap items with home_id, home_name, total_alerts, and alerts_by_severity
    """
    # Calculate cutoff time based on period
    if period == "7d":
        cutoff_time = datetime.utcnow() - timedelta(days=7)
    else:  # Default to 24h
        cutoff_time = datetime.utcnow() - timedelta(hours=24)

    # Get all homes
    homes = db.query(Home).all()
    result = []

    for home in homes:
        # Count total alerts in period
        total_alerts = (
            db.query(func.count(Alert.id))
            .filter(Alert.home_id == home.id, Alert.created_at >= cutoff_time)
            .scalar()
            or 0
        )

        # Count by severity
        alerts_by_severity = {"high": 0, "medium": 0, "low": 0}
        
        for severity in ["high", "medium", "low"]:
            count = (
                db.query(func.count(Alert.id))
                .filter(
                    Alert.home_id == home.id,
                    Alert.severity == severity,
                    Alert.created_at >= cutoff_time,
                )
                .scalar()
                or 0
            )
            alerts_by_severity[severity] = count

        result.append({
            "home_id": str(home.id),
            "home_name": home.name,
            "total_alerts": total_alerts,
            "alerts_by_severity": alerts_by_severity,
        })

    return result


