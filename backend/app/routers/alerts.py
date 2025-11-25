"""Alerts router."""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db, get_user_home_access
from app.db.models import User
from app.schemas.alerts import AlertResponse
from app.services.alert_service import ack_alert, close_alert, escalate_alert, get_alert, list_alerts

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertResponse])
async def list_alerts_endpoint(
    home_id: Annotated[UUID, Query()],
    status: Annotated[Optional[str], Query()] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List alerts for a home."""
    _, validated_home_id = get_user_home_access(current_user, db, str(home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No home access")

    alerts = list_alerts(db, UUID(validated_home_id), status)
    return alerts


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert_endpoint(
    alert_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Get an alert by ID."""
    alert = get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(alert.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return alert


@router.post("/{alert_id}/ack", response_model=AlertResponse)
async def ack_alert_endpoint(
    alert_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Acknowledge an alert."""
    alert = get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(alert.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    alert = ack_alert(db, alert_id, current_user)
    return alert


@router.post("/{alert_id}/escalate", response_model=AlertResponse)
async def escalate_alert_endpoint(
    alert_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Escalate an alert."""
    alert = get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(alert.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    alert = escalate_alert(db, alert_id, current_user)
    return alert


@router.post("/{alert_id}/close", response_model=AlertResponse)
async def close_alert_endpoint(
    alert_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Close an alert."""
    alert = get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    # Validate home access
    _, validated_home_id = get_user_home_access(current_user, db, str(alert.home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    alert = close_alert(db, alert_id, current_user)
    return alert
