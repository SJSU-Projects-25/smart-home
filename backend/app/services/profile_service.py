"""Profile management service."""
import boto3
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.models import User
from app.schemas.profile import ProfileUpdateRequest


def get_user_profile(db: Session, user_id: str) -> User:
    """Get user profile by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


def update_user_profile(db: Session, user_id: str, profile_data: ProfileUpdateRequest) -> User:
    """Update user profile."""
    user = get_user_profile(db, user_id)
    
    # Update only provided fields
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


def generate_profile_picture_upload_url(user_id: str, settings: Settings) -> tuple[str, str]:
    """Generate presigned S3 URL for profile picture upload."""
    s3_client = boto3.client(
        "s3",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        endpoint_url=settings.aws_s3_endpoint_url,
    )
    
    picture_key = f"profile-pictures/{user_id}/profile.jpg"
    
    # Generate presigned URL for PUT operation
    upload_url = s3_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.s3_bucket,
            "Key": picture_key,
            "ContentType": "image/jpeg",
        },
        ExpiresIn=300,  # 5 minutes
    )
    
    # Use frontend-accessible endpoint for the URL
    if settings.aws_s3_endpoint_url_frontend:
        upload_url = upload_url.replace(
            settings.aws_s3_endpoint_url,
            settings.aws_s3_endpoint_url_frontend
        )
    
    return upload_url, picture_key


def confirm_profile_picture_upload(db: Session, user_id: str, picture_key: str, settings: Settings) -> User:
    """Confirm profile picture upload and update user record."""
    user = get_user_profile(db, user_id)
    
    # Generate public URL for the picture
    picture_url = f"{settings.aws_s3_endpoint_url_frontend or settings.aws_s3_endpoint_url}/{settings.s3_bucket}/{picture_key}"
    
    user.profile_picture_url = picture_url
    db.commit()
    db.refresh(user)
    return user


def delete_profile_picture(db: Session, user_id: str, settings: Settings) -> User:
    """Delete profile picture from S3 and update user record."""
    user = get_user_profile(db, user_id)
    
    if not user.profile_picture_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile picture to delete",
        )
    
    # Delete from S3
    s3_client = boto3.client(
        "s3",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        endpoint_url=settings.aws_s3_endpoint_url,
    )
    
    picture_key = f"profile-pictures/{user_id}/profile.jpg"
    
    try:
        s3_client.delete_object(Bucket=settings.s3_bucket, Key=picture_key)
    except Exception as e:
        # Log error but continue - picture might not exist in S3
        print(f"Error deleting profile picture from S3: {e}")
    
    # Update user record
    user.profile_picture_url = None
    db.commit()
    db.refresh(user)
    return user
