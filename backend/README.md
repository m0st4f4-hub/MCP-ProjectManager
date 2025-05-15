# Project Manager Backend

## Overview

This directory contains the backend service for the Project Manager application. It is built using FastAPI and SQLAlchemy, providing a RESTful API for managing projects, agents, tasks, and subtasks. It also integrates with MCP (Model Context Protocol) for enhanced agent capabilities.

## Project Structure

-   **`main.py`**: The main FastAPI application file. It defines the FastAPI instance, includes middleware (CORS, logging), manages the application lifespan (startup/shutdown events, MCP initialization), and defines all API endpoint routers.
-   **`database.py`**: Configures the database connection using SQLAlchemy. It sets up the database engine, session maker (`SessionLocal`), and the declarative base (`Base`) for ORM models. It also provides the `get_db` dependency injector for database sessions. Currently configured for SQLite, with commented-out options for PostgreSQL.
-   **`models.py`**: Defines the SQLAlchemy ORM models (`Project`, `Agent`, `Task`, `Subtask`) corresponding to the database tables and specifies their relationships.
-   **`schemas.py`**: Defines the Pydantic models used for data validation and serialization in the API endpoints. These schemas dictate the expected structure of request bodies and the format of response data.
-   **`crud.py`**: Contains the Create, Read, Update, Delete (CRUD) database operations. These functions abstract the direct database interactions using SQLAlchemy, taking Pydantic schemas as input and returning ORM models.
-   **`alembic/`**: Contains Alembic migration scripts for managing database schema changes (if initialized).
-   **`tests/`**: Contains backend unit and integration tests (if implemented).
-   **`sql_app.db`**: The SQLite database file (if using the default configuration).
-   **`.env`**: (Optional/Gitignored) Used to store environment variables, potentially including database credentials for PostgreSQL.

## Setup Instructions

1.  **Dependencies**: Navigate to the `task-manager` root directory (one level above `backend/`) in your terminal. Install required Python packages:
    ```bash
    # Assuming you are in the task-manager root
    # Create and activate a virtual environment (recommended)
    python -m venv backend/.venv
    # Windows activation:
    backend\\.venv\\Scripts\\activate
    # macOS/Linux activation:
    # source backend/.venv/bin/activate

    # Install requirements
    pip install -r backend/requirements.txt
    ```
    *(Note: A `requirements.txt` file is assumed. If it doesn\'t exist, it should be generated based on the project\'s imports).*

2.  **Environment Variables**: If using PostgreSQL (currently commented out in `database.py`), create a `.env` file in the `backend/` directory with the following variables:
    ```dotenv
    DATABASE_USER=your_db_user
    DATABASE_PASSWORD=your_db_password
    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_NAME=taskdb
    ```

3.  **Database Setup**:
    *   **SQLite (Default)**: The database file (`sql_app.db`) will be created automatically in the location specified in `database.py` when the application first runs and interacts with the database.
    *   **PostgreSQL**: Ensure the PostgreSQL server is running and the specified database exists.
    *   **Migrations (Alembic)**: If using Alembic for migrations (recommended for production and schema changes):
        *   Initialize Alembic (if not already done): `alembic init alembic` (run from `backend/` directory). Configure `alembic.ini` and `env.py` to point to your database and models.
        *   Generate initial migration: `alembic revision --autogenerate -m "Initial database schema"`
        *   Apply migrations: `alembic upgrade head`

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

The API provides endpoints for managing the following resources:

-   **Projects**: Create, list, retrieve, update, delete projects.
    -   `POST /projects/`
    -   `GET /projects/`
    -   `GET /projects/{project_id}`
    -   `PUT /projects/{project_id}`
    -   `DELETE /projects/{project_id}`
-   **Agents**: Create, list, retrieve (by name or ID), update, delete agents.
    -   `POST /agents/`
    -   `GET /agents/`
    -   `GET /agents/{agent_name}`
    -   `GET /agents/id/{agent_id}`
    -   `PUT /agents/{agent_id}`
    -   `DELETE /agents/{agent_id}`
-   **Tasks**: Create, list (with filters), retrieve, update, delete tasks.
    -   `POST /tasks/`
    -   `GET /tasks/`
    -   `GET /tasks/{task_id}`
    -   `PUT /tasks/{task_id}`
    -   `DELETE /tasks/{task_id}`
-   **Subtasks**: Create (for a parent task), list (for a parent task), retrieve, update, delete subtasks.
    -   `POST /tasks/{parent_task_id}/subtasks/`
    -   `GET /tasks/{parent_task_id}/subtasks/`
    -   `GET /subtasks/{subtask_id}`
    -   `PUT /subtasks/{subtask_id}`
    -   `DELETE /subtasks/{subtask_id}`
-   **MCP**:
    -   `/mcp-docs`: Provides documentation for MCP tools derived from API endpoints.
    -   Other MCP endpoints are managed by the `FastApiMCP` integration.
-   **Planning**:
    -   `POST /projects/generate-planning-prompt`: Generates a planning prompt based on a goal.

Refer to the auto-generated API documentation at `/docs` for detailed request/response schemas and parameters. 