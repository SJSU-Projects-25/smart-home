"""FastAPI dependencies."""
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import decode_token
from app.db.models import Assignment, Home, User
from app.db.session import get_session_local

# Singleton settings instance
_settings: Settings | None = None

security = HTTPBearer()


def get_settings() -> Settings:
    """Get or create singleton Settings instance."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings


def get_db(settings: Annotated[Settings, Depends(get_settings)]) -> Session:
    """Get database session."""
    SessionLocal = get_session_local(settings)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> User:
    """Get the current authenticated user from JWT token."""
    token = credentials.credentials
    try:
        payload = decode_token(token, settings)
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def require_role(*allowed_roles: str):
    """Dependency factory to require specific roles."""

    def role_checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker


def get_user_home_access(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    home_id: Optional[str] = None,
) -> tuple[User, Optional[str]]:
    """Get user and validate home access."""
    from uuid import UUID

    if current_user.role == "admin":
        return current_user, home_id

    if current_user.role == "owner":
        if home_id:
            try:
                home_uuid = UUID(home_id)
            except ValueError:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid home_id format")
            home = db.query(Home).filter(Home.id == home_uuid, Home.owner_id == current_user.id).first()
            if not home:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this home")
        else:
            # Get first owned home
            home = db.query(Home).filter(Home.owner_id == current_user.id).first()
            if home:
                home_id = str(home.id)
        return current_user, home_id

    # For technician/staff, check assignments
    if home_id:
        try:
            home_uuid = UUID(home_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid home_id format")
        assignment = (
            db.query(Assignment)
            .filter(Assignment.user_id == current_user.id, Assignment.home_id == home_uuid)
            .first()
        )
        if not assignment:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this home")
    else:
        assignment = db.query(Assignment).filter(Assignment.user_id == current_user.id).first()
        if assignment:
            home_id = str(assignment.home_id)

    return current_user, home_id

