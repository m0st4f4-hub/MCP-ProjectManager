# Project Manager Backend

## Overview

This directory contains the backend service for the Project Manager application. It is built using FastAPI and SQLAlchemy, providing a RESTful API for managing projects, agents, and tasks. It also integrates with MCP (Model Context Protocol) via the `FastApiMCP` library for enhanced agent capabilities.

## Project Structure

-   **`main.py`**: The main FastAPI application file.
    -   Initializes the FastAPI app with a lifespan manager for startup/shutdown events.
    -   **MCP Integration**: During startup, it initializes `FastApiMCP`, stores the instance in `app.state.mcp_instance`, and mounts its routes. This enables Model Context Protocol functionalities.
    -   Includes middleware for CORS and HTTP request logging.
    -   Defines all API endpoint routers for projects, agents, tasks, and a dynamic `/mcp-docs` endpoint.
-   **`database.py`**: Configures the database connection using SQLAlchemy.
    -   Sets up the database engine (defaults to SQLite with an absolute path, PostgreSQL option available).
    -   Provides `SessionLocal` for creating database sessions and `Base` for ORM models.
    -   Includes the `get_db` dependency injector for managing database session lifecycles in API requests.
-   **`models.py`**: Defines the SQLAlchemy ORM models (`Project`, `Agent`, `Task`) corresponding to the database tables and specifies their relationships.
    -   Primary keys are typically UUIDs stored as strings.
    -   `Project` and `Agent` models have a one-to-many relationship with `Task`.
    -   Cascade delete is configured: deleting a Project or Agent will also delete all their associated Tasks.
    -   Task completion is determined by the `Task.status` field, not a separate boolean `completed` field in the model.
-   **`schemas.py`**: Defines the Pydantic models used for data validation and serialization in the API endpoints.
    -   Follows a pattern of `Base`, `Create`, `Update`, and full response schemas for each entity.
    -   `ConfigDict(from_attributes=True)` is used to enable ORM mode for response schemas.
-   **`crud.py`**: Contains the Create, Read, Update, Delete (CRUD) database operations.
    -   Functions abstract direct database interactions using SQLAlchemy, taking Pydantic schemas as input and returning ORM models or lists thereof.
    -   Handles generation of UUIDs for new entities.
    -   Calculates `task_count` for projects (non-archived tasks for active projects).
    -   Includes logic for archiving/unarchiving entities and cascading these actions to related tasks if applicable (e.g., archiving a project archives its tasks).
-   **`alembic/`**: Contains Alembic migration scripts for managing database schema changes.
-   **`tests/`**: Contains backend unit and integration tests.
-   **`sql_app.db`**: The SQLite database file (if using the default configuration).
-   **`.env`**: (Optional/Gitignored) Used to store environment variables, e.g., for PostgreSQL database credentials.
-   **`requirements.txt`**: Lists Python package dependencies.

## Setup Instructions

1.  **Dependencies**: Navigate to the `task-manager` root directory (one level above `backend/`) in your terminal. Install required Python packages:
    ```bash
    # Assuming you are in the task-manager root
    # Create and activate a virtual environment (recommended)
    python -m venv backend/.venv
    # Windows activation:
    backend\.venv\Scripts\activate
    # macOS/Linux activation:
    # source backend/.venv/bin/activate

    # Install requirements
    pip install -r backend/requirements.txt
    ```

2.  **Environment Variables**: If using PostgreSQL (currently commented out in `database.py`), create a `.env` file in the `backend/` directory with your database credentials.

3.  **Database Setup**:
    *   **SQLite (Default)**: The database file (`sql_app.db`) will be created automatically in the location specified in `database.py` (currently an absolute path `D:/mcp/task-manager/sql_app.db`) when the application first runs and interacts with the database.
    *   **PostgreSQL**: Ensure the PostgreSQL server is running and the specified database exists.
    *   **Migrations (Alembic)**: Database schema is managed by Alembic.
        *   To apply migrations: `alembic upgrade head` (run from the `backend/` directory after configuring `alembic.ini` and `env.py` if necessary).
        *   To generate new migrations after model changes: `alembic revision --autogenerate -m "Describe changes"`
        *   Refer to Alembic documentation for full usage.

## Running the Service

From the `task-manager` root directory:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

-   `--reload`: Enables auto-reloading when code changes (for development).
-   `--host 0.0.0.0`: Makes the server accessible on your local network.
-   `--port 8000`: Specifies the port to run on.

The API documentation (Swagger UI) will be available at `http://localhost:8000/docs`.
The alternative ReDoc documentation is at `http://localhost:8000/redoc`.

## API Endpoint Overview

The API provides endpoints for managing the following resources. Refer to the auto-generated API documentation at `/docs` for detailed request/response schemas and parameters.

-   **Root (`/`)**: Basic welcome message.
-   **Projects**: Create, list, retrieve, update, delete, archive, unarchive.
    -   `POST /projects/`
    -   `GET /projects/`
    -   `GET /projects/{project_id}`
    -   `PUT /projects/{project_id}`
    -   `DELETE /projects/{project_id}`
    -   `POST /projects/{project_id}/archive`
    -   `POST /projects/{project_id}/unarchive`
-   **Agents**: Create, list, retrieve (by name or ID), update, delete.
    -   `POST /agents/`
    -   `GET /agents/`
    -   `GET /agents/{agent_name}`
    -   `GET /agents/id/{agent_id}`
    -   `PUT /agents/{agent_id}`
    -   `DELETE /agents/{agent_id}`
-   **Tasks**: Create, list (with filters), retrieve, update, delete, archive, unarchive.
    -   `POST /projects/{project_id}/tasks/`
    -   `GET /projects/{project_id}/tasks/{task_number}`
    -   `PUT /projects/{project_id}/tasks/{task_number}`
    -   `DELETE /projects/{project_id}/tasks/{task_number}`
    -   `POST /tasks/{task_id}/archive`
    -   `POST /tasks/{task_id}/unarchive`
-   **MCP**:
    -   `/mcp-docs`: Dynamically provides documentation for MCP tools derived from API endpoints and the `FastApiMCP` instance.
    -   Other MCP-specific endpoints are managed by the `FastApiMCP` integration.
-   **Planning**:
    -   `POST /projects/generate-planning-prompt`: Generates a planning prompt based on a goal.

## Task Identification

Tasks are now identified by a combination of `project_id` and `task_number` (an integer unique within each project). There is no global task ID. The `task_number` is automatically assigned as the next available integer within the project when a new task is created.

### Example API Usage

- **Create Task:**
  - `POST /projects/{project_id}/tasks/` (returns the new `task_number`)
- **Get Task:**
  - `GET /projects/{project_id}/tasks/{task_number}`
- **Update Task:**
  - `PUT /projects/{project_id}/tasks/{task_number}`
- **Delete Task:**
  - `DELETE /projects/{project_id}/tasks/{task_number}`

There are no subtasks or parent_task_id fields. All tasks are flat within their project. 