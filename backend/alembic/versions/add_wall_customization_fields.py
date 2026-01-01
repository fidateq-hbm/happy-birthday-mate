"""Add wall customization fields

Revision ID: add_wall_customization
Revises: 
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_wall_customization'
down_revision = None  # Update this with your latest revision
branch_labels = None
depends_on = None


def upgrade():
    # Add background_animation column
    op.add_column('birthday_walls', sa.Column('background_animation', sa.String(), nullable=True, server_default='celebration'))
    
    # Add background_color column
    op.add_column('birthday_walls', sa.Column('background_color', sa.String(), nullable=True, server_default='bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100'))
    
    # Add animation_intensity column
    op.add_column('birthday_walls', sa.Column('animation_intensity', sa.String(), nullable=True, server_default='medium'))


def downgrade():
    op.drop_column('birthday_walls', 'animation_intensity')
    op.drop_column('birthday_walls', 'background_color')
    op.drop_column('birthday_walls', 'background_animation')

