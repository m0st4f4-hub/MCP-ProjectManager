# Frontend Unit/Integration Tests (`frontend/src/__tests__/`)

This directory contains test files for the React components and potentially utility functions located within the `frontend/src/` directory. These tests are likely written using a testing framework such as Jest, in conjunction with a library like React Testing Library for testing React components.

The purpose of these tests is to ensure that individual units of code (components, functions) behave as expected in isolation and when integrated with other units.

## Test Files

The following test files have been identified in this directory:

-   `AddProjectForm.spec.tsx`: Contains tests for the `AddProjectForm` component (likely located in `frontend/src/components/AddProjectForm.tsx`). These tests would verify form rendering, input handling, validation, and submission logic.

-   `ClientOnly.spec.tsx`: Contains tests for the `ClientOnly` component (likely located in `frontend/src/components/ClientOnly.tsx`). These tests would verify that the component correctly renders its children only on the client-side.

-   `LoadingSkeleton.spec.tsx`: Contains tests for the `LoadingSkeleton` component (likely located in `frontend/src/components/LoadingSkeleton.tsx`). These tests would verify its rendering behavior, and potentially accessibility attributes.

-   `ThemeToggleButton.spec.tsx`: Contains tests for the `ThemeToggleButton` component (likely located in `frontend/src/components/ThemeToggleButton.tsx`). These tests would verify its rendering, interaction (click handling), and that it correctly reflects and triggers theme changes (possibly by interacting with a mocked `ThemeContext`).

-   `.gitkeep`: An empty file used to ensure the directory is tracked by Git even if it temporarily contains no other files. Standard practice in some projects.

## Running Tests

To run these tests, you would typically use a command specified in the `package.json` file of the `frontend` directory, such as `npm test` or `yarn test`. 