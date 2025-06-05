# Backend Unit Tests - CRUD (`backend/tests/unit/crud`)

This directory contains unit tests specifically for the database CRUD functions located in `backend/crud/`. These tests ensure that the individual CRUD operations (Create, Read, Update, Delete) work correctly in isolation from other parts of the application.

Key files:

*   `test_projects.py`: Unit tests for project CRUD functions.

## Architecture Diagram
```mermaid
graph TD
    user((User)) -->|interacts with| frontend(Frontend)
    frontend -->|API requests| backend(Backend)
    backend -->|persists| database[(Database)]
    backend -->|integrates| mcp(MCP Server)
```

<!-- File List Start -->
## File List


<!-- File List End -->




