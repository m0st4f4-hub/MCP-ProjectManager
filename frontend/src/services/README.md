# API Services (`frontend/src/services/`)

This directory contains modules responsible for communication with the backend API. It abstracts away the direct HTTP request logic and provides typed functions for the rest of the frontend to interact with backend resources.

## `api.ts`

This is the primary file in this directory and serves as the central hub for all backend API interactions.

### Key Responsibilities & Features:

1.  **Base Configuration**:

    - Defines the `API_BASE_URL` for all requests, configurable via `process.env.NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8080`).

2.  **Generic Request Handler (`request<T>`)**:

    - A core utility function that uses the native `fetch` API to make HTTP requests.
    - Automatically sets `Content-Type: application/json` for `POST`, `PUT`, and `PATCH` methods.
    - Includes robust error handling: checks if `response.ok` is false, attempts to parse JSON error details from the response body, and throws a descriptive `Error`.
    - Correctly handles `204 No Content` responses (e.g., for some `DELETE` operations) by returning `null`.

3.  **Data Transformation Layer**:

    - Defines intermediate "Raw" interfaces (`RawTask`, `RawProject`, `RawAgent`) to represent the expected structure of data directly from the backend. These types are flexible (e.g., allowing IDs to be `string | number`, accommodating extra properties from the backend).
    - Each API function that retrieves data first fetches the raw data and then transforms it into the strongly-typed frontend models (defined in `frontend/src/types/`). This transformation includes:
      - Converting all entity IDs to `string`.
      - Normalizing task statuses: A `normalizeToStatusID` helper function maps various backend status strings and a `completed` flag to a canonical `StatusID` (e.g., 'To Do', 'Completed', 'EXECUTION_IN_PROGRESS') used consistently within the frontend. This leverages `getStatusAttributes` from `frontend/src/lib/statusUtils.ts`.
      - Ensuring fields like `is_archived` are proper booleans.
      - Providing default values for optional fields to prevent runtime errors (e.g., empty strings for titles, current date for missing timestamps).

4.  **Typed API Functions**:

    - Provides a comprehensive set of exported asynchronous functions for various CRUD (Create, Read, Update, Delete) operations and listings for main entities:
      - **Tasks**: `getTasks` (supports filtering), `getTaskById`, `createTask`, `updateTask`, `deleteTask`, `archiveTask`, `unarchiveTask`.
      - **Task Dependencies**: `getTaskDependencies`, `addTaskDependency`, `removeTaskDependency`.
      - **Task File Associations**: `getTaskFileAssociations`, `addTaskFileAssociation`, `removeTaskFileAssociation`.
      - **Projects**: `getProjects` (supports filtering), `getProjectById`, `createProject`, `updateProject`, `deleteProject`, `archiveProject`, `unarchiveProject`.
      - **Agents**: `getAgents` (supports filtering), `getAgentById`, `getAgentByName`, `createAgent`, `updateAgentById`, `deleteAgentById`.
    - List operations (`getTasks`, `getProjects`, `getAgents`) dynamically construct URL query parameters based on the provided filter objects.

5.  **Specialized Endpoints**:
    - `generateProjectManagerPlanningPrompt`: A function to interact with an endpoint presumably for AI-assisted planning, taking a goal and returning a prompt.

### Usage:

The Zustand stores (in `frontend/src/store/`) extensively use these API service functions to fetch and mutate data, with the `api.ts` module acting as the sole interface to the backend, ensuring consistency and separation of concerns.

<!-- File List Start -->
## File List


<!-- File List End -->
