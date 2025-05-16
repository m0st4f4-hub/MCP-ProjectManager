# Next.js Application Directory (`frontend/src/app/`)

This directory is the core of the Next.js application, utilizing the App Router. It contains the main page, root layout, global styles, and potentially other application-level configurations and route handlers.

## Key Files

### `layout.tsx`
-   **Purpose**: Defines the root layout for the entire application.
-   **Key Features**:
    -   Sets up the basic HTML document structure (`<html>`, `<body>`).
    -   Includes default metadata for the application (e.g., title, description) using Next.js `Metadata` type.
    -   Wraps its `children` with the `ChakraProviderWrapper`. This is crucial as it provides the Chakra UI context, custom application theme (from `frontend/src/theme/index.ts`), and likely includes the `ModalProvider` for global modal management.
    -   Ensures consistent styling and UI behavior across all pages.

### `page.tsx`
-   **Purpose**: This client component (`'use client'`) serves as the primary user interface and entry point for the application, rendered at the root path (`/`).
-   **Key Features**:
    -   **Main Layout**: Implements a `Flex` layout consisting of a collapsible sidebar (`SidebarContent`) and a main content display area.
    -   **Sidebar (`SidebarContent`)**: 
        -   Provides primary navigation links (e.g., "Dashboard", "Workboard", "Portfolio", "Registry").
        -   Includes action buttons like "Add New Task", "Add New Project", "Add New Agent", "Import Plan", and a toggle for `MCPDevTools`.
        -   Contains the `ThemeToggleButton`.
        -   The sidebar's appearance and available actions can change based on the `activeView` and its collapsed state.
    -   **View Management**: Manages an `activeView` state which determines the content of the main area. It can display:
        -   `Dashboard` component.
        -   `TaskList` component (for the "Workboard" view), typically alongside `FilterSidebar`.
        -   `ProjectList` component (for the "Portfolio" view), typically alongside `FilterSidebar`.
        -   `AgentList` component (for the "Registry" view), typically alongside `FilterSidebar`.
    -   **Modal Integration**: Uses Chakra UI's `useDisclosure` to manage modals for:
        -   Adding tasks (`AddTaskForm`).
        -   Adding projects (`AddProjectForm`).
        -   Adding agents (`AddAgentForm`).
        -   Importing project plans via JSON `Textarea`.
        -   Displaying an AI prompt generation modal.
    -   **Functionality**: 
        -   Handles form submissions for creating new entities by calling API services.
        -   Parses imported JSON plans to create projects and tasks.
        -   Manages UI state (active view, modal states, sidebar collapse).
    -   **State & UI**: Heavily relies on Zustand for state management (`useTaskStore`, `useProjectStore`, `useAgentStore`) and Chakra UI for all visual elements and interactions.

### `globals.css`
-   **Purpose**: Contains global CSS styles that apply to the entire application. This can include base styles, resets, or utility classes. (Contents not read)

### `favicon.ico`
-   **Purpose**: The icon file used by browsers for bookmarks, tabs, etc. This is the standard ICO format.

*Note: Attempts to read `loading.tsx`, `not-found.tsx`, and `global.error.tsx` (which were present in a previous directory listing) were unsuccessful. Standard Next.js conventions would apply if these files were present and functional, but they are not in the current directory structure observed.*

## Subdirectories

The following subdirectory exists within `frontend/src/app/` and will be documented separately:

-   **`mcp-dev-tools/`**: Likely contains components or routes related to the "MCP Dev Tools" feature that is accessible from the main application page's sidebar. (Contents to be explored) 