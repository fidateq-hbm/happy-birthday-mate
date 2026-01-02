"""add_contact_submissions_table

Revision ID: 0fe353c8c613
Revises: add_birthday_wall_archive
Create Date: 2026-01-02 03:51:08.220629

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0fe353c8c613'
down_revision = 'add_birthday_wall_archive'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'contact_submissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('subject', sa.String(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_contact_submissions_id'), 'contact_submissions', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_contact_submissions_id'), table_name='contact_submissions')
    op.drop_table('contact_submissions')

