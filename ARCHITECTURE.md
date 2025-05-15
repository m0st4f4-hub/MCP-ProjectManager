# MCP Project Manager Suite - Architecture Overview

## 1. Introduction

The MCP Project Manager Suite is designed as a comprehensive platform for collaborative project management, integrating a web-based graphical user interface (GUI) with an advanced agentic system powered by the Model Context Protocol (MCP). This document outlines the high-level architecture of the suite, detailing its core components and their interactions.

## 2. Core Components

The suite is composed of several key components that work together:

### 2.1. Frontend (Web GUI)

*   **Technology:** Next.js (React Framework), TypeScript, Chakra UI
*   **Purpose:** Provides the primary user interface for human interaction with the project management system. Users can create and manage projects, tasks, and agents, view progress, and interact with agent-driven workflows.
*   **Key Features:**
    *   Responsive design for various screen sizes.
    *   Themeable interface with light/dark mode support (via Chakra UI).
    *   Client-side state management (e.g., using Zustand) for a reactive user experience.
    *   API communication with the backend to fetch and send data.

### 2.2. Backend (API & MCP Server)

*   **Technology:** FastAPI (Python), SQLAlchemy (ORM), Pydantic (Data Validation), Alembic (Migrations)
*   **Purpose:** Serves as the central hub for business logic, data persistence, and MCP integration.
*   **Key Features:**
    *   **RESTful API:** Exposes endpoints for all project management operations (CRUD for projects, tasks, agents, etc.).
    *   **Database Interaction:** Manages data storage and retrieval using SQLAlchemy, supporting SQLite by default and PostgreSQL as an option.
    *   **Data Validation:** Uses Pydantic for robust request and response data validation.
    *   **MCP Server Integration:** Integrates `fastapi-mcp` to expose and manage agentic tools and workflows. This allows AI agents to interact with the system programmatically based on defined `.cursor` rules.
    *   **Authentication & Authorization (Future):** (Placeholder for future security enhancements if needed).

### 2.3. Command Line Interface (CLI)

*   **Technology:** Node.js, Commander.js
*   **File:** `cli.js` (in the root directory)
*   **Purpose:** Provides a unified tool for developers and users to set up, manage, and run the entire suite (frontend, backend).
*   **Key Features:**
    *   Automated dependency installation for both frontend and backend.
    *   Initialization of project structure and default configurations.
    *   Concurrent launching of backend and frontend services.
    *   Copying/updating of `.cursor` rules for the MCP engine.
    *   `npx` runnable for easy one-command setup.

### 2.4. MCP Engine & .cursor Rules

*   **Technology:** Model Context Protocol (MCP), `.mdc` rule files
*   **Integration:** The `fastapi-mcp` library is integrated into the backend.
*   **Purpose:** Enables the agentic capabilities of the suite. Allows for the definition of autonomous agents, their tools (derived from API endpoints or custom-defined), and their behavior through structured rule files (`.mdc`).
*   **Key Features:**
    *   Rule-driven agent execution.
    *   Orchestration of complex workflows involving multiple agents and tools.
    *   Extensible system for adding new agents and capabilities.

## 3. Data Flow (Examples)

This section illustrates typical data flows within the MCP Project Manager Suite.

### 3.1. User Creates a New Task via GUI

1.  **User Interaction (Frontend):**
    *   The user navigates to the project view and clicks a "New Task" button within a specific project.
    *   A form is displayed (e.g., in a modal) where the user inputs task details: `title`, `description`, `status` (e.g., 'To Do'), and optionally assigns an `agent_id`.
    *   Upon submission, the frontend component (e.g., using a service function from `src/services/`) constructs a JSON payload.

2.  **API Request (Frontend to Backend):**
    *   The frontend sends an HTTP POST request to the backend API endpoint for creating tasks (e.g., `/api/v1/tasks/`).
    *   The request body contains the JSON payload with task details and the `project_id`.
    *   An authorization token (if authentication is implemented) would be included in the headers.

3.  **Request Handling & Validation (Backend - FastAPI):
    *   The FastAPI router directs the request to the appropriate path operation function.
    *   Pydantic models validate the incoming JSON payload against the defined `TaskCreate` schema. If validation fails, a 422 Unprocessable Entity response is returned.

