// D:\mcp\task-manager\frontend\src\services\api.ts
import { 
    TaskFilters, 
    Task, 
    TaskCreateData, 
    TaskUpdateData, 
    Project, 
    ProjectCreateData, 
    ProjectUpdateData, 
    ProjectFilters, // Added ProjectFilters here
    // Agent related types are now imported
    Agent,
    AgentUpdateData as AgentUpdateDataType, // Alias
    AgentFilters, // Imported
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Helper function to handle API requests
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Conditionally add Content-Type for methods that typically have a body
  const method = options.method?.toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers, // Use the modified headers object
  });
  if (!response.ok) {
    console.error(`API request failed for URL: ${url}`, { status: response.status, options });
    let errorDetail = `API request failed with status ${response.status} for ${url}`; // Default generic message
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorDetail = errorData.detail;
      } else {
        errorDetail = response.statusText || errorDetail; // Use statusText if detail is not present
      }
    } catch (e) {
      // JSON parsing failed, stick with the more generic error or statusText
      console.warn(`Failed to parse error response as JSON for URL: ${url}`, e);
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }
  // For DELETE requests, backend might return the deleted object or no content
  if (response.status === 204) { 
    return null as T; // Or handle as needed, maybe a specific type for no content
  }
  return response.json();
}

// Fetch all tasks
export const getTasks = (filters?: TaskFilters): Promise<Task[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.projectId) queryParams.append('project_id', filters.projectId);
  if (filters?.agentId) queryParams.append('agent_id', filters.agentId);
  if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status.toString());
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.top_level_only !== undefined) queryParams.append('top_level_only', String(filters.top_level_only));

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/tasks/${queryString ? `?${queryString}` : ''}`;
  return request<Task[]>(url);
};

// Fetch a single task by ID
export const getTaskById = (task_id: string): Promise<Task> => { // Changed id to task_id
  return request<Task>(`${API_BASE_URL}/tasks/${task_id}`); // Use task_id
};

// Create a new task
export const createTask = (taskData: TaskCreateData): Promise<Task> => {
  return request<Task>(`${API_BASE_URL}/tasks/`, { method: 'POST', body: JSON.stringify(taskData) });
};

// Update an existing task
export const updateTask = (task_id: string, taskData: TaskUpdateData): Promise<Task> => { // Changed id to task_id
  return request<Task>(`${API_BASE_URL}/tasks/${task_id}`, { method: 'PUT', body: JSON.stringify(taskData) }); // Use task_id
};

// Delete a task
export const deleteTask = (task_id: string): Promise<Task> => { // Changed id to task_id
  return request<Task>(`${API_BASE_URL}/tasks/${task_id}`, { method: 'DELETE' }); // Use task_id
};

// Fetch all projects
export const getProjects = (filters?: ProjectFilters): Promise<Project[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status);
  if (filters?.agentId) queryParams.append('agent_id', filters.agentId);
  return request<Project[]>(`${API_BASE_URL}/projects/?${queryParams.toString()}`);
};

// Create a new project
export const createProject = (projectData: ProjectCreateData): Promise<Project> => {
  return request<Project>(`${API_BASE_URL}/projects/`, { method: 'POST', body: JSON.stringify(projectData) });
};

// Update an existing project
export const updateProject = (project_id: string, projectData: ProjectUpdateData): Promise<Project> => { // Changed id to project_id
  return request<Project>(`${API_BASE_URL}/projects/${project_id}`, { method: 'PUT', body: JSON.stringify(projectData) }); // Use project_id
};

// Delete a project
export const deleteProject = (project_id: string): Promise<Project> => { // Changed id to project_id
  return request<Project>(`${API_BASE_URL}/projects/${project_id}`, { method: 'DELETE' }); // Use project_id
};

// Fetch all agents
export const getAgents = (filters?: AgentFilters): Promise<Agent[]> => { // Uses imported AgentFilters
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status);
  if (filters?.projectId) queryParams.append('project_id', filters.projectId); // Added project_id parameter
  return request<Agent[]>(`${API_BASE_URL}/agents/?${queryParams.toString()}`);
};

// Fetch agent by ID
export const getAgentById = (agent_id: string): Promise<Agent> => { // Changed id to agent_id
  return request<Agent>(`${API_BASE_URL}/agents/${agent_id}`); // Changed path and use agent_id
};

// Fetch agent by Name
export const getAgentByName = (agent_name: string): Promise<Agent> => { // Changed name to agent_name
  return request<Agent>(`${API_BASE_URL}/agents/name/${agent_name}`); // Changed path to match backend
};

// Function to create a new agent
export const createAgent = async (name: string): Promise<Agent> => {
    console.log(`[API Service] Attempting to create agent with name: ${name}`);
    // Now uses the centralized request helper
    return request<Agent>(`${API_BASE_URL}/agents/`, {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
};

// Function to update an agent (Placeholder - Not implemented yet)
// ...

// Function to delete an agent (Placeholder - Not implemented yet)
// ...

// UPDATE Agent by ID
export const updateAgentById = (agent_id: string, agentData: AgentUpdateDataType): Promise<Agent> => {
  return request<Agent>(`${API_BASE_URL}/agents/${agent_id}`, { method: 'PUT', body: JSON.stringify(agentData) });
};

// DELETE Agent by ID
export const deleteAgentById = (agent_id: string): Promise<null> => { // DELETE might return 204 No Content
  return request<null>(`${API_BASE_URL}/agents/${agent_id}`, { method: 'DELETE' });
};

// --- Planning Prompt Interfaces ---
export interface PlanningRequestData {
    goal: string;
}

export interface PlanningResponseData {
    prompt: string;
}

// generatePlanningPrompt (removed as unused)

// New function for Project Manager Planning Prompt
export const generateProjectManagerPlanningPrompt = (data: PlanningRequestData): Promise<PlanningResponseData> => {
  return request<PlanningResponseData>(`${API_BASE_URL}/projects/generate-planning-prompt`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Define TaskUpdateData based on Task but make fields optional and exclude read-only ones
export type TaskUpdateData = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
export type TaskCreateData = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type ProjectUpdateData = Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'task_count'>>;
export type ProjectCreateData = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'task_count'>;
export type AgentUpdateData = Partial<Omit<Agent, 'id' | 'created_at' | 'updated_at' | 'task_count'>>;
export type AgentCreateData = Omit<Agent, 'id' | 'created_at' | 'updated_at' | 'task_count'>; // Use this instead of alias

// Define TaskFilters - same as in store/taskStore.ts for consistency
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TaskFilters {
// ... existing code ...
}
