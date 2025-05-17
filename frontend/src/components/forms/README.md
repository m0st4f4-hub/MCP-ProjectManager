# Form Components (`frontend/src/components/forms/`)

This directory houses React components specifically designed for creating and editing data entities within the application, such as tasks, projects, and agents. These components typically include input fields, validation logic, and submission handling.

They likely leverage Chakra UI for form elements and a library like React Hook Form or Formik for managing form state and validation, or handle it with custom logic and Zustand stores.

## Forms

- **`AddAgentForm.tsx`**:

  - **Purpose**: Provides a form for creating new agents. Likely includes fields for agent name and any other agent-specific attributes.
  - Interacts with `useAgentStore` or an API service to submit the new agent data.

- **`AddProjectForm.tsx`**:

  - **Purpose**: Provides a form for creating new projects. Likely includes fields for project name, description, and potentially other project settings.
  - Interacts with `useProjectStore` or an API service to submit the new project data.

- **`AddTaskForm.tsx`**:

  - **Purpose**: Provides a form for creating new tasks. Likely includes fields for task title, description, assigning to a project, assigning to an agent, setting status, etc.
  - Interacts with `useTaskStore` or an API service to submit the new task data.

- **`EditAgentForm.tsx`**:
  - **Purpose**: Provides a form for editing existing agents. It would be pre-filled with the current agent's data and allow modification of their attributes (e.g., name).
  - Likely used within a modal or a dedicated edit view.
  - Interacts with `useAgentStore` or an API service to submit the updated agent data.

These components centralize form logic, making it easier to manage and reuse form structures across the application.
