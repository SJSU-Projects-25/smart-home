"""Owner analytics router."""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.deps import get_current_user, get_db, get_settings, require_role
from app.db.models import User
from app.schemas.analytics import OwnerOverviewResponse
from app.services.owner_analytics_service import get_owner_overview

router = APIRouter(prefix="/owner", tags=["owner"])


@router.get("/overview", response_model=OwnerOverviewResponse)
async def owner_overview_endpoint(
    home_id: Annotated[Optional[str], Query()] = None,
    current_user: Annotated[User, Depends(require_role("owner", "admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
    settings: Annotated[Settings, Depends(get_settings)] = None,
):
    """Get owner overview statistics for a specific home."""
    from app.db.models import Home
    
    # Get home_id from query param or user's first home
    home_uuid: Optional[UUID] = None
    
    if home_id:
        try:
            home_uuid = UUID(home_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid home_id format",
            )
    else:
        # Get user's first home
        if current_user.role == "owner":
            home = db.query(Home).filter(Home.owner_id == current_user.id).first()
            if not home:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No home found for this user",
                )
            home_uuid = home.id
        else:  # admin
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="home_id is required for admin users",
            )

    if not home_uuid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="home_id is required",
        )

    # Verify access
    if current_user.role == "owner":
        home = db.query(Home).filter(Home.id == home_uuid, Home.owner_id == current_user.id).first()
        if not home:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this home",
            )

    return get_owner_overview(db, settings, home_uuid)


@router.get("/events/timeseries")
async def owner_events_timeseries_endpoint(
    home_id: Annotated[Optional[str], Query()] = None,
    hours: Annotated[int, Query(description="Number of hours to look back", ge=1, le=168)] = 24,
    current_user: Annotated[User, Depends(require_role("owner", "admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
    settings: Annotated[Settings, Depends(get_settings)] = None,
):
    """Get events time-series data for a home."""
    from app.db.models import Home
    from app.services.events_repository import EventsRepository
    
    # Get home_id from query param or user's first home
    home_uuid: Optional[UUID] = None
    
    if home_id:
        try:
            home_uuid = UUID(home_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid home_id format",
            )
    else:
        if current_user.role == "owner":
            home = db.query(Home).filter(Home.owner_id == current_user.id).first()
            if not home:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No home found for this user",
                )
            home_uuid = home.id
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="home_id is required for admin users",
            )

    if not home_uuid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="home_id is required",
        )

    # Verify access
    if current_user.role == "owner":
        home = db.query(Home).filter(Home.id == home_uuid, Home.owner_id == current_user.id).first()
        if not home:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this home",
            )

    events_repo = EventsRepository(settings.mongo_uri)
    events_data = events_repo.get_events_by_hour_last_24h(home_uuid)
    
    return {"data": events_data}

