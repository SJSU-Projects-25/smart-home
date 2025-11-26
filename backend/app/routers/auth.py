"""Authentication router."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.deps import get_db, get_settings
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse, RegisterRequest
from app.services.auth_service import authenticate_user, create_access_token_for_user, get_user_home_id, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
):
    """Login endpoint."""
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    home_id = get_user_home_id(db, user)
    token = create_access_token_for_user(user, settings, home_id)

    return LoginResponse(
        user=UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            home_id=home_id,
        ),
        token=token,
    )


@router.post("/register", response_model=UserResponse)
async def register(
    register_data: RegisterRequest,
    db: Annotated[Session, Depends(get_db)],
):
    """Register endpoint."""
    user = register_user(db, register_data)
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        home_id=get_user_home_id(db, user),
    )