4.  **Business Logic & Database Operation (Backend - SQLAlchemy & CRUD):
    *   The CRUD function (e.g., `create_task`) is called with the validated data.
    *   SQLAlchemy constructs the appropriate SQL INSERT statement.
    *   The new task record is inserted into the `tasks` table in the database.
    *   The database returns the newly created task record, including its generated `id` and `created_at` timestamp.

5.  **API Response (Backend to Frontend):
    *   The backend returns a JSON response (e.g., HTTP 201 Created) containing the details of the newly created task, serialized by a Pydantic `Task` schema.

6.  **UI Update (Frontend):
    *   The frontend receives the successful response.
    *   The client-side state (e.g., Zustand store) is updated with the new task.
    *   The UI re-renders to display the new task in the project's task list.

*(Further examples to be detailed: e.g., Agent executing a task via MCP, CLI starting the services)*

## 4. Agent Interaction Model

This section describes how AI agents are defined, managed, and interact with the MCP Project Manager Suite.

### 4.1. Agent Definition & Capabilities

*   **Agents as Entities:** Agents are represented as records in the database (managed via the `agents` table and `Agent` SQLAlchemy model). Each agent has a unique name and ID.
*   **Role-Based Behavior:** The specific behavior, tools, and expertise of an agent are not directly stored in the database. Instead, they are defined by `.cursor/rules/*.mdc` files. The `agent_name` in the database typically maps to a corresponding rule file (e.g., `ProjectManager.mdc` for an agent named "ProjectManager").
*   **Tool Access via MCP:** Agents interact with the system primarily through tools exposed via the MCP (Model Context Protocol) integration in the backend (`fastapi-mcp`). These tools are often direct mappings to the backend's API endpoints (e.g., `mcp_project-manager_get_task_by_id`, `mcp_project-manager_update_task_by_id`) or specialized MCP commands (e.g., `mcp_desktop-commander_read_file`).
*   **Rule Files (`.mdc`):** These Markdown-based files define:
    *   The agent's `title`, `description`, and `roleId`.
    *   The core execution `protocol` the agent must follow (e.g., referencing a common `loop.mdc`).
    *   Specific instructions, decision-making logic, and sequences of tool calls for various scenarios.
    *   Mandates and constraints on agent behavior.

### 4.2. Assigning Agents to Tasks

*   Tasks in the system can be optionally assigned to an agent via the `agent_id` foreign key in the `tasks` table.
*   This assignment can be done by a human user through the GUI or by another agent (e.g., a `ProjectManager` agent delegating a sub-task).

### 4.3. Agent Task Execution Cycle (Conceptual - MCP Driven)

When an agent is triggered to work on an assigned task (e.g., by the `ProjectManager` or a scheduled process):

1.  **Activation & Context Acquisition:** The agent (or the MCP framework acting on its behalf) is activated with a `taskId`.
    *   It uses an MCP tool (e.g., `mcp_project-manager_get_task_by_id`) to fetch the full details of the assigned task, including its `title`, `description`, `status`, and any associated data.
    *   It loads its corresponding `.mdc` rule file based on its role/name.

2.  **Rule Processing & Planning:** The agent processes the task details against its loaded rules.
    *   It determines the sequence of actions and tool calls required to fulfill the task based on its defined logic.

3.  **Tool Execution & State Updates:** The agent executes the planned MCP tool calls.
    *   This might involve reading files, searching code, calling other APIs, or updating the status/description of the current task or other tasks via MCP tools.
    *   Each significant step or outcome is typically logged back to the MCP task description.

4.  **Verification (If Applicable):** Rules may dictate verification steps, where the agent uses tools to confirm the outcome of its actions (e.g., checking if a file was written correctly, or if an API call produced the expected result).

