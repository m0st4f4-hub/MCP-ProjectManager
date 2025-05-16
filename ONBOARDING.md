# MCP Project Manager Suite - Onboarding Guides

Welcome to the MCP Project Manager Suite! These guides will help you get started, whether you're a user, a developer looking to contribute, or an agent developer.

## 1. User Onboarding: Getting Started with Project Management

This guide is for users who want to use the MCP Project Manager web interface to manage their projects and tasks.

### 1.1. Prerequisites
*   A modern web browser.
*   Access to a running instance of the MCP Project Manager Suite (either self-hosted via the CLI or a shared instance).

### 1.2. Launching the Application
*   If running locally, use the CLI command: `npx mcp-project-manager-cli start`
*   Navigate to the frontend URL (default: `http://localhost:3000`).

### 1.3. Navigating the Interface
*(Overview of the main sections: Dashboard (if any), Projects, Tasks, Agents, Settings)*

Once you've launched the application, you'll typically see a primary navigation area (e.g., a sidebar or top menu) with links to key sections:

*   **Dashboard (if present):** Often the landing page, providing a high-level summary of your projects, recent activity, pending tasks, or important notifications.
*   **Projects:** This section allows you to view all your projects, create new ones, and access individual project workspaces. Clicking on a project usually takes you to its specific overview or task list.
*   **Tasks (Global View - if present):** Some systems offer a global task list where you can see all tasks across all projects, often with powerful filtering options (e.g., tasks assigned to you, tasks due this week).
*   **Agents:** This section lists all registered AI agents in the system. You might be able to view their names, descriptions (if provided), and potentially their operational status or recent activity.
*   **Settings/Configuration:** Here you might find user profile settings, application preferences (like theme selection), and administrative options if you have the necessary permissions.
*   **Help/Documentation:** A link to usage guides, FAQs, or further documentation (like this Onboarding guide!).

Familiarize yourself with these sections. The exact layout and naming might vary slightly, but the core concepts are common in project management tools.

### 1.4. Your First Steps
*   Creating a project (see `USAGE_EXAMPLES.md`).
*   Adding your first task (see `USAGE_EXAMPLES.md`).
*   Exploring available views and filters.

### 1.5. Understanding Agent-Assisted Tasks (Conceptual)
*(Brief explanation of how AI agents might assist with tasks, if applicable for general users to know)*

In the MCP Project Manager Suite, AI agents can be assigned to tasks to help automate work or provide specialized assistance. Here's a conceptual overview:

*   **What are Agents?** Think of agents as specialized virtual team members. Each agent (e.g., "CodeReviewer", "ReportGenerator", "DataAnalyst") is designed with a specific set of skills and tools defined by its rules.
*   **How do they help?**
    *   **Automation:** Agents can perform repetitive tasks, like formatting documents, running tests, or generating summaries from data.
    *   **Analysis & Information Gathering:** They can analyze information, search through documents or code, or fetch data from external sources.
    *   **Task Progression:** Agents can update task statuses, add comments with their findings, or even create new sub-tasks if their rules dictate.
*   **How do you interact with them?**
    *   **Assignment:** You (or another agent like a `ProjectManager`) can assign a task to a specific agent through the task details interface.
    *   **Monitoring:** You can monitor an agent's progress by checking the task's status, description, and comments, which the agent should update as it works.
    *   **Providing Input:** If an agent needs more information, it might update the task description with questions or mark the task as "Blocked" until the required input is provided by a human user.
*   **Key Idea:** Agents don't replace human oversight but aim to augment your team's capabilities, freeing up human users for more complex, strategic, or creative work.

As you use the suite, you'll see how different agents contribute to your projects based on their configured roles and the tasks they are assigned.

## 2. Developer Onboarding: Contributing to the Suite

This guide is for developers who want to contribute to the MCP Project Manager Suite codebase (frontend, backend, or CLI).

### 2.1. Prerequisites
*   Git
*   Node.js (see `README.md` for version)
*   Python (see `README.md` for version)
*   An IDE (e.g., VS Code with recommended extensions)

### 2.2. Setting Up Your Development Environment
*   Fork and clone the repository (see `CONTRIBUTING.md`).
*   Follow the manual setup instructions for backend and frontend in the main `README.md`.
*   Understanding the `cli.js` for launching services in development mode.

### 2.3. Codebase Overview
*   Refer to `ARCHITECTURE.md` for a high-level understanding.
*   Key directories:
    *   `frontend/src`: Next.js application code. Core logic resides in `app/` (routing, page components), `components/` (reusable UI elements), `services/` (API interaction), and `store/` (state management with Zustand).
    *   `backend/`: FastAPI application code. `main.py` is the entry point. `models.py` (SQLAlchemy), `schemas.py` (Pydantic), and `crud.py` form the data layer. MCP integration points are also in `main.py` or related modules.
    *   `cli.js`: Main CLI tool, using `commander.js` to define commands for setup, launch, and utilities.
    *   `.cursor/rules/`: Contains agent definitions and protocols. Understanding these is key if working on agentic features.
*   Coding conventions and linters (see `CONTRIBUTING.md`). We use ESLint/Prettier for the frontend and Flake8 for the backend.

### 2.4. Making Your First Contribution
*   Finding an issue to work on (GitHub Issues, look for `good first issue` labels).
*   Following the contribution workflow in `CONTRIBUTING.md` (branching, commits, PRs).

### 2.5. Running Tests

Ensuring code quality through testing is crucial.

