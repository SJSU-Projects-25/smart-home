"""Database session management."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import Settings


def get_engine(settings: Settings):
    """Create and return SQLAlchemy engine."""
    return create_engine(settings.database_url, pool_pre_ping=True)


def get_session_local(settings: Settings):
    """Create and return SessionLocal factory."""
    engine = get_engine(settings)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)

