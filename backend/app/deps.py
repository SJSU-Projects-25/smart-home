"""FastAPI dependencies."""
from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.session import get_session_local

# Singleton settings instance
_settings: Settings | None = None


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

