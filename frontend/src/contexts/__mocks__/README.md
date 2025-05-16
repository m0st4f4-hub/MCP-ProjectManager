# Context Mocks (`frontend/src/contexts/__mocks__/`)

This directory contains manual mocks for React Contexts, primarily used for Jest testing. When Jest encounters an import from the `frontend/src/contexts/` directory, and a corresponding file exists in this `__mocks__` directory, Jest will use the mock implementation instead of the actual one.

This allows tests to run in isolation with predictable context values, without needing to set up the full context providers or their dependencies.

## Files

### `ProjectContext.tsx`
-   **Purpose**: Provides a mock implementation for `frontend/src/contexts/ProjectContext.tsx`.
-   **Implementation Details**:
    -   It creates a `ProjectContext` using `React.createContext({})`, providing an empty object as the default mock context value.
    -   It exports a `ProjectProvider` that wraps children with this mock context. The value provided by the mock provider is also an empty object, with a comment indicating that mock-specific values can be added if needed by tests consuming this context.
    -   It exports `useProjectContext` which will consume this mock context when used in tests.
-   **Usage in Tests**: When components that use `useProjectContext` are tested, they will receive the mock value provided by this file, allowing tests to assert behavior based on a known, controlled context state. 