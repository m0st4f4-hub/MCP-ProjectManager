"""Create memory tables

Revision ID: 18269291e4f5
Revises: 7065736777f6
Create Date: 2025-05-24 11:16:58.730116

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '18269291e4f5'
down_revision: Union[str, None] = '7065736777f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'memory_entities',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('type', sa.String, index=True),
        sa.Column('name', sa.String, unique=True, index=True),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('metadata_', sa.Text, nullable=True), # Assuming metadata can be stored as text/JSON
    )

    op.create_table(
        'memory_observations',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('entity_id', sa.Integer, sa.ForeignKey('memory_entities.id')),
        sa.Column('content', sa.Text),
        sa.Column('source', sa.String, nullable=True),
        sa.Column('metadata_', sa.Text, nullable=True), # Assuming metadata can be stored as text/JSON
        sa.Column('timestamp', sa.DateTime),
    )

    op.create_table(
        'memory_relations',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('from_entity_id', sa.Integer, sa.ForeignKey('memory_entities.id')),
        sa.Column('to_entity_id', sa.Integer, sa.ForeignKey('memory_entities.id')),
        sa.Column('relation_type', sa.String, index=True),
        sa.Column('metadata_', sa.Text, nullable=True), # Assuming metadata can be stored as text/JSON
        sa.Column('created_at', sa.DateTime),
        sa.UniqueConstraint('from_entity_id', 'to_entity_id', 'relation_type', name='uq_from_to_relation'),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('memory_relations')
    op.drop_table('memory_observations')
    op.drop_table('memory_entities')
