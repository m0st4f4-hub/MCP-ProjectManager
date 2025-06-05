# Project Components (`frontend/src/components/project/`)

This directory contains React components for displaying and managing project-related information within the frontend application.

Key files:

*   `ProjectList.tsx`: Container for project data and list layout.
*   `ProjectCard.tsx`: Displays a single project's summary information.
*   `ProjectCardMenu.tsx`: Menu with edit/archive/delete actions for a project.
*   `CliPromptModal.tsx`: Modal for copying a CLI command to fetch a project.
*   `DeleteProjectDialog.tsx`: Confirmation dialog for deleting a project.
*   `ProjectDetail.tsx`: Detailed view of a single project.
*   `ProjectFiles.tsx`: Displays and manages project file attachments.
*   `ProjectMembers.tsx`: Shows and manages project members.

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

- `ProjectCard.tsx`
- `ProjectCardMenu.tsx`
- `CliPromptModal.tsx`
- `DeleteProjectDialog.tsx`
- `ProjectDetail.tsx`
- `ProjectFiles.tsx`
- `ProjectList.tsx`
- `ProjectMembers.tsx`

<!-- File List End -->

