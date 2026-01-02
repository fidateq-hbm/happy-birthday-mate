"""Add birthday_year and frame_style fields

Revision ID: add_birthday_wall_archive
Revises: afc169b2854e
Create Date: 2026-01-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_birthday_wall_archive'
down_revision = 'afc169b2854e'
branch_labels = None
depends_on = None


def upgrade():
    # Add birthday_year to birthday_walls table
    op.add_column('birthday_walls', sa.Column('birthday_year', sa.Integer(), nullable=True))
    
    # Set birthday_year for existing walls based on opens_at date
    # opens_at is 24h before birthday, so birthday is opens_at + 1 day
    op.execute("""
        UPDATE birthday_walls 
        SET birthday_year = EXTRACT(YEAR FROM opens_at + INTERVAL '1 day')::INTEGER
        WHERE birthday_year IS NULL
    """)
    
    # Make birthday_year NOT NULL after setting values
    op.alter_column('birthday_walls', 'birthday_year', nullable=False)
    
    # Add frame_style to wall_photos table
    op.add_column('wall_photos', sa.Column('frame_style', sa.String(), nullable=True, server_default='none'))


def downgrade():
    op.drop_column('wall_photos', 'frame_style')
    op.drop_column('birthday_walls', 'birthday_year')

