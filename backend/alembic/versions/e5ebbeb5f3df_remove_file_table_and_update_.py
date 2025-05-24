"""Remove file table and update associations

Revision ID: e5ebbeb5f3df
Revises: 18269291e4f5
Create Date: 2025-05-24 11:36:17.025706

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e5ebbeb5f3df'
down_revision: Union[str, None] = '18269291e4f5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop existing file association tables and the files table
    op.drop_table('task_file_associations')
    op.drop_table('project_file_associations')
    op.drop_table('files')

    # Recreate project_file_associations table with file_memory_entity_name
    op.create_table(
        'project_file_associations',
        sa.Column('project_id', sa.String(32), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('file_memory_entity_name', sa.String, nullable=False, index=True), # Use file path as identifier
        sa.PrimaryKeyConstraint('project_id', 'file_memory_entity_name')
    )

    # Recreate task_file_associations table with file_memory_entity_name
    op.create_table(
        'task_file_associations',
        sa.Column('task_project_id', sa.String(32), nullable=False),
        sa.Column('task_task_number', sa.Integer, nullable=False),
        sa.Column('file_memory_entity_name', sa.String, nullable=False, index=True), # Use file path as identifier
        sa.ForeignKeyConstraint(
            ['task_project_id', 'task_task_number'],
            ['tasks.project_id', 'tasks.task_number']
        ),
        sa.PrimaryKeyConstraint('task_project_id', 'task_task_number', 'file_memory_entity_name')
    )


def downgrade() -> None:
    """Downgrade schema."""
    # This is a placeholder for a complex downgrade. Manual intervention may be required.
    # To properly downgrade, you would need to recreate the 'files' table and
    # alter 'project_file_associations' and 'task_file_associations' back,
    # potentially losing data if file_id cannot be reconstructed.
    print("Downgrade for this migration is complex and may require manual steps.")
    pass
