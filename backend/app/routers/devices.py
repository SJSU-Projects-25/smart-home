"""Devices router."""
from fastapi import APIRouter

router = APIRouter(prefix="/devices", tags=["devices"])


@router.get("/")
async def devices_placeholder():
    """Placeholder endpoint."""
    return {"message": "Devices router - to be implemented"}

