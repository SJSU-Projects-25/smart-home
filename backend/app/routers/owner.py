"""Owner analytics router."""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.deps import get_current_user, get_db, get_settings, require_role
from app.db.models import User
from app.schemas.analytics import OwnerOverviewResponse
from app.schemas.installation_requests import (
    InstallationRequestCreate,
    InstallationRequestResponse,
    OwnerInstallationStatusUpdate,
)
from app.schemas.rooms import RoomCreate, RoomResponse, RoomUpdate
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


@router.get("/rooms", response_model=list[RoomResponse])
async def list_owner_rooms_endpoint(
    current_user: Annotated[User, Depends(require_role("owner"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List rooms for the owner's home."""
    from app.db.models import Home, Room

    home = db.query(Home).filter(Home.owner_id == current_user.id).first()
    if not home:
        return []

    rooms = (
        db.query(Room)
        .filter(Room.home_id == home.id)
        .order_by(Room.created_at if hasattr(Room, "created_at") else Room.name)
        .all()
    )
    return rooms


@router.post("/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_owner_room_endpoint(
    room_data: RoomCreate,
    current_user: Annotated[User, Depends(require_role("owner"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Owner creates a new room for their home."""
    from app.db.models import Home, Room

    home = db.query(Home).filter(Home.owner_id == current_user.id).first()
    if not home:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No home found for this user"
        )

    room = Room(home_id=home.id, name=room_data.name, type=room_data.type)
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.patch("/rooms/{room_id}", response_model=RoomResponse)
async def update_owner_room_endpoint(
    room_id: UUID,
    room_data: RoomUpdate,
    current_user: Annotated[User, Depends(require_role("owner"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Owner updates an existing room."""
    from app.db.models import Home, Room

    home = db.query(Home).filter(Home.owner_id == current_user.id).first()
    if not home:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No home found for this user"
        )

    room = (
        db.query(Room)
        .filter(Room.id == room_id, Room.home_id == home.id)
        .first()
    )
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    if room_data.name is not None:
        room.name = room_data.name
    if room_data.type is not None:
        room.type = room_data.type

    db.commit()
    db.refresh(room)
    return room


@router.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_owner_room_endpoint(
    room_id: UUID,
    current_user: Annotated[User, Depends(require_role("owner"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Owner deletes a room from their home."""
    from app.db.models import Home, Room

    home = db.query(Home).filter(Home.owner_id == current_user.id).first()
    if not home:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No home found for this user"
        )

    room = (
        db.query(Room)
        .filter(Room.id == room_id, Room.home_id == home.id)
        .first()
    )
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

    db.delete(room)
    db.commit()
    return None


@router.post("/installation-requests", response_model=InstallationRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_installation_request_endpoint(
    payload: InstallationRequestCreate,
    current_user: Annotated[User, Depends(require_role("owner"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Owner creates a new installation request for their home."""
    from app.db.models import Home, InstallationRequest, InstallationItem, Room

    # Resolve home
    home_id = payload.home_id
    if not home_id:
        home = db.query(Home).filter(Home.owner_id == current_user.id).first()
        if not home:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No home found for this user",
            )
        home_id = home.id
    else:
        home = db.query(Home).filter(Home.id == home_id, Home.owner_id == current_user.id).first()
        if not home:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this home",
            )

    # Basic validation for room ids
    room_ids = {item.room_id for item in payload.items if item.room_id is not None}
    if room_ids:
        valid_rooms = {
            r.id
            for r in db.query(Room).filter(Room.home_id == home_id, Room.id.in_(room_ids)).all()
        }
        invalid = room_ids - valid_rooms
        if invalid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more rooms do not belong to this home",
            )

    request = InstallationRequest(
        home_id=home_id,
        owner_id=current_user.id,
        notes=payload.notes,
        status="submitted",
        kind="install",
    )
    db.add(request)
    db.flush()

    for item in payload.items:
        desired_count = item.desired_device_count or 1
        if desired_count < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="desired_device_count must be non-negative",
            )
        db.add(
            InstallationItem(
                request_id=request.id,
                room_id=item.room_id,
                coverage_type=item.coverage_type,
                desired_device_count=desired_count,
                notes=item.notes,
            )
        )

    db.commit()
    db.refresh(request)

    return InstallationRequestResponse(
        id=request.id,
        home_id=request.home_id,
        owner_id=request.owner_id,
        technician_id=request.technician_id,
        status=request.status,
        notes=request.notes,
        created_at=request.created_at,
        updated_at=request.updated_at,
        items=[
            {
                "id": item.id,
                "room_id": item.room_id,
                "coverage_type": item.coverage_type,
                "desired_device_count": item.desired_device_count,
                "notes": item.notes,
                "proposed_device_type": item.proposed_device_type,
                "status": item.status,
            }
            for item in request.items
        ],
    )


@router.get("/installation-requests", response_model=list[InstallationRequestResponse])
async def list_owner_installation_requests_endpoint(
    current_user: Annotated[User, Depends(require_role("owner"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List installation requests for the owner's home."""
    from app.db.models import Home, InstallationRequest

    home = db.query(Home).filter(Home.owner_id == current_user.id).first()
    if not home:
        return []

    requests = (
        db.query(InstallationRequest)
        .filter(InstallationRequest.home_id == home.id)
        .order_by(InstallationRequest.created_at.desc())
        .all()
    )

    responses: list[InstallationRequestResponse] = []
    for req in requests:
        responses.append(
            InstallationRequestResponse(
                id=req.id,
                home_id=req.home_id,
                owner_id=req.owner_id,
                technician_id=req.technician_id,
                status=req.status,
                notes=req.notes,
                created_at=req.created_at,
                updated_at=req.updated_at,
                items=[
                    {
                        "id": item.id,
                        "room_id": item.room_id,
                        "coverage_type": item.coverage_type,
                        "desired_device_count": item.desired_device_count,
                        "notes": item.notes,
                        "proposed_device_type": item.proposed_device_type,
                        "status": item.status,
                    }
                    for item in req.items
                ],
            )
        )
    return responses


@router.patch("/installation-requests/{request_id}", response_model=InstallationRequestResponse)
async def owner_update_installation_request_status_endpoint(
    request_id: UUID,
    payload: OwnerInstallationStatusUpdate,
    current_user: Annotated[User, Depends(require_role("owner"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Owner approves a plan or requests changes."""
    from app.db.models import InstallationRequest, Home

    req = (
        db.query(InstallationRequest)
        .join(Home, Home.id == InstallationRequest.home_id)
        .filter(Home.owner_id == current_user.id, InstallationRequest.id == request_id)
        .first()
    )
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if payload.action == "approve":
        req.status = "owner_approved"
    elif payload.action == "request_changes":
        req.status = "changes_requested"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Must be 'approve' or 'request_changes'.",
        )

    if payload.notes:
        req.notes = payload.notes

    db.commit()
    db.refresh(req)

    return InstallationRequestResponse(
        id=req.id,
        home_id=req.home_id,
        owner_id=req.owner_id,
        technician_id=req.technician_id,
        status=req.status,
        notes=req.notes,
        created_at=req.created_at,
        updated_at=req.updated_at,
        items=[
            {
                "id": item.id,
                "room_id": item.room_id,
                "coverage_type": item.coverage_type,
                "desired_device_count": item.desired_device_count,
                "notes": item.notes,
                "proposed_device_type": item.proposed_device_type,
                "status": item.status,
            }
            for item in req.items
        ],
    )

