// frontend/src/lib/mcpTools.ts
export interface ApiToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "json_object_string";
  required: boolean;
  description?: string;
  isPathParameter?: boolean; // True if it's part of the URL path like {project_id}
  isQueryParameter?: boolean; // True if it's a URL query parameter
  isBodyParameter?: boolean; // True if it's part of the request body
}

export interface ApiToolDefinition {
  id: string; // Unique identifier for the tool
  label: string; // User-friendly name
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string; // API path, e.g., /projects or /projects/{project_id}
  parameters: ApiToolParameter[];
  description?: string;
  // We might add a direct function call here later if it maps to an existing api.ts function
}

export const mcpTools: ApiToolDefinition[] = [
  // --- Root ---
  {
    id: "get_root_message",
    label: "Get API Root Message",
    method: "GET",
    path: "/",
    parameters: [],
    description: "Gets the root message of the API.",
  },
  // --- Projects ---
  {
    id: "create_project",
    label: "Create Project",
    method: "POST",
    path: "/projects/",
    parameters: [
      {
        name: "body",
        type: "json_object_string",
        required: true,
        isBodyParameter: true,
        description: 'JSON: {"name": "string", "description"?: "string"}',
      },
    ],
    description: "Creates a new project.",
  },
  {
    id: "get_project_list",
    label: "Get Projects",
    method: "GET",
    path: "/projects/",
    parameters: [
      {
        name: "skip",
        type: "number",
        required: false,
        isQueryParameter: true,
        description: "Skip records",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        isQueryParameter: true,
        description: "Limit records",
      },
    ],
    description: "Retrieves a list of projects.",
  },
  {
    id: "get_project_by_id",
    label: "Get Project by ID",
    method: "GET",
    path: "/projects/{project_id}",
    parameters: [
      {
        name: "project_id",
        type: "number",
        required: true,
        isPathParameter: true,
        description: "ID of the project",
      },
    ],
    description: "Retrieves a specific project by its ID.",
  },
  {
    id: "update_project",
    label: "Update Project",
    method: "PUT",
    path: "/projects/{project_id}",
    parameters: [
      {
        name: "project_id",
        type: "number",
        required: true,
        isPathParameter: true,
        description: "ID of the project to update",
      },
      {
        name: "body",
        type: "json_object_string",
        required: true,
        isBodyParameter: true,
        description: 'JSON: {"name"?: "string", "description"?: "string"}',
      },
    ],
    description: "Updates an existing project.",
  },
  {
    id: "delete_project",
    label: "Delete Project",
    method: "DELETE",
    path: "/projects/{project_id}",
    parameters: [
      {
        name: "project_id",
        type: "number",
        required: true,
        isPathParameter: true,
        description: "ID of the project to delete",
      },
    ],
    description: "Deletes a project.",
  },
  // --- Agents ---
  {
    id: "create_agent",
    label: "Create Agent",
    method: "POST",
    path: "/agents/",
    parameters: [
      {
        name: "body",
        type: "json_object_string",
        required: true,
        isBodyParameter: true,
        description: 'JSON: {"name": "string"}',
      },
    ],
    description: "Registers a new agent.",
  },
  {
    id: "get_agent_list",
    label: "Get Agents",
    method: "GET",
    path: "/agents/",
    parameters: [
      {
        name: "skip",
        type: "number",
        required: false,
        isQueryParameter: true,
        description: "Skip records",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        isQueryParameter: true,
        description: "Limit records",
      },
    ],
    description: "Retrieves a list of registered agents.",
  },
  {
    id: "get_agent_by_name",
    label: "Get Agent by Name",
    method: "GET",
    path: "/agents/{agent_name}",
    parameters: [
      {
        name: "agent_name",
        type: "string",
        required: true,
        isPathParameter: true,
        description: "Name of the agent",
      },
    ],
    description: "Retrieves a specific agent by its unique name.",
  },
  {
    id: "get_agent_by_id",
    label: "Get Agent by ID",
    method: "GET",
    path: "/agents/id/{agent_id}",
    parameters: [
      {
        name: "agent_id",
        type: "number",
        required: true,
        isPathParameter: true,
        description: "ID of the agent",
      },
    ],
    description: "Retrieves a specific agent by its ID.",
  },
  {
    id: "update_agent",
    label: "Update Agent",
    method: "PUT",
    path: "/agents/{agent_id}",
    parameters: [
      {
        name: "agent_id",
        type: "number",
        required: true,
        isPathParameter: true,
        description: "ID of the agent to update",
      },
      {
        name: "body",
        type: "json_object_string",
        required: true,
        isBodyParameter: true,
        description: 'JSON: {"name"?: "string"}',
      },
    ],
    description: "Updates an existing agent.",
  },
  {
    id: "delete_agent",
    label: "Delete Agent",
    method: "DELETE",
    path: "/agents/{agent_id}",
    parameters: [
      {
        name: "agent_id",
        type: "number",
        required: true,
        isPathParameter: true,
        description: "ID of the agent to delete",
      },
    ],
    description: "Deletes an agent.",
  },
  // --- Tasks ---
  {
    id: "create_task",
    label: "Create Task",
    method: "POST",
    path: "/tasks/",
    parameters: [
      {
        name: "body",
        type: "json_object_string",
        required: true,
        isBodyParameter: true,
        description:
          'JSON: {"title": "string", "description"?: "string", "project_id"?: number, "agent_name"?: "string", "completed"?: boolean}',
      },
    ],
    description:
      "Creates a new task, optionally linking to a project and agent.",
  },
  {
    id: "get_task_list",
    label: "Get Tasks",
    method: "GET",
    path: "/tasks/",
    parameters: [
      {
        name: "skip",
        type: "number",
        required: false,
        isQueryParameter: true,
        description: "Skip records",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        isQueryParameter: true,
        description: "Limit records",
      },
      {
        name: "project_id",
        type: "number",
        required: false,
        isQueryParameter: true,
        description: "Filter by Project ID",
      },
      {
        name: "agent_name",
        type: "string",
        required: false,
        isQueryParameter: true,
        description: "Filter by Agent Name",
      },
    ],
    description: "Retrieves tasks, optionally filtered by project or agent.",
  },
  {
    id: "get_task_by_id",
    label: "Get Task by ID",
    method: "GET",
    path: "/projects/{project_id}/tasks/{task_number}",
    parameters: [
      {
        name: "project_id",
        type: "string",
        required: true,
        isPathParameter: true,
        description: "ID of the project",
      },
      {
        name: "task_number",
        type: "number",
        required: true,
        isPathParameter: true,
        description: "Number of the task within the project",
      },
    ],
    description: "Retrieves a specific task by its project ID and task number.",
  },
  {
    id: "update_task",
    label: "Update Task",
    method: "PUT",
    path: "/projects/{project_id}/tasks/{task_number}",
    parameters: [
      {
        name: "project_id",
        type: "string",
        required: true,
        isPathParameter: true,
        description: "ID of the project",
      },
      {
        name: "task_number",
        type: "number",
        required: true,
        isPathParameter: true,
        description: "Number of the task within the project",
      },
      {
        name: "body",
        type: "json_object_string",
        required: true,
        isBodyParameter: true,
        description:
          'JSON: {"title"?: "string", "description"?: "string", "project_id"?: number, "agent_name"?: "string", "completed"?: boolean}',
      },
    ],
    description: "Updates an existing task by its project ID and task number.",
  },
  {
    id: "delete_task",
    label: "Delete Task",
    method: "DELETE",
    path: "/projects/{project_id}/tasks/{task_number}",
    parameters: [
      {
        name: "project_id",
        type: "string",
        required: true,
        isPathParameter: true,
        description: "ID of the project",
      },
      {
        name: "task_number",
        type: "number",
        required: true,
        isPathParameter: true,
        description: "Number of the task within the project",
      },
    ],
    description: "Deletes a task by its project ID and task number.",
  },
  // --- Planning ---
  {
    id: "generate_planning_prompt",
    label: "Generate Planning Prompt",
    method: "POST",
    path: "/planning/generate-prompt",
    parameters: [
      {
        name: "body",
        type: "json_object_string",
        required: true,
        isBodyParameter: true,
        description: 'JSON: {"goal": "string"}',
      },
    ],
    description:
      "Generates a structured planning prompt for Overmind based on a goal.",
  },
];
