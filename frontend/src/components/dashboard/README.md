# Dashboard Modules (`frontend/src/components/dashboard/`)

This directory contains modular React components that are specifically used to build the main dashboard view (`frontend/src/components/Dashboard.tsx`). Each component is responsible for rendering a specific section, chart, or piece of information on the dashboard, receiving its data as props from the parent `Dashboard.tsx` component.

## Key Components

### `DashboardStatsGrid.tsx`

- **Purpose**: Renders a grid of key statistics about projects, tasks, and agents.
- **Key Features**:
  - Defines and utilizes a reusable `StatCard` component.
  - The `StatCard` displays an individual metric with an icon, label, value, and optionally:
    - Help text/tooltips.
    - A trend indicator (up/down arrow with percentage).
    - A "Copy Agent Prompt" button, which uses a `promptGenerator` function passed via props to copy a relevant text prompt to the clipboard.
  - Receives numerous pre-calculated statistics from `Dashboard.tsx` as props (e.g., `displayTotalProjects`, `totalArchivedTasks`, `completedTasks`, `pendingTasks`, `inProgressTasks`, `blockedTasks`, `failedTasks`, `totalAgents`, `activeAgents`, `idleAgents`, `unassignedTasksCount`).
  - Also receives loading state props (`isLoadingProjects`, `isLoadingTasks`, etc.) to show `Skeleton` loaders while data is being fetched in the parent.
  - Arranges `StatCard` instances in a `SimpleGrid` for responsive layout.
  - Examples of stats displayed: "Active Projects", "Total Tasks (All Active Projects)", "Total Archived Projects", "Completed Tasks (Filtered)", "Pending Tasks (To Do, Filtered)", "Registered Agents", "Unassigned Tasks".

### Chart Components

These components are likely responsible for rendering various charts using a library like Recharts or similar, based on data processed and passed down from `Dashboard.tsx`.

- **`TaskStatusChart.tsx`**:

  - **Likely Purpose**: Displays a chart (e.g., Pie or Bar chart) visualizing the distribution of tasks by their current status (e.g., To Do, In Progress, Completed, Blocked, Failed).
  - Receives data like `statusCounts` from `Dashboard.tsx`.

- **`TasksOverTimeChart.tsx`**:

  - **Likely Purpose**: Shows a time-series chart (e.g., Line or Bar chart) illustrating trends in task creation and completion over a specific period (e.g., the last 14 days).
  - Receives data like `tasksOverTime` (an array of objects with date, created count, and completed count) from `Dashboard.tsx`.

- **`ProjectProgressChart.tsx`**:

  - **Likely Purpose**: Renders a chart (e.g., Bar chart or stacked bar chart) showing the progress of various projects, possibly based on the number of completed tasks versus total tasks per project.
  - Receives data like `tasksPerProject` (which includes name, task count, and progress percentage) from `Dashboard.tsx`.

- **`AgentWorkloadChart.tsx`**:
  - **Likely Purpose**: Visualizes the distribution of tasks among different agents, or shows agent workload/capacity.
  - Receives data like `tasksPerAgent` (name, task count) from `Dashboard.tsx`.

### List Components

- **`UnassignedTasksList.tsx`**:

  - **Likely Purpose**: Displays a list of tasks that are currently not assigned to any agent.
  - Receives `unassignedTasks` data from `Dashboard.tsx`.

- **`TopPerformersLists.tsx`**:

  - **Likely Purpose**: Shows lists of top-performing agents or most active/progressed projects. Could display lists like "Top Agents" (by task count) and "Top Projects" (by task count or progress).
  - Receives data like `topAgents` and `topProjects` from `Dashboard.tsx`.

- **`RecentActivityList.tsx`**:
  - **Likely Purpose**: Displays a feed or list of recent activities, such as recently updated tasks, completed tasks, or newly created tasks.
  - Receives `recentActivity` data from `Dashboard.tsx`.

These components collectively allow for a modular and maintainable dashboard, where `Dashboard.tsx` handles data aggregation and logic, while these child components focus purely on presentation.
