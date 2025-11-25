"""Alert management service."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import Alert, User


def list_alerts(db: Session, home_id: UUID, status_filter: Optional[str] = None) -> list[Alert]:
    """List alerts for a home, optionally filtered by status."""
    query = db.query(Alert).filter(Alert.home_id == home_id)

    if status_filter:
        query = query.filter(Alert.status == status_filter)

    return query.order_by(Alert.created_at.desc()).all()


def get_alert(db: Session, alert_id: UUID) -> Optional[Alert]:
    """Get an alert by ID."""
    return db.query(Alert).filter(Alert.id == alert_id).first()


def ack_alert(db: Session, alert_id: UUID, user: User) -> Alert:
    """Acknowledge an alert."""
    alert = get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    if alert.status != "open":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Alert is already {alert.status}")

    alert.status = "acked"
    alert.acked_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert


def escalate_alert(db: Session, alert_id: UUID, user: User) -> Alert:
    """Escalate an alert."""
    alert = get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    if alert.status == "closed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot escalate a closed alert")

    alert.status = "escalated"
    alert.escalated_at = datetime.utcnow()
    if not alert.acked_at:
        alert.acked_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert


def close_alert(db: Session, alert_id: UUID, user: User) -> Alert:
    """Close an alert."""
    alert = get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    alert.status = "closed"
    alert.closed_at = datetime.utcnow()
    if not alert.acked_at:
        alert.acked_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert
