# MCP Project Manager Suite - Usage Examples

This document provides practical examples of how to use the MCP Project Manager Suite, covering common user and administrative tasks.

## 1. Using the Web Interface (GUI)

### 1.1. Creating Your First Project

1.  **Navigate to Projects:** Once logged into the web interface (default: `http://localhost:3000`), locate the main navigation menu (often a sidebar on the left).
2.  **Access Projects Section:** Click on the "Projects" or "Manage Projects" link in the navigation menu. This will take you to the projects overview page, typically displaying a list of existing projects.
3.  **Initiate New Project:** Look for a button labeled "New Project", "Create Project", or a "+" icon. Click this button.
4.  **Fill in Project Details:** A form (often in a modal dialog) will appear, prompting you for project information:
    *   **Name (Required):** Enter a unique and descriptive name for your project (e.g., "Q3 Marketing Campaign", "New Website Development").
    *   **Description (Optional):** Provide a more detailed description of the project's goals, scope, or purpose.
5.  **Save the Project:** Click the "Save", "Create", or "Submit" button on the form.
6.  **Confirmation:** The new project should now appear in your list of projects. You might be automatically redirected to the new project's detail page.

    *Visual Cue: The interface should provide clear feedback, such as a success message or the appearance of the new project in the list.*

### 1.2. Adding Tasks to a Project

Once you have a project, you can start adding tasks to it.

1.  **Select Your Project:** From the projects list or dashboard, click on the project to which you want to add a task. This will typically navigate you to the project's detail page, which often includes a task list or task board.
2.  **Find "New Task" Option:** Look for a button or link such as "New Task", "Add Task", or a "+" icon within the project's task area.
3.  **Open Task Creation Form:** Clicking this option will open a form (e.g., inline, in a modal, or on a new page) for entering task details.
4.  **Enter Task Information:**
    *   **Title (Required):** A clear and concise title for the task (e.g., "Draft blog post", "Test login functionality").
    *   **Description (Optional):** More detailed information about the task, including requirements, goals, or context.
    *   **Status (Optional/Defaulted):** The initial status of the task (e.g., "To Do", "Pending"). This might be pre-selected or chosen from a dropdown.
    *   **Assigned Agent (Optional):** If you want to assign this task to a specific AI agent, you might be able to select one from a list of available agents.
    *   **Priority (Optional):** Set a priority level if applicable (e.g., Low, Medium, High).
    *   **Due Date (Optional):** Specify a due date for the task.
5.  **Save the Task:** Click the "Save", "Create Task", or "Add" button.
6.  **Confirmation:** The new task should now appear in the task list for the selected project.

### 1.3. Assigning an Agent to a Task

Assigning tasks to AI agents can help automate parts of your workflow.

1.  **Locate the Task:** Navigate to the project containing the task you wish to assign. Find the task in the project's task list or board.
2.  **Open Task for Editing:** Click on the task title or an "Edit" icon/button associated with the task. This will open the task details view or an edit form.
3.  **Find Agent Assignment Field:** Look for a field labeled "Assigned Agent", "Agent", or similar. This is typically a dropdown menu or a searchable selector.
4.  **Select an Agent:**
    *   Click on the agent assignment field.
    *   A list of available AI agents (e.g., "KnowledgeCurator", "CodeGenerator", "InformationAnalyst") should appear.
    *   Select the desired agent from the list.
    *   If you're unsure which agent to assign, you might leave it unassigned for the `ProjectManager` agent to handle or consult agent descriptions (if available).
5.  **Save Changes:** After selecting the agent, click the "Save", "Update Task", or "Submit" button to apply the changes.
6.  **Confirmation:** The task details should now reflect the assigned agent. The assigned agent may then pick up this task according to its operational rules and MCP configuration.

    *Note: The actual list of agents and their capabilities are defined by the `.cursor/rules/` configuration of your MCP Project Manager Suite instance.*

### 1.4. Viewing Task Status and Project Progress

Keeping track of progress is essential for project management.

1.  **Project Overview/Dashboard:**
    *   Many project management tools have a main dashboard or an overview page for each project.
    *   This view often summarizes key metrics: total tasks, tasks by status (e.g., To Do, In Progress, Completed, Blocked), percentage complete, upcoming deadlines.
    *   Look for visual indicators like progress bars, charts (e.g., burndown or burnup charts), or status summaries.

2.  **Task Lists & Boards:**
    *   **List View:** Tasks are often displayed in a list format, with columns for title, status, assigned agent, due date, priority, etc. You can usually sort and filter this list.
    *   **Board View (Kanban):** Tasks might be displayed as cards on a Kanban-style board, with columns representing different statuses (e.g., "To Do", "In Progress", "Review", "Done"). Users can often drag and drop tasks between columns to update their status.

3.  **Task Details:**
    *   Clicking on an individual task will open its detailed view.
    *   Here, you can see the current status, description, assigned agent, comments, activity log (history of changes), and any subtasks or linked items.
    *   Agents often update the task description or add comments with their progress, findings, or any issues encountered.

4.  **Filtering and Searching:**
    *   Utilize available search bars and filter options to find specific tasks or narrow down the view.
    *   Common filters include: by status, by assigned agent, by priority, by due date range, or by keywords in the title/description.

5.  **Notifications (If Implemented):**
    *   The system might provide notifications for important events, such as when a task status changes, a task is assigned to you, a comment is added, or a deadline is approaching.

    *Tip: Regularly check the status of tasks assigned to AI agents. Their updates, often in the task description or comments, provide insight into automated progress and any roadblocks.*

## 2. Using the Command Line Interface (CLI)

### 2.1. Starting the MCP Project Manager Suite

To launch the entire MCP Project Manager Suite (backend and frontend), use the `start` command. This command now executes a pre-bundled version of the application, simplifying setup.

```bash
# Using npx (recommended for most users)
npx mcp-project-manager-cli start

# Or, if installed globally:
mcp-project-manager start
```

This command will:
*   **Check for Prerequisites:** Verify that compatible versions of Node.js (v18.x+ recommended, v14 minimum) and Python (v3.8+) are installed and accessible in your system's PATH.
*   **Run Bundled Application:** Directly execute the pre-built backend (FastAPI) and frontend (Next.js) services.
    *   There are no separate local dependency installation steps (like `npm install` or `pip install`) performed by this command, as all necessary components are included in the bundle.
    *   It does not create a Python virtual environment in your current directory.
*   **Start Services:** Launch both the backend API (default: `http://localhost:8000`) and the frontend web interface (default: `http://localhost:3000`).
*   **Provide Output:** Display real-time, color-coded logs from both services in your terminal.
*   **Ensure Reliability:** Services are typically started with auto-restart capabilities.

The primary benefit of this approach is a streamlined and consistent startup experience. If you intend to develop or modify the Project Manager Suite itself, you would follow the manual setup instructions found in the main `README.md`.

### 2.2. Starting with Custom Ports

```