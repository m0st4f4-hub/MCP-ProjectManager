# Task Component Architecture

This document details the structure, data flow, and interaction patterns of the `TaskItem` component and its related sub-components. These components are responsible for rendering and managing individual task items within the application's user interface.

## Overview

The core component in this module is `TaskItem.tsx`. It acts as a container and orchestrator for various UI elements that display task information and allow user interaction. To maintain clarity and separation of concerns, `TaskItem.tsx` delegates specific rendering responsibilities to several sub-components.

## Core Component: `TaskItem.tsx`

`TaskItem.tsx` is the primary component for displaying a single task. It fetches and processes task data, manages local UI state (e.g., expansion state), and coordinates actions performed on the task.

### Responsibilities:

*   Displays a summarized view of the task.
*   Allows users to expand the task to see more details.
*   Provides access to task actions (e.g., edit, delete, mark complete) via the `common/TaskActionsMenu.tsx` component.
*   Handles the logic for conditional rendering of details and action states.

### Data Flow:

*   **Input:** Receives a `task` object (typically `ITask` from `src/types/task.ts`) as its primary prop. This object contains all the data for the task to be displayed.
*   **Internal State:** Manages UI-specific state, such as whether the detailed view is expanded or if an edit modal is visible.
*   **Output:** Renders the task information and interactive elements. Actions triggered by the user (e.g., clicking "edit") may result in calls to parent components or services to update the task data.

## Sub-Components

### 1. `TaskItemMainSection.tsx`

*   **Purpose:** Renders the primary, always-visible part of a task item. This typically includes the task title, due date (if applicable), priority, and a checkbox for marking the task as complete.
*   **Props:**
    *   `task`: The `ITask` object.
    *   `onToggleComplete`: Function to call when the completion status is changed.
    *   `onExpand`: Function to call when the user requests to see more details.
*   **Data Flow:** Receives task data from `TaskItem.tsx` and displays it. User interactions (like toggling completion) are propagated back to `TaskItem.tsx` via callback props.

### 2. `TaskItemDetailsSection.tsx`

*   **Purpose:** Renders the collapsible/expandable section of a task item. This section displays additional details like the task description, subtasks (if any), and attachments.
*   **Props:**
    *   `task`: The `ITask` object.
    *   `isVisible`: Boolean indicating whether this section should be visible.
*   **Data Flow:** Receives task data from `TaskItem.tsx`. Its visibility is controlled by the parent `TaskItem.tsx`.

### 3. `common/TaskActionsMenu.tsx`

*   **Purpose:** Provides a consistent dropdown menu for actions that can be performed on a task (e.g., Edit, Delete, Assign, Set Due Date). This component is designed to be reusable across different parts of the application where task actions are needed.
*   **Props:**
    *   `task`: The `ITask` object (to provide context for actions, e.g., disabling "Mark Incomplete" if already incomplete).
    *   `onEdit`: Callback for when the "Edit" action is selected.
    *   `onDelete`: Callback for when the "Delete" action is selected.
    *   (Other action callbacks as needed, e.g., `onAssign`, `onSetDueDate`)
*   **Data Flow:** Receives the `task` object. When a menu item is clicked, it invokes the corresponding callback function passed by the parent component (e.g., `TaskItem.tsx` or a list view component).

### 4. `modals/EditTaskModal.tsx`

*   **Purpose:** Provides a modal dialog for editing the details of an existing task. It typically contains a form pre-filled with the current task's data.
*   **Props:**
    *   `task`: The `ITask` object to be edited.
    *   `isOpen`: Boolean to control the visibility of the modal.
    *   `onClose`: Function to call when the modal is dismissed (e.g., by clicking "Cancel" or the close button).
    *   `onSave`: Function to call with the updated task data when the user saves changes.
*   **Data Flow:**
    *   Receives the `task` to be edited.
    *   Manages its own form state.
    *   On save, passes the updated task data back to the calling component via `onSave`.

## Data Flow Summary

1.  **List View (`TaskList.tsx` or similar):** Fetches a list of tasks.
2.  For each task, it renders a `TaskItem.tsx` component, passing the individual `task` object as a prop.
3.  **`TaskItem.tsx`:**
    *   Passes the `task` object to `TaskItemMainSection.tsx` and `TaskItemDetailsSection.tsx`.
    *   Passes the `task` object and action handlers (e.g., `handleOpenEditModal`, `handleDeleteTask`) to `TaskActionsMenu.tsx`.
    *   If the "Edit" action is triggered, `TaskItem.tsx` will manage the state for `EditTaskModal.tsx`, passing the `task` object and relevant callbacks (`handleCloseEditModal`, `handleSaveChanges`).
4.  **`TaskItemMainSection.tsx` / `TaskItemDetailsSection.tsx`:** Display task data. Interactions like `onToggleComplete` are passed up to `TaskItem.tsx`.
5.  **`TaskActionsMenu.tsx`:** Invokes callbacks in `TaskItem.tsx` based on user selections.
6.  **`EditTaskModal.tsx`:**
    *   Receives the `task` for editing.
    *   On save, the `onSave` callback ( originating from `TaskItem.tsx` or a higher-level service) is invoked with the modified task data, which then triggers a data update process (e.g., API call, state store update).

## Deviations from Original Plan (If Any)

*(This section should be filled in if the actual implementation deviates from the initial plan. For now, it's a placeholder.)*

*   Example: "Subtasks were initially planned to be part of `TaskItemDetailsSection.tsx` but were moved to a separate `SubtaskList.tsx` component for better modularity."
*   Example: "The `TaskActionsMenu.tsx` was initially envisioned to be specific to `TaskItem.tsx`, but it has been made more generic and moved to `common/` to be reused in other contexts like a Kanban board view."

## Future Considerations

*   Integration with real-time updates.
*   Advanced filtering or sorting options directly within task views.
*   Accessibility improvements.
---

This README provides a foundational understanding of the Task component system. For specific implementation details, refer to the JSDoc comments within each `.tsx` file.