5.  **Completion & Handoff:** Once the task is completed (or if it's blocked/failed):
    *   The agent updates the final status of the MCP task (e.g., 'Completed', 'Blocked', 'Failed_Handover_To_X').
    *   It may create follow-up tasks and assign them to other agents if its rules dictate a workflow handoff.
    *   The agent then terminates its current execution cycle for that task.

### 4.4. Human-Agent Collaboration

*   Human users can monitor agent progress by viewing task statuses and descriptions (which agents update).
*   Users can intervene, reassign tasks, or provide additional information to agents by updating task details through the GUI.
*   The system is designed for a hybrid approach where agents automate parts of a project, and humans oversee, guide, and handle aspects requiring human judgment.

*(This model relies heavily on the design of the `.cursor/rules/` and the capabilities of the MCP framework.)*

## 5. Directory Structure Overview

This section provides an overview of the key directories within the MCP Project Manager Suite and their relevance to the architecture.

*   **`/.cursor/`**: Contains configuration and rule files for the Model Context Protocol (MCP) engine.
    *   **`rules/`**: Holds all `.mdc` (Markdown Context) rule files that define agent behaviors, available tools, and operational protocols. These are critical for the agentic capabilities of the suite.
        *   Example files: `ProjectManager.mdc`, `KnowledgeCurator.mdc`, `loop.mdc`, `system.mdc`.

*   **`/backend/`**: Houses the Python-based FastAPI backend application.
    *   **`.venv/`**: Standard Python virtual environment for backend dependencies.
    *   **`alembic/`**: Contains Alembic database migration scripts and configuration.
        *   **`versions/`**: Individual migration files.
    *   **`tests/`**: Unit and integration tests for the backend.
    *   **`main.py`**: The main application file for FastAPI, defining the app instance, MCP integration, and core API routes.
    *   **`models.py`**: SQLAlchemy ORM models defining the database schema (projects, tasks, agents).
    *   **`database.py`**: Database connection setup and session management.
    *   **`schemas.py`**: Pydantic schemas for data validation and serialization.
    *   **`crud.py`**: Functions for common database operations (Create, Read, Update, Delete).
    *   **`routers/`**: (If used) Directory for organizing API routes into separate modules.
    *   **`requirements.txt`**: Lists Python dependencies for the backend.

*   **`/frontend/`**: Contains the Next.js and TypeScript frontend application.
    *   **`.next/`**: Build output and cache for the Next.js application.
    *   **`public/`**: Static assets directly served by Next.js.
        *   **`assets/images/`**: Brand logos, icons.
        *   Favicon files (e.g., `favicon.ico`, `favicon-32x32.png`).
    *   **`src/`**: Main source code for the frontend application.
        *   **`app/`**: Next.js App Router directory, defining routes and layouts.
            *   **`layout.tsx`**: Root layout for the application.
            *   **`page.tsx`**: Main page component for the root route.
            *   Other route-specific directories and components.
        *   **`components/`**: Reusable UI components (e.g., Modals, ThemeToggleButton, Sidebar).
        *   **`contexts/`**: React Context providers (e.g., for theme management).
        *   **`lib/`**: Utility functions and helper modules.
        *   **`providers/`**: Wrappers for context providers (e.g., Chakra UI Provider).
        *   **`services/`**: API service functions for communicating with the backend.
        *   **`store/`**: State management setup (e.g., Zustand).
        *   **`theme/`**: Chakra UI theme configuration (colors, typography, etc.).
        *   **`types/`**: TypeScript type definitions.
    *   **`package.json`**: Defines frontend dependencies, scripts (dev, build, lint, test), and metadata.
    *   **`tsconfig.json`**: TypeScript compiler configuration.
    *   **`next.config.js`**: Next.js configuration file.

*   **`/.github/`**: GitHub-specific files for repository management and community interaction.
    *   **`ISSUE_TEMPLATE/`**: Templates for creating new issues (bug reports, feature requests).
    *   **`workflows/`**: GitHub Actions CI/CD workflow definitions (e.g., `ci.yml`).
    *   **`PULL_REQUEST_TEMPLATE.md`**: Template for pull requests.

*   **`cli.js`**: The root Node.js script that serves as the Command Line Interface for the entire suite. Manages setup, dependency installation, and launching of services.

*   **Root Files:**
    *   **`README.md`**: Main project overview, setup instructions, and general information.
    *   **`ARCHITECTURE.md`**: (This document) Detailed architectural overview.
    *   **`USAGE_EXAMPLES.md`**: Examples of how to use the suite.
    *   **`ONBOARDING.md`**: Guides for new users and contributors.
    *   **`CONTRIBUTING.md`**: Guidelines for contributing to the project.
    *   **`CODE_OF_CONDUCT.md`**: Community code of conduct.
    *   **`LICENSE`**: Project's open-source license.
    *   **`package.json`**: Root package file, primarily for the CLI (`mcp-project-manager-cli`).
    *   **`sql_app.db`**: Default SQLite database file (if used). 