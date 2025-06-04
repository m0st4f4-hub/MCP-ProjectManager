# API Routers (`backend/routers`)

This directory contains the FastAPI routers that define the API endpoints for the MCP Project Manager Suite backend. The endpoints are organized into modular files within subdirectories for better organization and maintainability.

## Router Subdirectories:

*   `agents/`: Contains endpoints related to AI agents.
*   `audit_logs/`: Contains endpoints for managing audit log entries.
*   `comments/`: Contains endpoints for managing comments.
*   `mcp/`: Contains endpoints for MCP (Multi-Agent Computation Platform) core tools and integrations.
*   `memory/`: Contains endpoints for the Memory Service / Knowledge Graph, including core entity operations, observations, and relations.
    *   `core/`: Core memory entity operations.
    *   `observations/`: Memory observation endpoints.
    *   `relations/`: Memory relation endpoints.
*   `project_templates/`: Contains endpoints for managing project templates.
*   `projects/`: Contains endpoints for project management.
    *   `core/`: Core project operations (create, retrieve, update, delete, list, archive, unarchive).
    *   `files/`: Endpoints for associating files with projects.
    *   `members/`: Endpoints for managing project members.
    *   `planning/`: Endpoints related to project planning (e.g., generating planning prompts).
*   `rules/`: Contains endpoints for the Rules Framework.
    *   `logs/`: Agent behavior logs.
    *   `mandates/`: Universal mandates.
    *   `roles/`: Agent roles.
    *   `roles/capabilities/`: Agent capabilities.
    *   `roles/forbidden_actions/`: Agent forbidden actions.
    *   `templates/`: Prompt templates.
    *   `utils/`: Utility endpoints (e.g., rule validation, prompt generation).
    *   `violations/`: Rule violations.
    *   `workflows/`: Workflows.
*   `tasks/`: Contains endpoints for task management.
    *   `all_tasks/`: System-wide task listing.
    *   `comments/`: Task comments.
    *   `core/`: Core task operations.
    *   `dependencies/`: Task dependencies.
    *   `files/`: Task file associations.
*   `users/`: Contains endpoints for user management.
    *   `auth/`: Authentication and token generation.
    *   `core/`: Core user management operations.

Interactive API documentation is available at `/docs` and `/redoc` when the backend server is running. 

<!-- File List Start -->
## File List

- `__init__.py`
- `admin.py`

<!-- File List End -->
