# Task ID: (Inherited from ProjectManager)  # Agent Role: BuilderAgent  # Request ID: (Inherited from Overmind)  # Project: task-manager  # Timestamp: 2025-05-09T21:15:00Z  # Import all CRUD modules to make them available when importing the crud package  # This file primarily serves to make the crud submodules importable.  # Removed direct imports to break potential circular dependencies

__all__ = [
"projects",
"tasks",
"agents",
"project_members",
"task_dependencies",
"project_file_associations",
"task_file_associations",
"memory",
    "audit_logs",
    "comments",
    "rules",  # Expose rules
    "users",  # Expose users
    "workflows"
]  # This makes 'crud' a Python package
