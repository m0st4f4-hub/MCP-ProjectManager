# Modal Components (`frontend/src/components/modals/`)

This directory contains modal dialog components used for displaying detailed information or requiring specific user interactions.

## Files

### `TaskDetailsModal.tsx`
-   **Purpose**: Displays a modal dialog with comprehensive details about a specific task. It also provides actions related to the task, such as archiving, unarchiving, and deleting.
-   **Props**:
    -   `isOpen: boolean`: Controls the visibility of the modal.
    -   `onClose: () => void`: Callback function executed when the modal is closed.
    -   `taskId: string | null`: The unique identifier of the task whose details are to be displayed. If `null`, the modal will typically show a default or empty state.
-   **Key Features**:
    -   **Data Fetching**: When opened with a `taskId`, it attempts to find the task in the global Zustand store (`useTaskStore`). If not found, it fetches task details from the API using `getTaskById`.
    -   **Information Display**: Shows various task attributes, including:
        -   Title (in the modal header, with a loading spinner during fetch).
        -   Archived status (displayed as a badge).
        -   Description.
        -   Current Status (rendered with appropriate styling, color, and icon using `getDisplayableStatus` from `../../lib/statusUtils`).
        -   Associated Project Name (retrieved by looking up `task.project_id` in the projects list from `useTaskStore`).
        -   Assigned Agent Name (retrieved from `task.agent_name` or by looking up `task.agent_id` in the agents list from `useTaskStore`).
    -   **Actions**:
        -   If the task is **not archived**: Provides "Archive Task" and "Delete Task" buttons.
        -   If the task is **archived**: Provides "Unarchive Task" and "Delete Permanently" buttons.
        -   Deletion actions trigger a confirmation dialog (`AlertDialog`) before proceeding.
    -   **State Management**: Interacts with `useTaskStore` for performing `archiveTask`, `unarchiveTask`, and `deleteTask` operations.
    -   **UI Feedback**: Shows loading spinners during data fetching and uses Chakra UI `toast` notifications for the results of actions (success/error).
-   **Dependencies**: Relies on Chakra UI for modal components and styling, Zustand (`useTaskStore`) for state, and utility functions for status display.
-   **Styling**: Primarily uses Chakra UI components. May optionally use custom styles from `TaskDetailsModal.module.css`.
-   **Exports**: `TaskDetailsModal` (React Functional Component).

### `TaskDetailsModal.module.css`
-   **Purpose**: A CSS module containing specific styles for the `TaskDetailsModal` component. This is used for fine-grained styling that might not be conveniently achieved through Chakra UI props alone. 