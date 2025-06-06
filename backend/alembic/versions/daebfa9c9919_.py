"""empty message

Revision ID: daebfa9c9919
Revises: 
Create Date: 2025-05-27 18:10:11.264960

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'daebfa9c9919'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('device', sa.Column('position', sa.String(length=127), nullable=True))
    op.add_column('device', sa.Column('previous_maintenance_date', sa.DateTime(), nullable=True))
    op.add_column('device', sa.Column('next_maintenance_date', sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('device', 'next_maintenance_date')
    op.drop_column('device', 'previous_maintenance_date')
    op.drop_column('device', 'position')
    # ### end Alembic commands ###
