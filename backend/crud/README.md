# Backend CRUD Operations (`backend/crud`)

This directory contains the Create, Read, Update, and Delete (CRUD) functions for interacting with the database models in the MCP Project Manager Suite backend. These functions provide a low-level interface for data manipulation, typically used by the service layer.

Key CRUD and validation files include:

*   `tasks.py`: CRUD operations for tasks, including archiving and unarchiving logic.
*   `projects.py`: CRUD operations for projects.
*   `memory.py`: CRUD operations for Memory entities (Knowledge Graph).
*   `task_dependencies.py`: CRUD operations for task dependencies.
*   `task_file_associations.py`: CRUD operations for task file associations.
*   `users.py`: CRUD operations for users.
*   `agents.py`: CRUD operations for AI agents.
*   `rules.py`: CRUD operations for agent rules.
*   `audit_logs.py`: CRUD operations for audit logs.
*   `comments.py`: CRUD operations for comments.
*   `project_members.py`: CRUD operations for project members.
*   `project_templates.py`: CRUD operations for project templates.
*   `project_file_associations.py`: CRUD operations for project file associations.
*   `task_validation.py`, `task_dependency_validation.py`, `task_file_association_validation.py`, `project_validation.py`, `project_member_validation.py`, `comment_validation.py`, `agent_validation.py`, `project_file_association_validation.py`, `user_validation.py`: Files containing validation logic used by CRUD functions. 