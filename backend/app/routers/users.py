"""Users router."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.db.models import Assignment, User
from app.schemas.users import UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(
    current_user: Annotated[User, Depends(get_current_user)] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Get current user info."""
    from app.db.models import Home

    home_id = None
    if current_user.role == "owner":
        home = db.query(Home).filter(Home.owner_id == current_user.id).first()
        if home:
            home_id = home.id
    elif current_user.role in ["technician", "staff"]:
        assignment = db.query(Assignment).filter(Assignment.user_id == current_user.id).first()
        if assignment:
            home_id = assignment.home_id

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        home_id=home_id,
        created_at=current_user.created_at,
    )
