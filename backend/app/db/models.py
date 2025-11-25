"""SQLAlchemy models for the application."""
import uuid
from datetime import datetime, time
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
    TIMESTAMP,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base

if TYPE_CHECKING:
    from collections.abc import Sequence


class User(Base):
    """User model."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )  # 'owner', 'technician', 'staff', 'admin'
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    owned_homes: Mapped[list["Home"]] = relationship("Home", back_populates="owner", foreign_keys="Home.owner_id")
    assignments: Mapped[list["Assignment"]] = relationship("Assignment", back_populates="user")


class Home(Base):
    """Home model."""

    __tablename__ = "homes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    timezone: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="owned_homes", foreign_keys=[owner_id])
    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="home", cascade="all, delete-orphan")
    devices: Mapped[list["Device"]] = relationship("Device", back_populates="home", cascade="all, delete-orphan")
    alerts: Mapped[list["Alert"]] = relationship("Alert", back_populates="home", cascade="all, delete-orphan")
    contacts: Mapped[list["Contact"]] = relationship("Contact", back_populates="home", cascade="all, delete-orphan")
    policies: Mapped[list["Policy"]] = relationship("Policy", back_populates="home", cascade="all, delete-orphan")
    model_configs: Mapped[list["ModelConfig"]] = relationship(
        "ModelConfig", back_populates="home", cascade="all, delete-orphan"
    )
    assignments: Mapped[list["Assignment"]] = relationship("Assignment", back_populates="home", cascade="all, delete-orphan")


class Room(Base):
    """Room model."""

    __tablename__ = "rooms"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    home_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("homes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    home: Mapped["Home"] = relationship("Home", back_populates="rooms")
    devices: Mapped[list["Device"]] = relationship("Device", back_populates="room", cascade="all, delete-orphan")
    alerts: Mapped[list["Alert"]] = relationship("Alert", back_populates="room")


class Device(Base):
    """Device model."""

    __tablename__ = "devices"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    home_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("homes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    room_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("rooms.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(Text, nullable=False)  # 'microphone', 'camera', etc.
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="offline")  # 'online', 'offline'
    last_seen_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    firmware_version: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    home: Mapped["Home"] = relationship("Home", back_populates="devices")
    room: Mapped["Room | None"] = relationship("Room", back_populates="devices")
    alerts: Mapped[list["Alert"]] = relationship("Alert", back_populates="device")


class Alert(Base):
    """Alert model."""

    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    home_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("homes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    room_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("rooms.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    device_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("devices.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    type: Mapped[str] = mapped_column(Text, nullable=False)  # 'scream', 'smoke_alarm', 'glass_break', etc.
    severity: Mapped[str] = mapped_column(String(20), nullable=False)  # 'low', 'medium', 'high'
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="open",
        index=True,
    )  # 'open', 'acked', 'escalated', 'closed'
    score: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    acked_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    escalated_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    home: Mapped["Home"] = relationship("Home", back_populates="alerts")
    room: Mapped["Room | None"] = relationship("Room", back_populates="alerts")
    device: Mapped["Device | None"] = relationship("Device", back_populates="alerts")


class Contact(Base):
    """Contact model for emergency contacts."""

    __tablename__ = "contacts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    home_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("homes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    channel: Mapped[str] = mapped_column(String(20), nullable=False)  # 'sms', 'email'
    value: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    home: Mapped["Home"] = relationship("Home", back_populates="contacts")


class Policy(Base):
    """Policy model for home alert policies."""

    __tablename__ = "policies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    home_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("homes.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    quiet_start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    quiet_end_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    auto_escalate_after_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Relationships
    home: Mapped["Home"] = relationship("Home", back_populates="policies")


class ModelConfig(Base):
    """Model configuration model."""

    __tablename__ = "model_configs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    home_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("homes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    model_key: Mapped[str] = mapped_column(Text, nullable=False)  # 'scream', 'smoke_alarm', etc.
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    threshold: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    params_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Relationships
    home: Mapped["Home"] = relationship("Home", back_populates="model_configs")


class Assignment(Base):
    """Assignment model for user-home assignments."""

    __tablename__ = "assignments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    home_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("homes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # 'technician', 'staff'

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="assignments")
    home: Mapped["Home"] = relationship("Home", back_populates="assignments")
