# Task Component Architecture

This document details the structure, data flow, and interaction patterns of the `TaskItem` component and its related sub-components. These components are responsible for rendering and managing individual task items within the application's user interface.

---

## Overview

The core component in this module is `TaskItem.tsx`. It acts as a container and orchestrator for various UI elements that display task information and allow user interaction. To maintain clarity and separation of concerns, `TaskItem.tsx` delegates specific rendering responsibilities to several sub-components.

---

## Core Component: `TaskItem.tsx`

`TaskItem.tsx` is the primary component for displaying a single task. It fetches and processes task data, manages local UI state (e.g., expansion state), and coordinates actions performed on the task.

### Responsibilities

- Displays a summarized view of the task.
- Allows users to expand the task to see more details.
- Provides access to task actions (e.g., edit, delete, mark complete) via the `common/TaskActionsMenu.tsx` component.
- Displays and manages task dependencies (predecessors and successors).
- Displays and manages associated files (Memory entities).
- Provides options for archiving and unarchiving the task.
- Handles the logic for conditional rendering of details and action states.

### Data Flow

- **Input:** Receives a `task` object (typically `ITask` from `src/types/task.ts`) as its primary prop.
- **Internal State:** Manages UI-specific state, such as whether the detailed view is expanded or if an edit modal is visible.
- **Output:** Renders the task information and interactive elements. Actions triggered by the user (e.g., clicking "edit") may result in calls to parent components or services to update the task data.

---

## Sub-Components

### 1. `TaskItemMainSection.tsx`
- **Purpose:** Renders the primary, always-visible part of a task item (title, due date, priority, completion checkbox).
- **Props:** `task`, `onToggleComplete`, `onExpand`, etc.
- **Data Flow:** Receives task data from `TaskItem.tsx` and displays it. User interactions are propagated back via callback props.

### 2. `TaskItemDetailsSection.tsx`
- **Purpose:** Renders the collapsible/expandable section of a task item (description, subtasks, attachments).
- **Props:** `task`, `isVisible`.
- **Data Flow:** Receives task data from `TaskItem.tsx`. Visibility is controlled by the parent.

### 3. `common/TaskActionsMenu.tsx`
- **Purpose:** Provides a dropdown menu for actions (Edit, Delete, Assign, Set Due Date).
- **Props:** `task`, `onEdit`, `onDelete`, etc.
- **Data Flow:** Receives the `task` object. Menu item clicks invoke callbacks.

---

## Modal Components

### `TaskItemModals.tsx`
- **Purpose:** Orchestrates modal dialogs for editing and viewing task details.
- **Usage:** Used within `TaskItem.tsx` to provide modals for editing (`EditTaskModal`) and viewing details (`TaskDetailsModal`).

### `modals/EditTaskModal.tsx`
- **Purpose:** Modal dialog for editing a task. Wraps `TaskForm` for editing.
- **Props:** `isOpen`, `onClose`, `task`, `onUpdate`.

### `modals/TaskDetailsModal.tsx`
- **Purpose:** Modal dialog for viewing comprehensive task details. Allows users to view and manage task dependencies, view and add associated files (Memory entities), and perform actions like archive, unarchive, and delete.
- **Props:** `isOpen`, `onClose`, `taskId`.

See `frontend/src/components/modals/README.md` for more details.

---

## Utilities & Styles

- **`TaskItem.utils.ts`**: Utility functions for status color and tag logic.
- **`TaskItem.styles.ts`**: Style objects and tokens for consistent UI.
- **`TaskItem.types.ts`**: TypeScript interfaces for props and task data.

---

## Data Flow Summary

1. **List View (`TaskList.tsx` or similar):** Fetches a list of tasks.
2. For each task, renders a `TaskItem.tsx` component, passing the individual `task` object as a prop.
3. **`TaskItem.tsx`:**
   - Passes the `task` object to subcomponents and action menus.
   - Manages state for modals and expanded/collapsed views.
4. **Subcomponents:** Display task data and propagate interactions.
5. **Modals:** Handle editing and detailed viewing of tasks.

---

## Getting Started / Onboarding

- **To add a new feature or refactor:** Start with `TaskItem.tsx` and follow the data flow through subcomponents.
- **To add a new modal or action:** Add the modal to `modals/`, update `TaskItemModals.tsx`, and wire up callbacks in `TaskItem.tsx`.
- **Type safety:** All props and data structures are typed in `TaskItem.types.ts` and `@/types/task`.

---

## Testing & Accessibility

- **Testing:** Automated tests are not yet present for TaskItem. Manual verification and Storybook stories are recommended.
- **Accessibility:** Components use Chakra UI and ARIA attributes where possible. Further accessibility improvements are a future consideration.

---

## Deviations from Original Plan

*(Update this section if any deviations from the initial design have occurred. Otherwise, remove this placeholder.)*

---

## Future Considerations

- Integration with real-time updates.
- Advanced filtering or sorting options.

---

For specific implementation details, refer to the JSDoc comments within each `.tsx`

## Directory Contents Overview

This directory (`frontend/src/components/task/`) contains the React components specifically designed for displaying and interacting with individual tasks within the frontend application. It includes the main `TaskItem` component and its related sub-components, utilities, and types.

Key files:

*   `TaskItem.tsx`: The primary component for rendering a single task item.
*   `TaskItemMainSection.tsx`: Renders the main, visible part of a task item.
*   `TaskItemDetailsSection.tsx`: Renders the expandable details section of a task item.
*   `TaskItem.utils.ts`: Contains utility functions used by task components.
*   `TaskItem.types.ts`: Defines TypeScript types for task components.
*   `TaskItem.styles.ts`: Contains styling definitions for task components.
*   `README.md`: This file.