# View Components (`frontend/src/components/views/`)

This directory contains components that provide distinct ways of displaying and organizing collections of data items, such as tasks or projects. These views offer different presentational layouts and interaction models.

## Directory Contents Overview

This directory (`frontend/src/components/views/`) contains components that provide distinct ways of displaying and organizing collections of data items, such as tasks or projects. These views offer different presentational layouts and interaction models.

Key files:

*   `ListView.tsx`: Renders data items in a list or table format.
*   `KanbanView.tsx`: Renders data items in a Kanban board layout.
*   `ListGroup.tsx`: Component likely used within ListView to group items.
*   `ListSubgroup.tsx`: Component likely used within ListGroup for further item organization.
*   `ListTaskMobile.tsx`: A task list item component optimized for mobile display.
*   `ListView.types.ts`: TypeScript types specific to ListView.
*   `ListTaskItem.tsx`: Component for displaying individual task items within a list.
*   `KanbanColumn.tsx`: Component representing a single column in the Kanban view.
*   `README.md`: This file.

## Views

- **`KanbanView.tsx`**:

  - **Purpose**: Renders data items (likely tasks) in a Kanban board layout. This typically involves columns representing different statuses (e.g., "To Do", "In Progress", "Completed"), with cards within each column representing individual items.
  - **Key Features (Likely)**:
    - Displays items as cards within status-based columns.
    - May support drag-and-drop functionality to move items between columns (i.e., change their status).
    - Could include summaries per column (e.g., count of items).
    - Would receive a list of items and status definitions as props.

- **`ListView.tsx`**:
  - **Purpose**: Renders data items in a traditional list or table format.
  - **Key Features (Likely)**:
    - Displays items in rows, with columns for different attributes (e.g., title, status, assignee, due date).
    - May include features like sorting by column, pagination, and inline actions for each item.
    - Could be a more detailed or tabular alternative to simpler list components like `TaskList.tsx` or `ProjectList.tsx`, or it might be a generic, configurable list component.

These view components allow users to switch between different perspectives when examining their data, catering to various workflow preferences.

<!-- File List Start -->
## File List

- `KanbanColumn.tsx`
- `KanbanView.tsx`
- `ListGroup.tsx`
- `ListSubgroup.tsx`
- `ListTaskItem.tsx`
- `ListTaskMobile.tsx`
- `ListView.tsx`
- `ListView.types.ts`

<!-- File List End -->
