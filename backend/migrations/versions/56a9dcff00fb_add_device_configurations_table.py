"""add_device_configurations_table

Revision ID: 56a9dcff00fb
Revises: 0020b5a0c8d4
Create Date: 2025-12-03 05:53:45.375970

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '56a9dcff00fb'
down_revision: Union[str, Sequence[str], None] = '0020b5a0c8d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "device_configurations",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("device_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("heartbeat_timeout_seconds", sa.Integer(), nullable=False, server_default="300"),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["device_id"], ["devices.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("device_id"),
    )
    op.create_index("ix_device_configurations_device_id", "device_configurations", ["device_id"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_device_configurations_device_id", table_name="device_configurations")
    op.drop_table("device_configurations")
