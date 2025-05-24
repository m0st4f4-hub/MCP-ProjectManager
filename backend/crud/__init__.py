# Task ID: 211
# Agent Role: Agent 1
# Request ID: (Inherited from Overmind)
# Project: task-manager
# Timestamp: 2025-05-09T21:00:00Z

# Attempting to break circular import by explicitly importing necessary components
# from . import tasks # Removed
# from . import agents # Removed
# from . import projects # Removed
# from . import audit_logs # Removed
# from . import project_members # Removed
# from . import project_file_associations # Removed
# from . import task_file_associations # Removed
# from . import task_dependencies # Removed
# from . import rules # Added rules framework

# Explicitly importing only the functions actually present in projects.py
from .projects import (
    get_project,
    get_project_by_name,
    get_projects,
    create_project,
    update_project,
    delete_project
)

# Import rules framework functions
from .rules import (
    get_agent_role_by_name,
    get_agent_role_with_details,
    validate_task_against_agent_rules,
    generate_agent_prompt_from_rules,
    log_agent_behavior,
    log_rule_violation,
    get_universal_mandates
)

# Optionally expose models and schemas if they are part of the intended public interface
# from .. import models
# from .. import schemas

from . import tasks
from . import projects
from . import users
from . import project_members
from . import project_file_associations
from . import task_file_associations
from . import task_dependencies
# from . import audit_logs # Removing this import again
# from . import comments # Removing this import again due to circular dependency
