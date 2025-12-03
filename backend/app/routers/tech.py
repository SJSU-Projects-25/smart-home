"""Technician analytics and workflows router."""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.deps import get_db, get_settings, require_role
from app.db.models import User
from app.schemas.installation_requests import (
    InstallationRequestResponse,
    TechInstallationUpdate,
    TechInstallationItemUpdate,
)
from app.services.tech_analytics_service import get_tech_overview

router = APIRouter(prefix="/tech", tags=["tech"])


@router.get("/overview")
async def tech_overview_endpoint(
    current_user: Annotated[User, Depends(require_role("technician", "admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
    settings: Annotated[Settings, Depends(get_settings)] = None,
):
    """Get technician overview statistics for assigned homes."""
    return get_tech_overview(db, settings, current_user.id)


@router.get("/installation-requests", response_model=list[InstallationRequestResponse])
async def list_tech_installation_requests_endpoint(
    status_filter: Annotated[Optional[str], Query(alias="status")] = None,
    current_user: Annotated[User, Depends(require_role("technician", "admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List installation requests for homes assigned to the technician."""
    from app.db.models import Assignment, InstallationRequest

    try:
        # Determine technician id (admin can view all)
        if current_user.role == "technician":
            tech_id = current_user.id
            assignments = db.query(Assignment).filter(Assignment.user_id == tech_id).all()
            home_ids = [a.home_id for a in assignments]
            if not home_ids:
                return []

            query = db.query(InstallationRequest).filter(
                InstallationRequest.home_id.in_(home_ids)
            )
        else:  # admin
            query = db.query(InstallationRequest)

        if status_filter:
            query = query.filter(InstallationRequest.status == status_filter)

        requests = (
            query.order_by(InstallationRequest.created_at.desc())
            .limit(200)
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
    except Exception as e:
        print(f"Error listing tech installation requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load installation requests: {e}",
        )


@router.patch(
    "/installation-requests/{request_id}",
    response_model=InstallationRequestResponse,
)
async def update_tech_installation_request_endpoint(
    request_id: UUID,
    payload: TechInstallationUpdate,
    current_user: Annotated[User, Depends(require_role("technician", "admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Technician updates installation request status/notes."""
    from app.db.models import Assignment, Home, InstallationRequest, InstallationItem, Device

    req = db.query(InstallationRequest).filter(InstallationRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    # Authorization: technicians must be assigned to this home
    if current_user.role == "technician":
        home = db.query(Home).filter(Home.id == req.home_id).first()
        if not home:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")
        assignment = (
            db.query(Assignment)
            .filter(Assignment.user_id == current_user.id, Assignment.home_id == home.id)
            .first()
        )
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to this home",
            )

    if payload.status:
        req.status = payload.status
    if payload.notes:
        req.notes = payload.notes

    # When marking as installed, mark the overall home as configured/online.
    # Devices are created at the item-approval/plan-approval stage; we avoid
    # creating duplicates here.
    if payload.status == "installed":
        home = db.query(Home).filter(Home.id == req.home_id).first()
        if home:
            home.status = "Devices Installed and Configured"

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


@router.patch(
    "/installation-requests/{request_id}/items/{item_id}",
    response_model=InstallationRequestResponse,
)
async def update_tech_installation_item_endpoint(
    request_id: UUID,
    item_id: UUID,
    payload: TechInstallationItemUpdate,
    current_user: Annotated[User, Depends(require_role("technician", "admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Technician approves/rejects/updates a single room item within an installation request."""
    from app.db.models import Assignment, Home, InstallationRequest, InstallationItem, Device

    req = db.query(InstallationRequest).filter(InstallationRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    # Authorization: technicians must be assigned to this home
    if current_user.role == "technician":
        home = db.query(Home).filter(Home.id == req.home_id).first()
        if not home:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")
        assignment = (
            db.query(Assignment)
            .filter(Assignment.user_id == current_user.id, Assignment.home_id == home.id)
            .first()
        )
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to this home",
            )

    item = (
        db.query(InstallationItem)
        .filter(InstallationItem.id == item_id, InstallationItem.request_id == req.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    if payload.desired_device_count is not None:
        if payload.desired_device_count < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="desired_device_count must be non-negative",
            )
        item.desired_device_count = payload.desired_device_count

    if payload.notes is not None:
        item.notes = payload.notes

    # Handle status transitions and associated device creation
    def map_coverage_to_device_type(coverage_type: str) -> str:
        coverage = coverage_type.lower()
        if "environment" in coverage or "smoke" in coverage or "water" in coverage:
            return "environment_sensor"
        if "intrusion" in coverage:
            return "door_window_sensor"
        if "fall" in coverage or "safety" in coverage:
            return "safety_microphone"
        if "full" in coverage:
            return "multi_sensor_hub"
        return "microphone"

    if payload.status:
        previous_status = item.status
        item.status = payload.status

        # On approval, create devices but leave request overall status untouched
        if payload.status == "approved" and previous_status != "approved":
            desired_count = item.desired_device_count or 1
            if desired_count > 0:
                device_type = map_coverage_to_device_type(item.coverage_type)
                for i in range(desired_count):
                    name_suffix = f"{i + 1}" if desired_count > 1 else ""
                    device_name = f"{item.coverage_type.replace('_', ' ').title()} Device {name_suffix}".strip()
                    db.add(
                        Device(
                            home_id=req.home_id,
                            room_id=item.room_id,
                            name=device_name,
                            type=device_type,
                            status="offline",
                        )
                    )

    # If all items are approved or installed, move request to approved
    if all(i.status in {"approved", "installed"} for i in req.items):
        req.status = "approved"

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


@router.post(
    "/installation-requests/{request_id}/approve-all",
    response_model=InstallationRequestResponse,
)
async def approve_all_items_for_request_endpoint(
    request_id: UUID,
    current_user: Annotated[User, Depends(require_role("technician", "admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Technician bulk-approves all pending items for a request and creates devices."""
    from app.db.models import Assignment, Home, InstallationRequest, InstallationItem, Device

    req = db.query(InstallationRequest).filter(InstallationRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    # Authorization: technicians must be assigned to this home
    if current_user.role == "technician":
        home = db.query(Home).filter(Home.id == req.home_id).first()
        if not home:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")
        assignment = (
            db.query(Assignment)
            .filter(Assignment.user_id == current_user.id, Assignment.home_id == home.id)
            .first()
        )
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to this home",
            )

    def map_coverage_to_device_type(coverage_type: str) -> str:
        coverage = coverage_type.lower()
        if "environment" in coverage or "smoke" in coverage or "water" in coverage:
            return "environment_sensor"
        if "intrusion" in coverage:
            return "door_window_sensor"
        if "fall" in coverage or "safety" in coverage:
            return "safety_microphone"
        if "full" in coverage:
            return "multi_sensor_hub"
        return "microphone"

    for item in req.items:
        if item.status not in {"pending", "requested"}:
            continue
        desired_count = item.desired_device_count or 1
        if desired_count <= 0:
            continue

        device_type = map_coverage_to_device_type(item.coverage_type)
        for i in range(desired_count):
            name_suffix = f"{i + 1}" if desired_count > 1 else ""
            device_name = f"{item.coverage_type.replace('_', ' ').title()} Device {name_suffix}".strip()
            db.add(
                Device(
                    home_id=req.home_id,
                    room_id=item.room_id,
                    name=device_name,
                    type=device_type,
                    status="offline",
                )
            )
        item.status = "approved"

    # If we approved at least one item, move request to approved
    if any(item.status == "approved" for item in req.items):
        req.status = "approved"

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
