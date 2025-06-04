# Frontend Contexts (`frontend/src/contexts/`)

This directory contains React Context providers and hooks for managing global or widely shared state across the frontend application.

## Directory Contents Overview

This directory (`frontend/src/contexts/`) contains React Context providers and hooks for managing global or widely shared state across the frontend application. These are typically used at a high level in the application tree.

Key files:

*   `ThemeContext.tsx`: Provides context for managing the application's theme (light/dark mode).
*   `ProjectContext.tsx`: Provides the currently selected project and a setter to change it.
*   `README.md`: This file.

## Files

### `ProjectContext.tsx`
Manages the currently selected project and provides a hook to update it across the app.

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

- `ProjectContext.tsx`
- `ThemeContext.tsx`

<!-- File List End -->
