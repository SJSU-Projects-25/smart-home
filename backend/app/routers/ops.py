"""Operations router."""
from typing import Annotated, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db, require_role
from app.db.models import User
from app.services.ops_service import get_ops_overview, list_ops_homes

router = APIRouter(prefix="/ops", tags=["ops"])


@router.get("/overview")
async def ops_overview_endpoint(
    current_user: Annotated[User, Depends(require_role("staff", "admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Get operations overview (staff/admin only)."""
    return get_ops_overview(db)


@router.get("/houses")
async def list_ops_houses_endpoint(
    current_user: Annotated[User, Depends(require_role("staff", "admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List all homes with statistics (staff/admin only)."""
    return list_ops_homes(db)


@router.get("/audit")
async def list_audit_logs_endpoint(
    user: Annotated[Optional[str], Query()] = None,
    action: Annotated[Optional[str], Query()] = None,
    start_date: Annotated[Optional[str], Query()] = None,
    end_date: Annotated[Optional[str], Query()] = None,
    current_user: Annotated[User, Depends(require_role("staff", "admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List audit logs (staff/admin only)."""
    # For now, return empty list - audit logging can be implemented later
    # This is a placeholder that matches the frontend API
    return []
