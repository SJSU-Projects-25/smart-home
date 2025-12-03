"""add installation_requests and installation_items tables

Revision ID: aa11bb22cc33
Revises: 56a9dcff00fb
Create Date: 2025-12-03
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "aa11bb22cc33"
down_revision: Union[str, Sequence[str], None] = "56a9dcff00fb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
  op.create_table(
      "installation_requests",
      sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
      sa.Column("home_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("technician_id", postgresql.UUID(as_uuid=True), nullable=True),
      sa.Column("kind", sa.String(length=32), nullable=False, server_default="install"),
      sa.Column("status", sa.String(length=32), nullable=False, server_default="submitted"),
      sa.Column("notes", sa.Text(), nullable=True),
      sa.Column(
          "created_at",
          sa.TIMESTAMP(timezone=True),
          server_default=sa.text("now()"),
          nullable=False,
      ),
      sa.Column(
          "updated_at",
          sa.TIMESTAMP(timezone=True),
          server_default=sa.text("now()"),
          nullable=False,
      ),
      sa.ForeignKeyConstraint(["home_id"], ["homes.id"], ondelete="CASCADE"),
      sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
      sa.ForeignKeyConstraint(["technician_id"], ["users.id"], ondelete="SET NULL"),
  )
  op.create_index(
      op.f("ix_installation_requests_home_id"),
      "installation_requests",
      ["home_id"],
      unique=False,
  )
  op.create_index(
      op.f("ix_installation_requests_owner_id"),
      "installation_requests",
      ["owner_id"],
      unique=False,
  )
  op.create_index(
      op.f("ix_installation_requests_technician_id"),
      "installation_requests",
      ["technician_id"],
      unique=False,
  )
  op.create_index(
      op.f("ix_installation_requests_status"),
      "installation_requests",
      ["status"],
      unique=False,
  )

  op.create_table(
      "installation_items",
      sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
      sa.Column("request_id", postgresql.UUID(as_uuid=True), nullable=False),
      sa.Column("room_id", postgresql.UUID(as_uuid=True), nullable=True),
      sa.Column("coverage_type", sa.Text(), nullable=False),
      sa.Column("desired_device_count", sa.Integer(), nullable=False, server_default="1"),
      sa.Column("proposed_device_type", sa.Text(), nullable=True),
      sa.Column("status", sa.String(length=32), nullable=False, server_default="pending"),
      sa.Column("notes", sa.Text(), nullable=True),
      sa.ForeignKeyConstraint(
          ["request_id"], ["installation_requests.id"], ondelete="CASCADE"
      ),
      sa.ForeignKeyConstraint(["room_id"], ["rooms.id"], ondelete="SET NULL"),
  )
  op.create_index(
      op.f("ix_installation_items_request_id"),
      "installation_items",
      ["request_id"],
      unique=False,
  )
  op.create_index(
      op.f("ix_installation_items_room_id"),
      "installation_items",
      ["room_id"],
      unique=False,
  )


def downgrade() -> None:
  op.drop_index(op.f("ix_installation_items_room_id"), table_name="installation_items")
  op.drop_index(
      op.f("ix_installation_items_request_id"), table_name="installation_items"
  )
  op.drop_table("installation_items")

  op.drop_index(
      op.f("ix_installation_requests_status"), table_name="installation_requests"
  )
  op.drop_index(
      op.f("ix_installation_requests_technician_id"),
      table_name="installation_requests",
  )
  op.drop_index(
      op.f("ix_installation_requests_owner_id"), table_name="installation_requests"
  )
  op.drop_index(
      op.f("ix_installation_requests_home_id"), table_name="installation_requests"
  )
  op.drop_table("installation_requests")


