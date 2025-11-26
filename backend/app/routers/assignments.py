"""Assignments router."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.db.models import Assignment, Home, User

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.get("")
async def list_assignments_endpoint(
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List assignments for current user."""
    assignments = db.query(Assignment).filter(Assignment.user_id == current_user.id).all()
    result = []
    for assignment in assignments:
        home = db.query(Home).filter(Home.id == assignment.home_id).first()
        if home:
            # Count rooms and devices
            from app.db.models import Room, Device
            from sqlalchemy import func

            rooms_count = db.query(func.count(Room.id)).filter(Room.home_id == home.id).scalar() or 0
            devices_count = db.query(func.count(Device.id)).filter(Device.home_id == home.id).scalar() or 0

            result.append(
                {
                    "id": str(assignment.id),
                    "user_id": str(assignment.user_id),
                    "home_id": str(assignment.home_id),
                    "role": assignment.role,
                    "home": {
                        "id": str(home.id),
                        "name": home.name,
                        "timezone": home.timezone,
                        "rooms_count": rooms_count,
                        "devices_count": devices_count,
                    },
                }
            )
    return result

