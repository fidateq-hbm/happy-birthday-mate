"""Add is_admin field to users table

Revision ID: afc169b2854e
Revises: 13dec9ebcb5e
Create Date: 2026-01-01 19:44:07.897578

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'afc169b2854e'
down_revision = '13dec9ebcb5e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_admin column to users table
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    # Remove is_admin column
    op.drop_column('users', 'is_admin')

