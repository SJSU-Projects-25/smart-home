"""Technician analytics router."""
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.deps import get_current_user, get_db, get_settings, require_role
from app.db.models import User
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


