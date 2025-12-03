"""Network telemetry router."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.deps import get_current_user, get_db, get_settings, get_user_home_access
from app.db.models import User
from app.services.network_service import get_device_network_status

router = APIRouter(prefix="/network", tags=["network"])


@router.get("/status")
async def get_network_status_endpoint(
    home_id: Annotated[UUID, Query()],
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
    settings: Annotated[Settings, Depends(get_settings)] = None,
):
    """Get network status for all devices in a home."""
    _, validated_home_id = get_user_home_access(current_user, db, str(home_id))
    if not validated_home_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No home access")

    network_status = get_device_network_status(db, settings, UUID(validated_home_id))
    return network_status


