"""Add wall customization fields

Revision ID: 3032e2553f87
Revises: add_wall_customization
Create Date: 2025-12-31 22:29:31.848248

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3032e2553f87'
down_revision = 'add_wall_customization'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Keep as VARCHAR (string) - we use native_enum=False in the model
    # No change needed - column is already VARCHAR from previous migration
    pass


def downgrade() -> None:
    # No change needed - column stays as VARCHAR
    pass

