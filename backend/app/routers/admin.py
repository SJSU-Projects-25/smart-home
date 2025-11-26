"""Admin router."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db, require_role
from app.db.models import User
from app.schemas.homes import HomeCreate, HomeResponse, HomeUpdate
from app.schemas.users import UserCreate, UserResponse, UserUpdate
from app.services.home_service import create_home, delete_home, get_home, list_homes, update_home
from app.services.user_service import create_user, delete_user, get_user, list_users, update_user

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserResponse])
async def list_users_endpoint(
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List all users (admin only)."""
    from app.db.models import Home

    users = list_users(db)
    # Add home_id to response
    result = []
    for user in users:
        home_id = None
        if user.role == "owner":
            home = db.query(Home).filter(Home.owner_id == user.id).first()
            if home:
                home_id = home.id
        result.append(
            UserResponse(
                id=user.id,
                email=user.email,
                role=user.role,
                home_id=home_id,
                created_at=user.created_at,
            )
        )
    return result


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_endpoint(
    user_data: UserCreate,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Create a new user (admin only)."""
    # Convert home_id string to UUID if provided
    home_id_uuid = None
    if user_data.home_id:
        # Handle empty string, None, or whitespace
        home_id_str = str(user_data.home_id).strip() if user_data.home_id else ""
        if home_id_str:
            try:
                home_id_uuid = UUID(home_id_str)
            except (ValueError, AttributeError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid home_id format: '{home_id_str}'. Must be a valid UUID.",
                )

    user = create_user(db, user_data.email, user_data.password, user_data.role, home_id_uuid)
    home_id = None
    if user.role == "owner" and home_id_uuid:
        home_id = home_id_uuid
    elif user.role == "owner":
        # Check if user has a home
        from app.db.models import Home
        home = db.query(Home).filter(Home.owner_id == user.id).first()
        if home:
            home_id = home.id
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        home_id=home_id,
        created_at=user.created_at,
    )


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user_endpoint(
    user_id: UUID,
    user_data: UserUpdate,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Update a user (admin only)."""
    # Convert home_id string to UUID if provided
    home_id_uuid = None
    if user_data.home_id:
        # Handle empty string, None, or whitespace
        home_id_str = str(user_data.home_id).strip() if user_data.home_id else ""
        if home_id_str:
            try:
                home_id_uuid = UUID(home_id_str)
            except (ValueError, AttributeError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid home_id format: '{home_id_str}'. Must be a valid UUID.",
                )

    user = update_user(db, user_id, user_data.email, user_data.role, home_id_uuid)
    home_id = None
    if user.role == "owner":
        from app.db.models import Home
        home = db.query(Home).filter(Home.owner_id == user.id).first()
        if home:
            home_id = home.id
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        home_id=home_id,
        created_at=user.created_at,
    )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(
    user_id: UUID,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Delete a user (admin only)."""
    delete_user(db, user_id)
    return None


@router.get("/homes")
async def list_homes_endpoint(
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List all homes with statistics (admin only)."""
    from app.db.models import Device, Room, Alert
    from sqlalchemy import func

    homes = list_homes(db)
    result = []
    for home in homes:
        owner = db.query(User).filter(User.id == home.owner_id).first()
        devices_count = db.query(func.count(Device.id)).filter(Device.home_id == home.id).scalar() or 0
        online_count = (
            db.query(func.count(Device.id)).filter(Device.home_id == home.id, Device.status == "online").scalar() or 0
        )
        open_alerts_count = (
            db.query(func.count(Alert.id)).filter(Alert.home_id == home.id, Alert.status == "open").scalar() or 0
        )
        rooms_count = db.query(func.count(Room.id)).filter(Room.home_id == home.id).scalar() or 0

        result.append(
            {
                "id": str(home.id),
                "name": home.name,
                "owner_id": str(home.owner_id),
                "owner_email": owner.email if owner else "Unknown",
                "timezone": home.timezone,
                "rooms_count": rooms_count,
                "devices_count": devices_count,
                "open_alerts_count": open_alerts_count,
                "created_at": home.created_at.isoformat(),
            }
        )
    return result


@router.post("/homes", response_model=HomeResponse, status_code=status.HTTP_201_CREATED)
async def create_home_endpoint(
    home_data: HomeCreate,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Create a new home (admin only)."""
    return create_home(db, home_data.name, home_data.owner_id, home_data.timezone)


@router.patch("/homes/{home_id}", response_model=HomeResponse)
async def update_home_endpoint(
    home_id: UUID,
    home_data: HomeUpdate,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Update a home (admin only)."""
    return update_home(db, home_id, home_data.name, home_data.timezone)


@router.delete("/homes/{home_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_home_endpoint(
    home_id: UUID,
    current_user: Annotated[User, Depends(require_role("admin"))] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Delete a home (admin only)."""
    delete_home(db, home_id)
    return None
