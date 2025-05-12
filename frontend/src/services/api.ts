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
    AgentCreateData as AgentCreateDataType, // Alias to avoid naming conflict if local types were kept
    AgentUpdateData as AgentUpdateDataType, // Alias
    AgentFilters, // Imported
} from "@/types";

// Remove local Agent interface definitions
// interface Agent { ... }
// interface AgentCreateData { ... }
// interface AgentUpdateData { ... }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

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
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(errorData.detail || 'API request failed');
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

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/tasks/${queryString ? `?${queryString}` : ''}`;
  return request<Task[]>(url);
};

// Fetch a single task by ID
export const getTaskById = (id: string): Promise<Task> => { // id: string
  return request<Task>(`${API_BASE_URL}/tasks/${id}`);
};

// Create a new task
export const createTask = (taskData: TaskCreateData): Promise<Task> => {
  return request<Task>(`${API_BASE_URL}/tasks/`, { method: 'POST', body: JSON.stringify(taskData) });
};

// Update an existing task
export const updateTask = (id: string, taskData: TaskUpdateData): Promise<Task> => { // id: string
  return request<Task>(`${API_BASE_URL}/tasks/${id}`, { method: 'PUT', body: JSON.stringify(taskData) });
};

// Delete a task
export const deleteTask = (id: string): Promise<Task> => { // id: string, Backend returns deleted task
  return request<Task>(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
};

// Fetch all projects
export const getProjects = (filters?: ProjectFilters): Promise<Project[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status);
  return request<Project[]>(`${API_BASE_URL}/projects/?${queryParams.toString()}`);
};

// Create a new project
export const createProject = (projectData: ProjectCreateData): Promise<Project> => {
  return request<Project>(`${API_BASE_URL}/projects/`, { method: 'POST', body: JSON.stringify(projectData) });
};

// Update an existing project
export const updateProject = (id: string, projectData: ProjectUpdateData): Promise<Project> => { // id: string
  return request<Project>(`${API_BASE_URL}/projects/${id}`, { method: 'PUT', body: JSON.stringify(projectData) });
};

// Delete a project
export const deleteProject = (id: string): Promise<Project> => { // id: string
  return request<Project>(`${API_BASE_URL}/projects/${id}`, { method: 'DELETE' });
};

// Fetch all agents
export const getAgents = (filters?: AgentFilters): Promise<Agent[]> => { // Uses imported AgentFilters
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status);
  return request<Agent[]>(`${API_BASE_URL}/agents/?${queryParams.toString()}`);
};

// Fetch agent by ID
export const getAgentById = (id: string): Promise<Agent> => { // id: string
  return request<Agent>(`${API_BASE_URL}/agents/id/${id}`);
};

// Fetch agent by Name
export const getAgentByName = (name: string): Promise<Agent> => {
  return request<Agent>(`${API_BASE_URL}/agents/${name}`);
};

// Create a new agent
export const createAgent = (agentData: AgentCreateDataType): Promise<Agent> => { // Uses aliased type
  return request<Agent>(`${API_BASE_URL}/agents/`, { method: 'POST', body: JSON.stringify(agentData) });
};

// Update an existing agent
export const updateAgent = (id: string, agentData: AgentUpdateDataType): Promise<Agent> => { // id: string, uses aliased type
  return request<Agent>(`${API_BASE_URL}/agents/${id}`, { method: 'PUT', body: JSON.stringify(agentData) });
};

// Delete an agent
export const deleteAgent = (id: string): Promise<Agent> => { // id: string
  return request<Agent>(`${API_BASE_URL}/agents/${id}`, { method: 'DELETE' });
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
