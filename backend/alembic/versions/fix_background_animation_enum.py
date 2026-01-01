"""Fix background_animation enum to use string instead of native enum

Revision ID: fix_bg_animation_enum
Revises: 3032e2553f87
Create Date: 2025-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'fix_bg_animation_enum'
down_revision = '3032e2553f87'  # Update with your latest revision
branch_labels = None
depends_on = None


def upgrade():
    # Drop the enum type if it exists
    op.execute("DROP TYPE IF EXISTS backgroundanimationenum CASCADE")
    
    # Change the column to VARCHAR (string) instead of enum
    op.alter_column('birthday_walls', 'background_animation',
                   existing_type=postgresql.ENUM('CELEBRATION', 'AUTUMN', 'SPRING', 'WINTER', 'OCEAN', 'GALAXY', 'CONFETTI', name='backgroundanimationenum'),
                   type_=sa.String(),
                   existing_nullable=True,
                   postgresql_using='background_animation::text')


def downgrade():
    # Recreate enum type
    op.execute("CREATE TYPE backgroundanimationenum AS ENUM ('CELEBRATION', 'AUTUMN', 'SPRING', 'WINTER', 'OCEAN', 'GALAXY', 'CONFETTI')")
    
    # Change back to enum
    op.alter_column('birthday_walls', 'background_animation',
                   existing_type=sa.String(),
                   type_=postgresql.ENUM('CELEBRATION', 'AUTUMN', 'SPRING', 'WINTER', 'OCEAN', 'GALAXY', 'CONFETTI', name='backgroundanimationenum'),
                   existing_nullable=True)

