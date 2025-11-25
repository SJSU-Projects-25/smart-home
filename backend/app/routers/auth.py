"""Authentication router."""
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/")
async def auth_placeholder():
    """Placeholder endpoint."""
    return {"message": "Auth router - to be implemented"}

