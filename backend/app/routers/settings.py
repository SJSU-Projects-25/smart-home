"""Settings router."""
from fastapi import APIRouter

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/")
async def settings_placeholder():
    """Placeholder endpoint."""
    return {"message": "Settings router - to be implemented"}

