"""manual add type fields to memory models

Revision ID: 7065736777f6
Revises: 1077bab536b7
Create Date: 2025-05-23 19:48:35.335267

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7065736777f6'
down_revision: Union[str, None] = '1077bab536b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add 'type' column to memory_entities table
    op.add_column('memory_entities', sa.Column('type', sa.String(), nullable=True))
    # Create index on 'type' column
    op.create_index(op.f('ix_memory_entities_type'), 'memory_entities', ['type'], unique=False)

    # Add 'type' column to memory_relations table
    op.add_column('memory_relations', sa.Column('relation_type', sa.String(), nullable=True))
    # Create index on 'type' column
    op.create_index(op.f('ix_memory_relations_relation_type'), 'memory_relations', ['relation_type'], unique=False)

    # Rename 'created_at' column to 'timestamp' in memory_observations table
    op.alter_column('memory_observations', 'created_at', new_column_name='timestamp')


def downgrade() -> None:
    """Downgrade schema."""
    # Rename 'timestamp' column back to 'created_at' in memory_observations table
    op.alter_column('memory_observations', 'timestamp', new_column_name='created_at')

    # Drop index on 'type' column in memory_relations table
    op.drop_index(op.f('ix_memory_relations_relation_type'), table_name='memory_relations')
    # Drop 'type' column from memory_relations table
    op.drop_column('memory_relations', 'relation_type')

    # Drop index on 'type' column in memory_entities table
    op.drop_index(op.f('ix_memory_entities_type'), table_name='memory_entities')
    # Drop 'type' column from memory_entities table
    op.drop_column('memory_entities', 'type')
