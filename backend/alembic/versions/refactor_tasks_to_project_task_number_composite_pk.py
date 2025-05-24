"""refactor_tasks_to_project_task_number_composite_pk

Revision ID: refactor_tasks_to_project_task_number_composite_pk
Revises: b1a2c3d4e5f6
Create Date: 2025-05-10 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import Integer, String

# revision identifiers, used by Alembic.
revision = 'refactor_tasks_to_project_task_number_composite_pk'
down_revision = 'b1a2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Add 'task_number' column (nullable for now)
    op.add_column('tasks', sa.Column(
        'task_number', sa.Integer(), nullable=True))

    # 2. Assign sequential task_number per project
    conn = op.get_bind()
    tasks_table = sa.table('tasks',
                           sa.column('id', String),
                           sa.column('project_id', String),
                           sa.column('task_number', Integer)
                           )
    # Get all project_ids
    project_ids = [row[0] for row in conn.execute(
        sa.text('SELECT DISTINCT project_id FROM tasks')).fetchall()]
    for project_id in project_ids:
        rows = conn.execute(sa.text('SELECT id FROM tasks WHERE project_id = :pid ORDER BY created_at'), {
                            'pid': project_id}).fetchall()
        for idx, row in enumerate(rows, 1):
            conn.execute(sa.text('UPDATE tasks SET task_number = :tn WHERE id = :tid'), {
                         'tn': idx, 'tid': row[0]})

    # 3. Make 'task_number' non-nullable
    op.alter_column('tasks', 'task_number', nullable=False)

    # 4. Drop old PK and set new composite PK
    op.drop_constraint('pk_tasks', 'tasks', type_='primary')
    op.create_primary_key('pk_tasks', 'tasks', ['project_id', 'task_number'])

    # 5. Drop 'id' column
    op.drop_column('tasks', 'id')

    # 6. Remove any subtask/parent_task_id columns if present
    with op.batch_alter_table('tasks') as batch_op:
        if 'parent_task_id' in [c['name'] for c in batch_op.get_columns()]:
            batch_op.drop_column('parent_task_id')

    # 7. Drop any unique constraints or indexes on the old 'id' field
    # (Handled by drop_column above)


def downgrade():
    # 1. Add 'id' column back (as String, nullable for now)
    op.add_column('tasks', sa.Column(
        'id', sa.String(length=32), nullable=True))

    # 2. Populate 'id' with a generated value (not possible in pure SQL, so leave as NULL)
    # 3. Drop composite PK and restore 'id' as PK
    op.drop_constraint('pk_tasks', 'tasks', type_='primary')
    op.create_primary_key('pk_tasks', 'tasks', ['id'])

    # 4. Drop 'task_number' column
    op.drop_column('tasks', 'task_number')

    # 5. (Optional) Add back 'parent_task_id' if needed
    # op.add_column('tasks', sa.Column('parent_task_id', sa.String(length=32), nullable=True))
