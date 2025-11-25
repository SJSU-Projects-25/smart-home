"""Data ingestion router."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.deps import get_current_user, get_db, get_settings
from app.db.models import User
from app.schemas.ingest import ConfirmUploadRequest, ConfirmUploadResponse, PresignRequest, PresignResponse
from app.services.ingestion_service import (
    EventsRepository,
    confirm_upload,
    create_presigned_url,
    insert_pending_event,
)

router = APIRouter(prefix="/ingest", tags=["ingest"])


def get_events_repo(settings: Annotated[Settings, Depends(get_settings)]) -> EventsRepository:
    """Get EventsRepository instance."""
    return EventsRepository(settings.mongo_uri)


@router.post("", response_model=PresignResponse)
async def presign_upload(
    request: PresignRequest,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    settings: Annotated[Settings, Depends(get_settings)] = None,
    events_repo: Annotated[EventsRepository, Depends(get_events_repo)] = None,
):
    """Generate presigned S3 URL for audio upload."""
    upload_url, s3_key = create_presigned_url(settings, request.device_id, request.home_id, request.mime)

    # Insert pending event in MongoDB
    insert_pending_event(events_repo, request.home_id, request.device_id, s3_key)

    return PresignResponse(
        upload_url=upload_url,
        s3_key=s3_key,
        expires_in=3600,
    )


@router.post("/confirm", response_model=ConfirmUploadResponse)
async def confirm_upload_endpoint(
    request: ConfirmUploadRequest,
    current_user: Annotated[User, Depends(get_current_user)] = None,
    settings: Annotated[Settings, Depends(get_settings)] = None,
    events_repo: Annotated[EventsRepository, Depends(get_events_repo)] = None,
):
    """Confirm upload completion and update event."""
    job_id = confirm_upload(events_repo, request.s3_key, request.device_id, request.home_id, request.duration_ms)

    return ConfirmUploadResponse(job_id=job_id)
