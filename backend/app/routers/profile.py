"""Profile management router."""
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.deps import get_current_user, get_db, get_settings
from app.schemas.profile import ProfilePictureUploadResponse, ProfileUpdateRequest
from app.schemas.users import UserResponse
from app.services import profile_service

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=UserResponse)
async def get_profile(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get current user's profile."""
    user = profile_service.get_user_profile(db, current_user["user_id"])
    return UserResponse.model_validate(user)


@router.patch("", response_model=UserResponse)
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update current user's profile."""
    user = profile_service.update_user_profile(db, current_user["user_id"], profile_data)
    return UserResponse.model_validate(user)


@router.post("/picture", response_model=ProfilePictureUploadResponse)
async def get_profile_picture_upload_url(
    current_user: Annotated[dict, Depends(get_current_user)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    """Get presigned URL for profile picture upload."""
    upload_url, picture_key = profile_service.generate_profile_picture_upload_url(
        current_user["user_id"], settings
    )
    return ProfilePictureUploadResponse(upload_url=upload_url, picture_key=picture_key)


@router.post("/picture/confirm", response_model=UserResponse)
async def confirm_profile_picture(
    picture_key: str,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    """Confirm profile picture upload and update user record."""
    user = profile_service.confirm_profile_picture_upload(
        db, current_user["user_id"], picture_key, settings
    )
    return UserResponse.model_validate(user)


@router.delete("/picture", response_model=UserResponse)
async def delete_profile_picture(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    """Delete current user's profile picture."""
    user = profile_service.delete_profile_picture(db, current_user["user_id"], settings)
    return UserResponse.model_validate(user)
