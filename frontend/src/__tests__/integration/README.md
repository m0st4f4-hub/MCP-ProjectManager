# Frontend Integration Tests (`frontend/src/__tests__/integration/`)

This directory contains integration tests for the frontend application. These tests verify that multiple components, services, or modules work correctly together, simulating user flows or interactions between different parts of the application.

Key files:

*   `task-management.test.tsx`: Integration tests covering task management flows.

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

- `mock-missing-files.cjs`
- `task-management.test.tsx`
- `validate-frontend.test.ts`

<!-- File List End -->

