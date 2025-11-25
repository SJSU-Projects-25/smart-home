"""Data ingestion router."""
from fastapi import APIRouter

router = APIRouter(prefix="/ingest", tags=["ingest"])


@router.get("/")
async def ingest_placeholder():
    """Placeholder endpoint."""
    return {"message": "Ingest router - to be implemented"}

