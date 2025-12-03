"""extend installation_requests and installation_items with kind and desired_device_count

Revision ID: bb22cc44dd55
Revises: aa11bb22cc33
Create Date: 2025-12-03
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "bb22cc44dd55"
down_revision: Union[str, Sequence[str], None] = "aa11bb22cc33"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add kind column to installation_requests with default 'install'
    op.add_column(
        "installation_requests",
        sa.Column("kind", sa.String(length=32), nullable=False, server_default="install"),
    )

    # Ensure status has a sensible default for new rows
    op.alter_column(
        "installation_requests",
        "status",
        existing_type=sa.String(length=32),
        server_default="submitted",
        existing_nullable=False,
    )

    # Add desired_device_count to installation_items with default 1
    op.add_column(
        "installation_items",
        sa.Column(
            "desired_device_count",
            sa.Integer(),
            nullable=False,
            server_default="1",
        ),
    )

    # Ensure installation_items.status has a default of 'pending'
    op.alter_column(
        "installation_items",
        "status",
        existing_type=sa.String(length=32),
        server_default="pending",
        existing_nullable=False,
    )


def downgrade() -> None:
    # Revert changes made in upgrade()
    op.alter_column(
        "installation_items",
        "status",
        existing_type=sa.String(length=32),
        server_default=None,
        existing_nullable=False,
    )
    op.drop_column("installation_items", "desired_device_count")

    op.alter_column(
        "installation_requests",
        "status",
        existing_type=sa.String(length=32),
        server_default=None,
        existing_nullable=False,
    )
    op.drop_column("installation_requests", "kind")


