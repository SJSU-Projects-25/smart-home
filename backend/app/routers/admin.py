"""Admin router."""
from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/")
async def admin_placeholder():
    """Placeholder endpoint."""
    return {"message": "Admin router - to be implemented"}

