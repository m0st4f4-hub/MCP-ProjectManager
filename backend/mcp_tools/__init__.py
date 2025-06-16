"""MCP Tools package initialization."""

# Import all tool functions from their respective modules
from .memory_tools import (
    add_memory_entity_tool,
    add_memory_relation_tool,
    search_memory_tool,
    search_graph_tool,
    get_memory_content_tool,
    get_memory_metadata_tool,
)
from .project_tools import (
    create_project_tool,
    list_projects_tool,
    get_project_tool,
)
from .task_tools import (
    create_task_tool,
    list_tasks_tool,
)
from .capability_tools import (
    create_capability_tool,
    list_capabilities_tool,
    delete_capability_tool,
)
from .project_file_tools import (
    add_project_file_tool,
    list_project_files_tool,
    remove_project_file_tool,
)
from .forbidden_action_tools import (
    create_forbidden_action_tool,
    list_forbidden_actions_tool,
)
from .agent_handoff_tools import (
    create_handoff_criteria_tool,
    list_handoff_criteria_tool,
    delete_handoff_criteria_tool,
)
from .project_template_tools import (
    create_project_template_tool,
    list_project_templates_tool,
    delete_project_template_tool,
)
from .error_protocol_tools import (
    add_error_protocol_tool,
    list_error_protocols_tool,
    remove_error_protocol_tool,
)
from .verification_requirement_tools import (
    create_verification_requirement_tool,
    list_verification_requirements_tool,
    delete_verification_requirement_tool,
)
from .template_tools import (
    create_template_tool,
    list_templates_tool,
    delete_template_tool,
)
from .mandate_tools import (
    create_mandate_tool,
    list_mandates_tool,
    delete_mandate_tool,
)
from .workflow_tools import (
    create_workflow_tool,
    list_workflows_tool,
    delete_workflow_tool,
)
from .rule_tools import (
    create_universal_mandate_tool,
    create_agent_rule_tool,
)

__all__ = [
    # Memory tools
    'add_memory_entity_tool',
    'add_memory_relation_tool',
    'search_memory_tool',
    'search_graph_tool',
    'get_memory_content_tool',
    'get_memory_metadata_tool',
    # Project tools
    'create_project_tool',
    'list_projects_tool',
    'get_project_tool',
    # Task tools
    'create_task_tool',
    'list_tasks_tool',
    # Capability tools
    'create_capability_tool',
    'list_capabilities_tool',
    'delete_capability_tool',
    # Project file tools
    'add_project_file_tool',
    'list_project_files_tool',
    'remove_project_file_tool',
    # Forbidden action tools
    'create_forbidden_action_tool',
    'list_forbidden_actions_tool',
    # Agent handoff tools
    'create_handoff_criteria_tool',
    'list_handoff_criteria_tool',
    'delete_handoff_criteria_tool',
    # Project template tools
    'create_project_template_tool',
    'list_project_templates_tool',
    'delete_project_template_tool',
    # Error protocol tools
    'add_error_protocol_tool',
    'list_error_protocols_tool',
    'remove_error_protocol_tool',
    # Verification requirement tools
    'create_verification_requirement_tool',
    'list_verification_requirements_tool',
    'delete_verification_requirement_tool',
    # Template tools
    'create_template_tool',
    'list_templates_tool',
    'delete_template_tool',
    # Mandate tools
    'create_mandate_tool',
    'list_mandates_tool',
    'delete_mandate_tool',
    # Workflow tools
    'create_workflow_tool',
    'list_workflows_tool',
    'delete_workflow_tool',
    # Rule tools
    'create_universal_mandate_tool',
    'create_agent_rule_tool',
]