*   **Backend (Python/FastAPI):**
    *   Navigate to the project root: `cd /path/to/mcp-project-manager`
    *   Activate the Python virtual environment: `source backend/.venv/bin/activate` (or `backend\.venv\Scripts\activate` on Windows).
    *   Run tests using pytest: `pytest backend/tests/`
    *   Ensure you have `pytest` and any test-specific dependencies installed in your virtual environment (they should be in `backend/requirements.txt` if used for CI).

*   **Frontend (Next.js/TypeScript):**
    *   Navigate to the frontend directory: `cd frontend/`
    *   Install dependencies if you haven't already: `npm install` or `yarn install`
    *   Run tests using the script defined in `package.json` (e.g., `npm test` or `yarn test`). This often invokes Jest or a similar test runner configured for Next.js/React projects.
    *   (If E2E tests are set up, e.g., with Cypress or Playwright, there might be separate commands like `npm run test:e2e`.)

*   **CLI (Node.js):**
    *   (If specific tests for `cli.js` are implemented, they might be run with a command like `npm run test:cli` from the root, or as part of the frontend test suite if closely coupled. Otherwise, manual testing of CLI commands is often performed during development.)

Always run relevant tests after making changes and before submitting a pull request.

## 3. Agent Developer Onboarding: Creating Agents and Rules

This guide is for developers interested in creating new AI agents or defining new behaviors using `.cursor` rules for the MCP engine.

### 3.1. Understanding MCP and .cursor Rules
*   **Model Context Protocol (MCP):** MCP is a framework that allows AI models (agents) to interact with external tools and data sources in a structured way. It standardizes how agents receive tasks, access capabilities (tools), and report results.
*   **`.cursor` Directory & Rules:** The `.cursor/rules/` directory in this project is the heart of agent behavior. It contains `.mdc` (Markdown Context) files.
    *   **Rule Files (`<AgentName>.mdc`):** Each agent typically has its own rule file (e.g., `ProjectManager.mdc`). This file defines the agent's identity, its primary responsibilities, the tools it can use, and the logic it follows to perform tasks.
    *   **Protocol Files (e.g., `loop.mdc`, `system.mdc`):** These define common protocols, system-wide mandates, or shared sequences of actions that multiple agents might adhere to. For example, `loop.mdc` specifies a standard execution cycle (Activate, Acquire Context, Fetch Role, Plan, Execute, Update State).
    *   **Structure of `.mdc` files:** They are Markdown-based but use specific headings, frontmatter (like `ruleId`, `title`, `description`), and conventions to structure information for the MCP engine and for other agents (or humans) to understand.
*   **Tools:** Agents perform actions by calling "tools" (e.g., `mcp_project-manager_get_task_by_id`, `mcp_desktop-commander_read_file`). These tools are usually exposed by the `fastapi-mcp` integration in the backend and often map to API endpoints or specific server capabilities.

### 3.2. Setting Up for Rule Development
*   Access to the `.cursor/rules/` directory.
*   Understanding how the backend loads and uses these rules.

### 3.3. Creating a Simple Agent/Rule
*(Step-by-step example of a basic rule, e.g., an agent that responds to a specific prompt or performs a simple action via an API tool)*

Let's outline creating a conceptual "GreeterAgent" that responds when a new task with a specific instruction is assigned to it.

1.  **Define the Agent Rule File (`GreeterAgent.mdc`):**
    *   Create a new file: `.cursor/rules/GreeterAgent.mdc`.
    *   **Frontmatter:**
        ```yaml
        ---
        ruleId: greeter-agent
        ruleType: Agent
        title: Greeter Agent
        description: A simple agent that greets and confirms task reception.
        schemaVersion: 1
        conformsTo: core-agent-loop # Indicates it follows a standard loop
        tags: [example, greeter]
        status: Active
        ---
        ```
    *   **Core Logic (Conceptual - referencing `loop.mdc` principles):**
        *   **STEP 1 (Activate & Initial Context):** Agent is activated by `taskId`.
        *   **STEP 2 (Acquire Full Task Context):** Uses `mcp_project-manager_get_task_by_id` to get task details. Checks if task description contains a trigger phrase like "Please greet".
        *   **STEP 3 (Fetch Role):** (This step is part of the standard loop, loads this `GreeterAgent.mdc` rule).
        *   **STEP 4 (Plan Turn):** If trigger phrase found, plan to update the task with a greeting.
        *   **STEP 5 (Execute & Verify):** Use `mcp_project-manager_update_task_by_id` to append "Hello! GreeterAgent here, I have received your task." to the task's description.
        *   **STEP 6 (Update State & Finalize):** Update task status to "In Progress" or "Acknowledged", and `completed` to `false` (as it's just an acknowledgement, not task completion). Terminate.

2.  **Register the Agent (Conceptually):**
    *   In a real system, you might need to ensure the backend can recognize "GreeterAgent" (e.g., by adding it to a list of known agents if not automatically discovered from rules, or by ensuring a user can select it in the UI). In this project, agents are often implicitly defined by their `.mdc` files and tasks are assigned to them by name.

3.  **Assign a Task:**
    *   A user (or another agent) creates a task and assigns it to "GreeterAgent" with the description containing "Please greet".

This is a simplified example. Real agent rules can be much more complex, involving many tool calls, conditional logic, and interaction with other agents, all guided by the structures laid out in files like `loop.mdc` (see attached `loop.md` for a detailed example of such a protocol).

### 3.4. Testing Your Agent/Rule
*(Methods for testing agent behavior, perhaps through specific API calls or UI interactions designed to trigger the agent)*

### 3.5. Best Practices for Rule Development
*(Tips for writing clear, efficient, and maintainable rules)*

---

*These guides will be expanded with more details, screenshots, and tutorials.* 