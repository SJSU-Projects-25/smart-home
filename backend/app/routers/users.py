"""Users router."""
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
async def users_placeholder():
    """Placeholder endpoint."""
    return {"message": "Users router - to be implemented"}

