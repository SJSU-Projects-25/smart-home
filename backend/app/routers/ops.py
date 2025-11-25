"""Operations router."""
from fastapi import APIRouter

router = APIRouter(prefix="/ops", tags=["ops"])


@router.get("/")
async def ops_placeholder():
    """Placeholder endpoint."""
    return {"message": "Ops router - to be implemented"}

