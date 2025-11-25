"""Model configuration router."""
from fastapi import APIRouter

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/")
async def models_cfg_placeholder():
    """Placeholder endpoint."""
    return {"message": "Models config router - to be implemented"}

