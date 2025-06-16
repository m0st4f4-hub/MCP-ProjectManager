"""Phase 1 Schema Enhancements - File Management, Agent Execution, MCP Integration

Revision ID: phase1_enhancements
Revises: 2025_06_01_add_task_indexes
Create Date: 2025-06-15 12:00:00.000000

This migration adds:
1. File asset management system with SHA-256 verification
2. Agent execution and workflow tracking
3. MCP tool integration and monitoring
4. Centralized enum management
5. Enhanced indexes for performance
6. Task status transition tracking
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = 'phase1_enhancements'
down_revision = '2025_06_01_add_task_indexes'
branch_labels = None
depends_on = None


def upgrade():
    """Add Phase 1 schema enhancements."""
    
    # ===== FILE ASSET MANAGEMENT =====
    
    # File Assets table
    op.create_table('file_assets',
        sa.Column('id', sa.String(32), primary_key=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('filename', sa.String(500), nullable=False),
        sa.Column('original_filename', sa.String(500), nullable=True),
        sa.Column('file_extension', sa.String(50), nullable=True, index=True),
        sa.Column('sha256_hash', sa.String(64), nullable=False, unique=True, index=True),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False),
        sa.Column('mime_type', sa.String(200), nullable=False, index=True),
        sa.Column('encoding', sa.String(50), nullable=True),
        sa.Column('storage_path', sa.String(1000), nullable=False),
        sa.Column('storage_bucket', sa.String(255), nullable=True),
        sa.Column('is_public', sa.Boolean(), default=False, nullable=False),
        sa.Column('is_available', sa.Boolean(), default=True, nullable=False),
        sa.Column('is_temp', sa.Boolean(), default=False, nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('content_preview', sa.Text(), nullable=True),
        sa.Column('file_metadata', sa.JSON(), nullable=True),
        sa.Column('extraction_metadata', sa.JSON(), nullable=True),
        sa.Column('version', sa.Integer(), default=1, nullable=False),
        sa.Column('parent_file_id', sa.String(32), nullable=True),
        sa.Column('access_count', sa.Integer(), default=0, nullable=False),
        sa.Column('last_accessed_at', sa.DateTime(), nullable=True),
    )
    
    # File asset indexes
    op.create_index('idx_file_assets_sha256', 'file_assets', ['sha256_hash'])
    op.create_index('idx_file_assets_filename', 'file_assets', ['filename'])
    op.create_index('idx_file_assets_mime_type', 'file_assets', ['mime_type'])
    op.create_index('idx_file_assets_storage_path', 'file_assets', ['storage_path'])
    
    # File Asset Tags
    op.create_table('file_asset_tags',
        sa.Column('id', sa.String(32), primary_key=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('tag_name', sa.String(100), nullable=False, index=True),
        sa.Column('tag_category', sa.String(50), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('color', sa.String(7), nullable=True),
    )
    
    op.create_index('idx_file_asset_tags_name', 'file_asset_tags', ['tag_name'])
    op.create_index('idx_file_asset_tags_category', 'file_asset_tags', ['tag_category'])
    
    # File Asset Tag Associations
    op.create_table('file_asset_tag_associations',
        sa.Column('file_asset_id', sa.String(32), nullable=False, primary_key=True),
        sa.Column('tag_id', sa.String(32), nullable=False, primary_key=True),
        sa.Column('confidence_score', sa.Integer(), default=100, nullable=False),
        sa.Column('auto_tagged', sa.Boolean(), default=False, nullable=False),
        sa.Column('tagged_at', sa.DateTime(), nullable=False),
    )
    
    op.create_index('idx_file_tag_associations_file', 'file_asset_tag_associations', ['file_asset_id'])
    op.create_index('idx_file_tag_associations_tag', 'file_asset_tag_associations', ['tag_id'])
    
    # File Processing Jobs
    op.create_table('file_processing_jobs',
        sa.Column('id', sa.String(32), primary_key=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('file_asset_id', sa.String(32), nullable=False, index=True),
        sa.Column('job_type', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), default='pending', nullable=False),
        sa.Column('job_parameters', sa.JSON(), nullable=True),
        sa.Column('job_result', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('processing_time_ms', sa.Integer(), nullable=True),
        sa.Column('priority', sa.Integer(), default=5, nullable=False),
        sa.Column('retry_count', sa.Integer(), default=0, nullable=False),
        sa.Column('max_retries', sa.Integer(), default=3, nullable=False),
    )
    
    op.create_index('idx_file_processing_status', 'file_processing_jobs', ['status'])
    op.create_index('idx_file_processing_file', 'file_processing_jobs', ['file_asset_id'])
    op.create_index('idx_file_processing_type', 'file_processing_jobs', ['job_type'])
    
    # ===== AGENT EXECUTION TRACKING =====
    
    # Task Workflow Executions
    op.create_table('task_workflow_executions',
        sa.Column('id', sa.String(32), primary_key=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('task_project_id', sa.String(36), nullable=False),
        sa.Column('task_task_number', sa.Integer(), nullable=False),
        sa.Column('workflow_id', sa.String(32), nullable=True),
        sa.Column('current_step_id', sa.String(32), nullable=True),
        sa.Column('current_agent_id', sa.String(32), nullable=True),
        sa.Column('status', sa.String(50), default='initialized', nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('last_activity_at', sa.DateTime(), nullable=False),
        sa.Column('steps_completed', sa.Integer(), default=0, nullable=False),
        sa.Column('steps_total', sa.Integer(), default=0, nullable=False),
        sa.Column('progress_percentage', sa.Numeric(5, 2), default=0.00, nullable=False),
        sa.Column('execution_context', sa.JSON(), nullable=True),
        sa.Column('error_details', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['workflow_id'], ['workflows.id']),
        sa.ForeignKeyConstraint(['current_step_id'], ['workflow_steps.id']),
        sa.ForeignKeyConstraint(['current_agent_id'], ['agents.id']),
    )
    
    op.create_index('idx_task_workflow_task', 'task_workflow_executions', ['task_project_id', 'task_task_number'])
    op.create_index('idx_task_workflow_status', 'task_workflow_executions', ['status'])
    op.create_index('idx_task_workflow_agent', 'task_workflow_executions', ['current_agent_id'])
    
    # Task Status Transitions
    op.create_table('task_status_transitions',
        sa.Column('id', sa.String(32), primary_key=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('task_project_id', sa.String(36), nullable=False),
        sa.Column('task_task_number', sa.Integer(), nullable=False),
        sa.Column('from_status', sa.String(50), nullable=True),
        sa.Column('to_status', sa.String(50), nullable=False),
        sa.Column('agent_id', sa.String(32), nullable=True),
        sa.Column('automated', sa.Boolean(), default=False, nullable=False),
        sa.Column('trigger_type', sa.String(50), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('transition_context', sa.JSON(), nullable=True),
        sa.Column('transitioned_at', sa.DateTime(), nullable=False),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('requires_approval', sa.Boolean(), default=False, nullable=False),
        sa.Column('approved_by_agent_id', sa.String(32), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id']),
        sa.ForeignKeyConstraint(['approved_by_agent_id'], ['agents.id']),
    )
    
    op.create_index('idx_task_status_task', 'task_status_transitions', ['task_project_id', 'task_task_number'])
    op.create_index('idx_task_status_agent', 'task_status_transitions', ['agent_id'])
    op.create_index('idx_task_status_from_to', 'task_status_transitions', ['from_status', 'to_status'])
    op.create_index('idx_task_status_timestamp', 'task_status_transitions', ['transitioned_at'])
    
    # Agent Handoff Events
    op.create_table('agent_handoff_events',
        sa.Column('id', sa.String(32), primary_key=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('task_project_id', sa.String(36), nullable=False),
        sa.Column('task_task_number', sa.Integer(), nullable=False),
        sa.Column('from_agent_id', sa.String(32), nullable=True),
        sa.Column('to_agent_id', sa.String(32), nullable=False),
        sa.Column('handoff_reason', sa.String(100), nullable=False),
        sa.Column('handoff_criteria_id', sa.String(32), nullable=True),
        sa.Column('handoff_context', sa.JSON(), nullable=True),
        sa.Column('progress_summary', sa.Text(), nullable=True),
        sa.Column('blockers_summary', sa.Text(), nullable=True),
        sa.Column('handoff_at', sa.DateTime(), nullable=False),
        sa.Column('accepted_at', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(20), default='pending', nullable=False),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['from_agent_id'], ['agents.id']),
        sa.ForeignKeyConstraint(['to_agent_id'], ['agents.id']),
        sa.ForeignKeyConstraint(['handoff_criteria_id'], ['agent_handoff_criteria.id']),
    )
    
    op.create_index('idx_agent_handoff_task', 'agent_handoff_events', ['task_project_id', 'task_task_number'])
    op.create_index('idx_agent_handoff_from_agent', 'agent_handoff_events', ['from_agent_id'])
    op.create_index('idx_agent_handoff_to_agent', 'agent_handoff_events', ['to_agent_id'])
    op.create_index('idx_agent_handoff_timestamp', 'agent_handoff_events', ['handoff_at'])
    
    # Agent Performance Metrics
    op.create_table('agent_performance_metrics',
        sa.Column('id', sa.String(32), primary_key=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('agent_id', sa.String(32), nullable=False),
        sa.Column('metric_type', sa.String(50), nullable=False),
        sa.Column('metric_value', sa.Numeric(15, 4), nullable=False),
        sa.Column('metric_unit', sa.String(20), nullable=True),
        sa.Column('metric_period_start', sa.DateTime(), nullable=False),
        sa.Column('metric_period_end', sa.DateTime(), nullable=False),
        sa.Column('task_count', sa.Integer(), default=0, nullable=False),
        sa.Column('context_filters', sa.JSON(), nullable=True),
        sa.Column('baseline_value', sa.Numeric(15, 4), nullable=True),
        sa.Column('performance_rating', sa.String(20), nullable=True),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id']),
    )
    
    op.create_index('idx_agent_performance_agent', 'agent_performance_metrics', ['agent_id'])
    op.create_index('idx_agent_performance_period', 'agent_performance_metrics', ['metric_period_start', 'metric_period_end'])
    op.create_index('idx_agent_performance_type', 'agent_performance_metrics', ['metric_type'])
    
    # ===== MCP TOOL INTEGRATION =====
    
    # MCP Tools
    op.create_table('mcp_tools',
        sa.Column('id', sa.String(32), primary_key=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('name', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('display_name', sa.String(500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('version', sa.String(50), nullable=True),
        sa.Column('category', sa.String(100), nullable=True, index=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('input_schema', sa.JSON(), nullable=True),
        sa.Column('output_schema', sa.JSON(), nullable=True),
        sa.Column('tool_capabilities', sa.JSON(), nullable=True),
        sa.Column('timeout_seconds', sa.Integer(), default=30, nullable=False),
        sa.Column('max_retries', sa.Integer(), default=3, nullable=False),
        sa.Column('rate_limit_per_minute', sa.Integer(), default=60, nullable=False),
        sa.Column('requires_agent_role', sa.String(100), nullable=True),
        sa.Column('allowed_agent_ids', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('is_deprecated', sa.Boolean(), default=False, nullable=False),
        sa.Column('deprecation_message', sa.Text(), nullable=True),
        sa.Column('usage_examples', sa.JSON(), nullable=True),
        sa.Column('error_codes', sa.JSON(), nullable=True),
    )
    
    op.create_index('idx_mcp_tools_name', 'mcp_tools', ['name'])
    op.create_index('idx_mcp_tools_category', 'mcp_tools', ['category'])
    op.create_index('idx_mcp_tools_active', 'mcp_tools', ['is_active'])
    
    # MCP Tool Executions
    op.create_table('mcp_tool_executions',
        sa.Column('id', sa.String(32), primary_key=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('tool_name', sa.String(255), nullable=False),
        sa.Column('agent_id', sa.String(32), nullable=True),
        sa.Column('task_project_id', sa.String(36), nullable=True),
        sa.Column('task_task_number', sa.Integer(), nullable=True),
        sa.Column('execution_id', sa.String(64), nullable=False, unique=True, index=True),
        sa.Column('session_id', sa.String(64), nullable=True),
        sa.Column('input_parameters', sa.JSON(), nullable=True),
        sa.Column('output_result', sa.JSON(), nullable=True),
        sa.Column('output_size_bytes', sa.Integer(), nullable=True),
        sa.Column('execution_status', sa.String(20), nullable=False),
        sa.Column('execution_time_ms', sa.Integer(), nullable=False),
        sa.Column('memory_usage_mb', sa.Numeric(10, 2), nullable=True),
        sa.Column('error_type', sa.String(100), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('error_stack_trace', sa.Text(), nullable=True),
        sa.Column('retry_count', sa.Integer(), default=0, nullable=False),
        sa.Column('executed_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('execution_context', sa.JSON(), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('output_confidence', sa.Numeric(5, 2), nullable=True),
        sa.Column('user_feedback_rating', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['tool_name'], ['mcp_tools.name']),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id']),
    )
    
    op.create_index('idx_mcp_execution_tool', 'mcp_tool_executions', ['tool_name'])
    op.create_index('idx_mcp_execution_agent', 'mcp_tool_executions', ['agent_id'])
    op.create_index('idx_mcp_execution_task', 'mcp_tool_executions', ['task_project_id', 'task_task_number'])
    op.create_index('idx_mcp_execution_status', 'mcp_tool_executions', ['execution_status'])
    op.create_index('idx_mcp_execution_timestamp', 'mcp_tool_executions', ['executed_at'])
    op.create_index('idx_mcp_execution_duration', 'mcp_tool_executions', ['execution_time_ms'])
    
    # ===== CENTRALIZED ENUM MANAGEMENT =====
    
    # Enum Registry
    op.create_table('enum_registry',
        sa.Column('id', sa.String(32), primary_key=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('enum_name', sa.String(100), unique=True, nullable=False, index=True),
        sa.Column('display_name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(50), nullable=True, index=True),
        sa.Column('is_system_enum', sa.Boolean(), default=True, nullable=False),
        sa.Column('is_extensible', sa.Boolean(), default=False, nullable=False),
        sa.Column('supports_custom_ordering', sa.Boolean(), default=True, nullable=False),
        sa.Column('value_pattern', sa.String(500), nullable=True),
        sa.Column('min_values', sa.Integer(), default=1, nullable=False),
        sa.Column('max_values', sa.Integer(), nullable=True),
        sa.Column('enum_metadata', sa.JSON(), nullable=True),
    )
    
    op.create_index('idx_enum_registry_name', 'enum_registry', ['enum_name'])
    op.create_index('idx_enum_registry_category', 'enum_registry', ['category'])
    
    # Enum Values
    op.create_table('enum_values',
        sa.Column('id', sa.String(32), primary_key=True, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('enum_registry_id', sa.String(32), nullable=False, index=True),
        sa.Column('value', sa.String(100), nullable=False, index=True),
        sa.Column('display_name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('sort_order', sa.Integer(), default=0, nullable=False),
        sa.Column('parent_value_id', sa.String(32), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('is_default', sa.Boolean(), default=False, nullable=False),
        sa.Column('is_deprecated', sa.Boolean(), default=False, nullable=False),
        sa.Column('deprecation_message', sa.Text(), nullable=True),
        sa.Column('color_hex', sa.String(7), nullable=True),
        sa.Column('icon_name', sa.String(100), nullable=True),
        sa.Column('css_class', sa.String(100), nullable=True),
        sa.Column('transition_rules', sa.JSON(), nullable=True),
        sa.Column('permissions_required', sa.JSON(), nullable=True),
        sa.Column('automation_triggers', sa.JSON(), nullable=True),
        sa.Column('value_metadata', sa.JSON(), nullable=True),
    )
    
    op.create_index('idx_enum_values_enum', 'enum_values', ['enum_registry_id'])
    op.create_index('idx_enum_values_value', 'enum_values', ['value'])
    op.create_index('idx_enum_values_order', 'enum_values', ['sort_order'])
    op.create_index('idx_enum_values_active', 'enum_values', ['is_active'])
    
    # ===== ENHANCED INDEXES =====
    
    # Add missing memory entity indexes
    try:
        op.create_index('idx_memory_entities_type_name', 'memory_entities', ['entity_type', 'name'])
        op.create_index('idx_memory_entities_name_search', 'memory_entities', ['name'])
    except Exception:
        # Indexes might already exist
        pass
    
    # Add missing audit log indexes  
    try:
        op.create_index('idx_audit_logs_entity_lookup', 'audit_logs', ['entity_type', 'entity_id'])
        op.create_index('idx_audit_logs_action_timestamp', 'audit_logs', ['action', 'timestamp'])
        op.create_index('idx_audit_logs_timestamp', 'audit_logs', ['timestamp'])
    except Exception:
        # Indexes might already exist
        pass


def downgrade():
    """Remove Phase 1 schema enhancements."""
    
    # Drop all new tables in reverse order
    op.drop_table('enum_values')
    op.drop_table('enum_registry')
    op.drop_table('mcp_tool_executions')
    op.drop_table('mcp_tools')
    op.drop_table('agent_performance_metrics')
    op.drop_table('agent_handoff_events')
    op.drop_table('task_status_transitions')
    op.drop_table('task_workflow_executions')
    op.drop_table('file_processing_jobs')
    op.drop_table('file_asset_tag_associations')
    op.drop_table('file_asset_tags')
    op.drop_table('file_assets')
    
    # Drop new indexes (if they exist)
    try:
        op.drop_index('idx_memory_entities_type_name', 'memory_entities')
        op.drop_index('idx_memory_entities_name_search', 'memory_entities')
        op.drop_index('idx_audit_logs_entity_lookup', 'audit_logs')
        op.drop_index('idx_audit_logs_action_timestamp', 'audit_logs')
        op.drop_index('idx_audit_logs_timestamp', 'audit_logs')
    except Exception:
        # Indexes might not exist
        pass