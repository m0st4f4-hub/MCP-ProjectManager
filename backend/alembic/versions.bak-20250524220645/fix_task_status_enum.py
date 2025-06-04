"""fix_task_status_enum

Revision ID: 5e13ce8f9a49
Revises: e442d449ffba
Create Date: 2025-05-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite


# revision identifiers, used by Alembic.
revision = '5e13ce8f9a49'
down_revision = 'e442d449ffba'
branch_labels = None
depends_on = None


def upgrade():
    # This is a metadata-only change to fix the TaskStatusEnum handling
    # No schema changes are needed since we're just fixing the way the enum is handled
    pass


def downgrade():
    # No downgrade needed for this migration
    pass
