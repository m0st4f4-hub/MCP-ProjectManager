"""initial_schema

Revision ID: 1a91d100a11
Revises: None
Create Date: 2025-05-24 22:07:18.000000

"""

from alembic import op
import sqlalchemy as sa
revision = '1a91d100a11'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade schema."""  # Create enum types  # TaskStatusEnum
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('disabled', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    op.create_table(
        'agents',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agents_id'), 'agents', ['id'], unique=False)
    op.create_index(op.f('ix_agents_name'), 'agents', ['name'], unique=True)
    op.create_table(
        'agent_roles',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('display_name', sa.String(length=255), nullable=False),
        sa.Column('primary_purpose', sa.Text(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agent_roles_name'), 'agent_roles', ['name'], unique=True)

    op.create_table(
        'agent_capabilities',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('agent_role_id', sa.String(length=32), nullable=False),
        sa.Column('capability', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['agent_role_id'], ['agent_roles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'agent_forbidden_actions',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('agent_role_id', sa.String(length=32), nullable=False),
        sa.Column('action', sa.String(length=255), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['agent_role_id'], ['agent_roles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'agent_verification_requirements',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('agent_role_id', sa.String(length=32), nullable=False),
        sa.Column('requirement', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_mandatory', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['agent_role_id'], ['agent_roles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'agent_handoff_criteria',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('agent_role_id', sa.String(length=32), nullable=False),
        sa.Column('criteria', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('target_agent_role', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['agent_role_id'], ['agent_roles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'agent_error_protocols',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('agent_role_id', sa.String(length=32), nullable=False),
        sa.Column('error_type', sa.String(length=100), nullable=False),
        sa.Column('protocol', sa.Text(), nullable=False),
        sa.Column('priority', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['agent_role_id'], ['agent_roles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'workflows',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('workflow_type', sa.String(length=100), nullable=False),
        sa.Column('entry_criteria', sa.Text(), nullable=True),
        sa.Column('success_criteria', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workflows_id'), 'workflows', ['id'], unique=False)

    op.create_table(
        'workflow_steps',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('workflow_id', sa.String(length=32), nullable=False),
        sa.Column('agent_role_id', sa.String(length=32), nullable=False),
        sa.Column('step_order', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('prerequisites', sa.Text(), nullable=True),
        sa.Column('expected_outputs', sa.Text(), nullable=True),
        sa.Column('verification_points', sa.Text(), nullable=True),
        sa.Column('estimated_duration_minutes', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['agent_role_id'], ['agent_roles.id'], ),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'projects',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        # Add other columns as needed
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)
    op.create_index(op.f('ix_projects_name'), 'projects', ['name'], unique=True)

    op.create_table(
        'project_members',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('project_id', sa.String(length=32), nullable=False),
        sa.Column('user_id', sa.String(length=32), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'user_id', name='uq_project_user')
    )

    op.create_table(
        'task_statuses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('order', sa.Integer(), nullable=False),
        sa.Column('is_final', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_task_statuses_id'), 'task_statuses', ['id'], unique=False)
    op.create_index(op.f('ix_task_statuses_name'),
                    'task_statuses', ['name'], unique=True)
    op.create_index(op.f('ix_task_statuses_order'), 'task_statuses', [
                    'order'], unique=True)  # Create TaskStatusEnum for SQLite
    task_status_enum = sa.Enum(
        'TO_DO',
        'IN_PROGRESS',
        'COMPLETED',
        'BLOCKED',
        'CANCELLED',
        name='taskstatusenum',
    )
    task_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        'tasks',
        sa.Column('project_id', sa.String(length=32), nullable=False),
        sa.Column('task_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('agent_id', sa.String(length=32), nullable=True),
        sa.Column('status', task_status_enum, nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('project_id', 'task_number', name='pk_tasks')
    )
    op.create_index(op.f('ix_tasks_title'), 'tasks', ['title'], unique=False)
    op.create_table(
        'comments',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('task_project_id', sa.String(length=32), nullable=True),
        sa.Column('task_task_number', sa.Integer(), nullable=True),
        sa.Column('project_id', sa.String(length=32), nullable=True),
        sa.Column('author_id', sa.String(length=32), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['task_project_id', 'task_task_number'], [
                                'tasks.project_id', 'tasks.task_number'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_comments_id'), 'comments', ['id'], unique=False)

    op.create_table(
        'memory_entities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('entity_type', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('entity_metadata', sa.JSON(), nullable=True),
        sa.Column('source', sa.String(), nullable=True),
        sa.Column('source_metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('created_by_user_id', sa.String(length=32), nullable=True),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_memory_entities_entity_type'),
                    'memory_entities', ['entity_type'], unique=False)
    op.create_index(op.f('ix_memory_entities_id'),
                    'memory_entities', ['id'], unique=False)
    op.create_table(
        'memory_observations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('source', sa.String(), nullable=True),
        sa.Column('metadata_', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['entity_id'], ['memory_entities.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_memory_observations_id'),
                    'memory_observations', ['id'], unique=False)

    op.create_table(
        'memory_relations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('from_entity_id', sa.Integer(), nullable=False),
        sa.Column('to_entity_id', sa.Integer(), nullable=False),
        sa.Column('relation_type', sa.String(), nullable=False),
        sa.Column('metadata_', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['from_entity_id'], ['memory_entities.id'], ),
        sa.ForeignKeyConstraint(['to_entity_id'], ['memory_entities.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('from_entity_id', 'to_entity_id',
                            'relation_type', name='uq_from_to_relation')
    )
    op.create_index(op.f('ix_memory_relations_id'),
                    'memory_relations', ['id'], unique=False)
    op.create_index(op.f('ix_memory_relations_relation_type'),
                    'memory_relations', ['relation_type'], unique=False)
    op.create_table(
        'project_file_associations',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('project_id', sa.String(length=32), nullable=False),
        sa.Column('file_memory_entity_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['file_memory_entity_id'], ['memory_entities.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        op.f('ix_project_file_associations_file_memory_entity_id'),
        'project_file_associations',
        ['file_memory_entity_id'],
        unique=False,
    )

    op.create_table(
        'task_dependencies',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('predecessor_project_id', sa.String(length=32), nullable=False),
        sa.Column('predecessor_task_number', sa.Integer(), nullable=False),
        sa.Column('successor_project_id', sa.String(length=32), nullable=False),
        sa.Column('successor_task_number', sa.Integer(), nullable=False),
        sa.Column('dependency_type', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['predecessor_project_id', 'predecessor_task_number'], [
                                'tasks.project_id', 'tasks.task_number'], ),
        sa.ForeignKeyConstraint(['successor_project_id', 'successor_task_number'], [
                                'tasks.project_id', 'tasks.task_number'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'task_file_associations',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('task_project_id', sa.String(length=32), nullable=False),
        sa.Column('task_task_number', sa.Integer(), nullable=False),
        sa.Column('file_memory_entity_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['file_memory_entity_id'], ['memory_entities.id'], ),
        sa.ForeignKeyConstraint(['task_project_id', 'task_task_number'], [
                                'tasks.project_id', 'tasks.task_number'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'agent_rules',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('agent_id', sa.String(length=32), nullable=False),
        sa.Column('rule_type', sa.String(), nullable=False),
        sa.Column('rule_content', sa.Text(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('user_id', sa.String(length=32), nullable=True),
        sa.Column('action_type', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'], unique=False)

    op.create_table(
        'agent_behavior_logs',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('agent_name', sa.String(length=100), nullable=False),
        sa.Column('agent_role_id', sa.String(length=32), nullable=True),
        sa.Column('action_type', sa.String(length=100), nullable=False),
        sa.Column('action_description', sa.Text(), nullable=True),
        sa.Column('task_project_id', sa.String(length=32), nullable=True),
        sa.Column('task_task_number', sa.Integer(), nullable=True),
        sa.Column('success', sa.Boolean(), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('action_data', sa.Text(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['agent_role_id'], ['agent_roles.id'], ),
        sa.ForeignKeyConstraint(['task_project_id', 'task_task_number'], [
                                'tasks.project_id', 'tasks.task_number'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agent_behavior_logs_agent_name'),
                    'agent_behavior_logs', ['agent_name'], unique=False)
    op.create_index(op.f('ix_agent_behavior_logs_id'),
                    'agent_behavior_logs', ['id'], unique=False)
    op.create_table(
        'agent_rule_violations',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('agent_name', sa.String(length=100), nullable=False),
        sa.Column('agent_role_id', sa.String(length=32), nullable=True),
        sa.Column('violation_type', sa.String(length=100), nullable=False),
        sa.Column('violated_rule_category', sa.String(length=100), nullable=False),
        sa.Column('violated_rule_identifier', sa.Text(), nullable=False),
        sa.Column('violation_description', sa.Text(), nullable=False),
        sa.Column('severity', sa.String(length=50), nullable=False),
        sa.Column('context_data', sa.Text(), nullable=True),
        sa.Column('resolved', sa.Boolean(), nullable=False),
        sa.Column('resolution_notes', sa.Text(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.Column('task_project_id', sa.String(length=32), nullable=True),
        sa.Column('task_task_number', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['agent_role_id'], ['agent_roles.id'], ),
        sa.ForeignKeyConstraint(['task_project_id', 'task_task_number'], [
                                'tasks.project_id', 'tasks.task_number'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agent_rule_violations_agent_name'),
                    'agent_rule_violations', ['agent_name'], unique=False)
    op.create_index(op.f('ix_agent_rule_violations_id'),
                    'agent_rule_violations', ['id'], unique=False)
    op.create_table(
        'universal_mandates',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('priority', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(
        op.f('ix_universal_mandates_id'),
        'universal_mandates',
        ['id'],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables in reverse order of creation (respecting foreign key constraints)
    op.drop_index(op.f('ix_universal_mandates_id'), table_name='universal_mandates')
    op.drop_table('universal_mandates')

    op.drop_index(op.f('ix_agent_rule_violations_id'),
                  table_name='agent_rule_violations')
    op.drop_index(op.f('ix_agent_rule_violations_agent_name'),
                  table_name='agent_rule_violations')
    op.drop_table('agent_rule_violations')

    op.drop_index(op.f('ix_agent_behavior_logs_id'), table_name='agent_behavior_logs')
    op.drop_index(op.f('ix_agent_behavior_logs_agent_name'),
                  table_name='agent_behavior_logs')
    op.drop_table('agent_behavior_logs')

    op.drop_index(op.f('ix_audit_logs_id'), table_name='audit_logs')
    op.drop_table('audit_logs')

    op.drop_table('agent_rules')
    op.drop_table('task_file_associations')
    op.drop_table('task_dependencies')
    op.drop_index(op.f('ix_project_file_associations_file_memory_entity_id'),
                  table_name='project_file_associations')
    op.drop_table('project_file_associations')
    op.drop_index(op.f('ix_memory_relations_relation_type'),
                  table_name='memory_relations')
    op.drop_index(op.f('ix_memory_relations_id'), table_name='memory_relations')
    op.drop_table('memory_relations')

    op.drop_index(op.f('ix_memory_observations_id'), table_name='memory_observations')
    op.drop_table('memory_observations')

    op.drop_index(op.f('ix_memory_entities_id'), table_name='memory_entities')
    op.drop_index(op.f('ix_memory_entities_entity_type'), table_name='memory_entities')
    op.drop_table('memory_entities')

    op.drop_index(op.f('ix_comments_id'), table_name='comments')
    op.drop_table('comments')

    op.drop_index(op.f('ix_tasks_title'), table_name='tasks')
    op.drop_table('tasks')  # Drop the TaskStatusEnum type
    sa.Enum(name='taskstatusenum').drop(op.get_bind(), checkfirst=True)

    op.drop_index(op.f('ix_task_statuses_order'), table_name='task_statuses')
    op.drop_index(op.f('ix_task_statuses_name'), table_name='task_statuses')
    op.drop_index(op.f('ix_task_statuses_id'), table_name='task_statuses')
    op.drop_table('task_statuses')

    op.drop_table('project_members')

    op.drop_index(op.f('ix_projects_name'), table_name='projects')
    op.drop_index(op.f('ix_projects_id'), table_name='projects')
    op.drop_table('projects')

    op.drop_index(op.f('ix_project_templates_name'), table_name='project_templates')
    op.drop_index(op.f('ix_project_templates_id'), table_name='project_templates')
    op.drop_table('project_templates')

    op.drop_table('agent_prompt_templates')
    op.drop_table('workflow_steps')
    op.drop_table('workflows')
    op.drop_table('agent_error_protocols')
    op.drop_table('agent_handoff_criteria')
    op.drop_table('agent_verification_requirements')
    op.drop_table('agent_forbidden_actions')
    op.drop_table('agent_capabilities')

    op.drop_index(op.f('ix_agent_roles_name'), table_name='agent_roles')
    op.drop_table('agent_roles')

    op.drop_index(op.f('ix_agents_name'), table_name='agents')
    op.drop_index(op.f('ix_agents_id'), table_name='agents')
    op.drop_table('agents')

    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
