"""add_status_and_remove_completed_from_tasks

Revision ID: b1a2c3d4e5f6
Revises: a30db8a4b419
Create Date: 2025-06-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b1a2c3d4e5f6'
down_revision: Union[str, None] = 'a30db8a4b419'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the 'completed' column from 'tasks' table
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.drop_column('completed')
        batch_op.add_column(sa.Column('status', sa.String(),
                            nullable=False, server_default='To Do'))


def downgrade() -> None:
    # Add the 'completed' column back to 'tasks' table
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('completed', sa.Boolean(), nullable=True, server_default=sa.false()))
        batch_op.drop_column('status')
