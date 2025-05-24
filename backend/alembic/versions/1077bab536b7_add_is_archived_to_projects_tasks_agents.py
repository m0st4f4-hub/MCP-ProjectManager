"""add_is_archived_to_projects_tasks_agents

Revision ID: 1077bab536b7
Revises: refactor_tasks_to_project_task_number_composite_pk
Create Date: 2025-05-15 21:07:31.379093

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1077bab536b7'
down_revision: Union[str,
                     None] = 'refactor_tasks_to_project_task_number_composite_pk'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('projects', sa.Column('is_archived', sa.Boolean(),
                  nullable=False, server_default=sa.false()))
    op.add_column('tasks', sa.Column('is_archived', sa.Boolean(),
                  nullable=False, server_default=sa.false()))
    op.add_column('agents', sa.Column('is_archived', sa.Boolean(),
                  nullable=False, server_default=sa.false()))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('projects', 'is_archived')
    op.drop_column('tasks', 'is_archived')
    op.drop_column('agents', 'is_archived')
