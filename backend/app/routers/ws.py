"""WebSocket router."""
from fastapi import APIRouter

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.get("/")
async def ws_placeholder():
    """Placeholder endpoint."""
    return {"message": "WebSocket router - to be implemented"}

