# API Routers (`backend/routers`)

This directory contains the FastAPI routers that define the API endpoints for the MCP Project Manager Suite backend.

Each router file groups related endpoints:

*   `tasks.py`: Handles endpoints related to tasks, including creation, retrieval, updates, deletion, **archiving, and unarchiving**. Also includes endpoints for managing **task dependencies**.
*   `projects.py`: Handles endpoints for project management (creation, retrieval, updates, deletion).
*   `memory.py`: Handles endpoints for the **Memory Service / Knowledge Graph**, allowing for creation, retrieval, updating, and deletion of memory entities and managing **task file associations**.
*   `agents.py`: Handles endpoints for managing AI agents.
*   `users.py`: Handles endpoints for user management.
*   `auth.py`: Handles authentication and token generation.
*   `status.py`: Handles basic status/health check endpoints.

Interactive API documentation is available at `/docs` and `/redoc` when the backend server is running. 