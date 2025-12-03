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
    pass


def downgrade() -> None:


