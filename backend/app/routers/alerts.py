"""Alerts router."""
from fastapi import APIRouter

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/")
async def alerts_placeholder():
    """Placeholder endpoint."""
    return {"message": "Alerts router - to be implemented"}

