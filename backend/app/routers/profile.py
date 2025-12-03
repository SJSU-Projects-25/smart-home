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
    from app.services.auth_service import get_user_home_id
    
    user = profile_service.get_user_profile(db, current_user.id)
    
    # Get home_id for the response
    home_id = get_user_home_id(db, user)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        home_id=home_id,
        first_name=user.first_name,
        last_name=user.last_name,
        contact_number=user.contact_number,
        operational_area=user.operational_area,
        experience_level=user.experience_level,
        certifications=user.certifications,
        profile_picture_url=user.profile_picture_url,
        created_at=user.created_at,
    )


@router.patch("", response_model=UserResponse)
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update current user's profile."""
    from app.services.auth_service import get_user_home_id
    
    user = profile_service.update_user_profile(db, current_user.id, profile_data)
    home_id = get_user_home_id(db, user)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        home_id=home_id,
        first_name=user.first_name,
        last_name=user.last_name,
        contact_number=user.contact_number,
        operational_area=user.operational_area,
        experience_level=user.experience_level,
        certifications=user.certifications,
        profile_picture_url=user.profile_picture_url,
        created_at=user.created_at,
    )


@router.post("/picture", response_model=ProfilePictureUploadResponse)
async def get_profile_picture_upload_url(
    current_user: Annotated[dict, Depends(get_current_user)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    """Get presigned URL for profile picture upload."""
    upload_url, picture_key = profile_service.generate_profile_picture_upload_url(
        current_user.id, settings
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
        db, current_user.id, picture_key, settings
    )
    return UserResponse.model_validate(user)


@router.delete("/picture", response_model=UserResponse)
async def delete_profile_picture(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    """Delete current user's profile picture."""
    from app.services.auth_service import get_user_home_id
    
    user = profile_service.delete_profile_picture(db, current_user.id, settings)
    home_id = get_user_home_id(db, user)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        home_id=home_id,
        first_name=user.first_name,
        last_name=user.last_name,
        contact_number=user.contact_number,
        operational_area=user.operational_area,
        experience_level=user.experience_level,
        certifications=user.certifications,
        profile_picture_url=user.profile_picture_url,
        created_at=user.created_at,
    )


@router.post("/password")
async def change_password(
    password_data: "PasswordChangeRequest",
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Change current user's password."""
    from app.schemas.profile import PasswordChangeRequest
    
    profile_service.change_password(
        db,
        current_user.id,
        password_data.current_password,
        password_data.new_password,
    )
    return {"message": "Password changed successfully"}


@router.get("/home", response_model="HomeProfileResponse")
async def get_home_profile(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Get current owner's home profile."""
    from app.schemas.profile import HomeProfileResponse, TechnicianInfo
    
    result = profile_service.get_home_profile(db, current_user.id)
    home = result["home"]
    technicians = result["technicians"]
    
    return HomeProfileResponse(
        id=str(home.id),
        name=home.name,
        address=home.address,
        contact_number=home.contact_number,
        home_size=home.home_size,
        number_of_rooms=home.number_of_rooms,
        house_type=home.house_type,
        status=home.status,
        assigned_technicians=[
            TechnicianInfo(
                id=str(t.id),
                first_name=t.first_name,
                last_name=t.last_name,
                email=t.email,
                contact_number=t.contact_number,
                operational_area=t.operational_area,
            )
            for t in technicians
        ],
    )


@router.patch("/home", response_model="HomeProfileResponse")
async def update_home_profile(
    home_data: "HomeProfileUpdateRequest",
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update current owner's home profile."""
    from app.schemas.profile import HomeProfileResponse, HomeProfileUpdateRequest, TechnicianInfo
    
    update_data = home_data.model_dump(exclude_unset=True)
    result = profile_service.update_home_profile(db, current_user.id, update_data)
    home = result["home"]
    technicians = result["technicians"]
    
    return HomeProfileResponse(
        id=str(home.id),
        name=home.name,
        address=home.address,
        contact_number=home.contact_number,
        home_size=home.home_size,
        number_of_rooms=home.number_of_rooms,
        house_type=home.house_type,
        status=home.status,
        assigned_technicians=[
            TechnicianInfo(
                id=str(t.id),
                first_name=t.first_name,
                last_name=t.last_name,
                email=t.email,
                contact_number=t.contact_number,
                operational_area=t.operational_area,
            )
            for t in technicians
        ],
    )
