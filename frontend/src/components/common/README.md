# Common Components (`frontend/src/components/common/`)

This directory contains general-purpose, reusable React components that provide base functionality or shared UI patterns used across different parts of the frontend application.

## Files

### `FilterSidebar.tsx`

- **Purpose**: Renders a sidebar containing various controls for filtering and sorting lists, primarily tasks and projects.
- **Key Features**:
  - Integrates with Zustand stores (`useTaskStore`, `useProjectStore`) to manage filter and sort states.
  - Provides UI controls (inputs, selects, switches) for filtering data by search terms, status, associated project, assigned agent, and archive status (for both tasks and projects).
  - Allows sorting data by fields like creation date, title, or status, with direction control (ascending/descending).
  - Includes a "Clear Filters" button to reset all selections to their default states.
  - Dynamically populates dropdowns for projects and agents using data from the stores.
- **Exports**: `FilterSidebar` (React Functional Component).
- **Syntax Example (Conceptual)**:
  ```tsx
  import FilterSidebar from "./FilterSidebar";
  // ...
  <FilterSidebar />;
  ```

### `ConfirmationModal.tsx`

- **Purpose**: A generic modal dialog for prompting users to confirm an action before it is executed.
- **Props**:
  - `isOpen: boolean`: Controls the visibility of the modal.
  - `onClose: () => void`: Callback executed when the modal is closed (e.g., by clicking cancel or the close button).
  - `onConfirm: () => void`: Callback executed when the primary confirmation action is triggered.
  - `title: string`: The title displayed in the modal header.
  - `bodyText?: string`: Optional custom text for the modal body. Defaults to a generic confirmation message.
  - `confirmButtonText?: string`: Custom text for the confirmation button (default: "Confirm").
  - `cancelButtonText?: string`: Custom text for the cancel button (default: "Cancel").
  - `confirmButtonColorScheme?: string`: Chakra UI color scheme for the confirm button (default: "red").
  - `isLoading?: boolean`: If true, displays a loading spinner on the confirm button.
- **Exports**: `ConfirmationModal` (React Functional Component).
- **Syntax Example**:
  ```tsx
  import ConfirmationModal from "./ConfirmationModal";
  // ...
  <ConfirmationModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onConfirm={handleDelete}
    title="Delete Item"
    bodyText="Are you sure you want to delete this item?"
  />;
  ```

### `EditModalBase.tsx`

- **Purpose**: A base component for creating modals used to edit entities. It provides the common structure for an edit dialog, including save, cancel, and an optional delete button with its own confirmation.
- **Type Generic**: `T extends EntityWithIdAndName` (where `EntityWithIdAndName = { id: number | string; [key: string]: unknown }`)
- **Props**:
  - `isOpen: boolean`, `onClose: () => void`
  - `entityName: string`: Name of the entity type (e.g., "Project", "Task").
  - `entityData: T | null`: The data object of the entity being edited.
  - `entityDisplayField: keyof T`: The field in `entityData` to use for display in the modal title (e.g., 'name').
  - `children: React.ReactNode`: The form fields specific to the entity being edited.
  - `onSave: () => Promise<void>`: Async callback executed when the save button is clicked. The caller handles data preparation, API call, success/error feedback, and closing the modal.
  - `onDelete?: () => Promise<void>`: Optional async callback for deleting the entity. Also handled by the caller.
  - `isLoadingSave: boolean`: Loading state for the save operation.
  - `isLoadingDelete?: boolean`: Loading state for the delete operation.
  - `size?: string`: Optional Chakra UI modal size (e.g., 'xl', '2xl').
  - `hideDeleteButton?: boolean`: If true, the delete button is not rendered.
- **Key Features**:
  - Renders a Chakra UI `Modal` with a header dynamically generated from `entityName` and `entityDisplayField`.
  - The `children` prop is rendered in the modal body, allowing for custom form content.
  - Includes "Save Changes" and "Cancel" buttons in the footer.
  - If `onDelete` is provided and `hideDeleteButton` is false, a "Delete" button is shown, which triggers an `AlertDialog` for confirmation before executing `onDelete`.
- **Exports**: `EditModalBase` (React Functional Component).

### `AddFormBase.tsx`

- **Purpose**: A base component for creating forms used to add new entities. It provides a common structure including a title and a submit button.
- **Props**:
  - `formTitle: string`: The title displayed above the form.
  - `children: React.ReactNode`: The input fields and other content specific to the add form.
  - `onSubmit: (e: React.FormEvent) => Promise<void>`: Async callback executed when the form is submitted. The caller handles form data extraction, API call, and feedback.
  - `isLoading: boolean`: Loading state for the submit button.
  - `submitButtonText: string`: Text for the submit button.
  - `submitButtonColorScheme?: string`: Chakra UI color scheme for the submit button (default: "blue").
- **Key Features**:
  - Renders an HTML `form` element with a `Heading` for the title.
  - The `children` prop is rendered within the form, allowing for custom input fields.
  - Includes a submit `Button` that shows a loading state and calls the `onSubmit` prop.
- **Exports**: `AddFormBase` (React Functional Component).
