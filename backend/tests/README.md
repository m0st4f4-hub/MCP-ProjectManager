# Backend Tests (`backend/tests/`)

This directory contains automated tests for the backend FastAPI application, written using the Pytest framework.

## Purpose of Tests

Automated tests are crucial for:
-   Ensuring code correctness and preventing regressions when new features are added or existing code is refactored.
-   Verifying that API endpoints behave as expected under various conditions.
-   Testing database interaction logic (CRUD operations) in isolation.
-   Providing confidence in the stability and reliability of the backend service.

## Test Files

-   **`test_main_api.py`**:
    -   Contains integration tests for the FastAPI API endpoints defined in `backend/main.py`.
    -   These tests likely use the `async_client` fixture (from `conftest.py`) to make HTTP requests to the various API routes and assert the responses (status codes, JSON payloads).

-   **`test_crud.py`**:
    -   Contains unit or integration tests specifically for the database functions defined in `backend/crud.py`.
    -   These tests likely use the `db_session` fixture (from `conftest.py`) to interact directly with the test database and verify the correctness of data creation, retrieval, update, and deletion logic.

-   **`conftest.py`**:
    -   This is a Pytest fixtures file, central to the test setup.
    -   **In-Memory Database**: Configures an in-memory SQLite database (`sqlite:///:memory:`) for tests. It includes fixtures to create the database engine (`test_engine`), a sessionmaker (`TestingSessionLocal`), and a fixture (`setup_database`) that automatically creates all database tables before tests run and drops them afterwards. This ensures each test session starts with a clean database.
    -   **FastAPI App Integration**: Provides a fixture (`fastapi_app`) for the main application instance. Crucially, it uses `apply_db_override` (an autouse session-scoped fixture) to override the application's `get_db` dependency. This makes all API endpoints use the in-memory test database during test execution.
    -   **HTTP Test Client**: Provides an `async_client` (session-scoped `httpx.AsyncClient`) for making asynchronous HTTP requests to the test application instance. This is the primary tool for API endpoint testing in `test_main_api.py`.
    -   **Database Session for Tests**: Provides a `db_session` (function-scoped) fixture that allows tests to directly interact with the test database in an isolated transaction, which is rolled back after each test.
    -   **Test Data Helpers**: Includes utility functions like `create_test_project` and `create_test_agent` to easily set up prerequisite data for tests.

-   **`__init__.py`**:
    -   Makes the `tests` directory a Python package, allowing for easier imports and test discovery.

## Running Tests

Tests are typically run using the Pytest command from the root of the `task-manager` project or from the `backend/` directory:

```bash
# From task-manager root (if pytest is configured to find tests in backend/tests)
pytest

# Or from backend/ directory
cd backend
pytest
```

Specific test files or functions can also be targeted:
```bash
pytest tests/test_main_api.py
pytest tests/test_crud.py::test_some_specific_function
``` 