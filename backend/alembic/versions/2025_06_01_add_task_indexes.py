"""add task indexes

Revision ID: 2b4c12345678
Revises: 1a91d100a11
Create Date: 2025-06-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = '2b4c12345678'
down_revision = '1a91d100a11'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index('ix_tasks_created_at', 'tasks', ['created_at'], unique=False)
    op.create_index('ix_tasks_agent_id', 'tasks', ['agent_id'], unique=False)
    op.create_index('ix_tasks_project_id', 'tasks', ['project_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_tasks_project_id', table_name='tasks')
    op.drop_index('ix_tasks_agent_id', table_name='tasks')
    op.drop_index('ix_tasks_created_at', table_name='tasks')
