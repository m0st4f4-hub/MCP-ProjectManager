// D:\mcp\task-manager\frontend\src\services\api.ts

// Define the structure of a Task object based on backend schema
export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string; // Keep as string for simplicity, can parse if needed
  updated_at: string | null; // Keep as string
  project_id: number | null;
  agent_name: string | null;
  project: Project | null; // Include nested project
  agent: Agent | null; // Add nested agent
  [key: string]: unknown; // Add index signature
}

// Define the structure for creating a Task
export interface TaskCreateData {
  title: string;
  description?: string;
  project_id?: number;
  agent_name?: string;
  completed?: boolean; // Allow setting initial completed state
}

// Define the structure for updating a Task (all fields optional)
export interface TaskUpdateData {
  title?: string;
  description?: string;
  completed?: boolean;
  project_id?: number;
  agent_name?: string;
}

// Define the structure of a Project object based on backend schema
export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  [key: string]: unknown; // Add index signature
  // tasks: Task[]; // If you need to show tasks under a project
}

// Define types for creating and updating Projects
export interface ProjectCreateData {
  name: string;
  description?: string;
}

export interface ProjectUpdateData {
  name?: string;
  description?: string;
}

// Define the structure of an Agent object based on backend schema
export interface Agent {
  id: number;
  name: string;
  created_at: string;
  [key: string]: unknown; // Use unknown instead of any for better type safety
  // tasks: Task[]; // Example, if needed
}

// Define types for creating and updating Agents
export interface AgentCreateData {
  name: string;
}

export interface AgentUpdateData {
  name?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to handle API requests
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
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
export const getTasks = (filters?: { projectId?: number; agentName?: string }): Promise<Task[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.projectId) queryParams.append('project_id', filters.projectId.toString());
  if (filters?.agentName) queryParams.append('agent_name', filters.agentName);
  return request<Task[]>(`${API_BASE_URL}/tasks/?${queryParams.toString()}`);
};

// Fetch a single task by ID
export const getTaskById = (id: number): Promise<Task> => {
  return request<Task>(`${API_BASE_URL}/tasks/${id}`);
};

// Create a new task
export const createTask = (taskData: TaskCreateData): Promise<Task> => {
  return request<Task>(`${API_BASE_URL}/tasks/`, { method: 'POST', body: JSON.stringify(taskData) });
};

// Update an existing task
export const updateTask = (id: number, taskData: TaskUpdateData): Promise<Task> => {
  return request<Task>(`${API_BASE_URL}/tasks/${id}`, { method: 'PUT', body: JSON.stringify(taskData) });
};

// Delete a task
export const deleteTask = (id: number): Promise<Task> => { // Backend returns deleted task
  return request<Task>(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
};

// Fetch all projects
export const getProjects = (): Promise<Project[]> => {
  return request<Project[]>(`${API_BASE_URL}/projects/`);
};

// Create a new project
export const createProject = (projectData: ProjectCreateData): Promise<Project> => {
  return request<Project>(`${API_BASE_URL}/projects/`, { method: 'POST', body: JSON.stringify(projectData) });
};

// Update an existing project
export const updateProject = (id: number, projectData: ProjectUpdateData): Promise<Project> => {
  return request<Project>(`${API_BASE_URL}/projects/${id}`, { method: 'PUT', body: JSON.stringify(projectData) });
};

// Delete a project
export const deleteProject = (id: number): Promise<Project> => {
  return request<Project>(`${API_BASE_URL}/projects/${id}`, { method: 'DELETE' });
};

// Fetch all agents
export const getAgents = (): Promise<Agent[]> => {
  return request<Agent[]>(`${API_BASE_URL}/agents/`);
};

// Fetch agent by ID
export const getAgentById = (id: number): Promise<Agent> => {
  return request<Agent>(`${API_BASE_URL}/agents/id/${id}`);
};

// Fetch agent by Name
export const getAgentByName = (name: string): Promise<Agent> => {
  return request<Agent>(`${API_BASE_URL}/agents/${name}`);
};

// Create a new agent
export const createAgent = (agentData: AgentCreateData): Promise<Agent> => {
  return request<Agent>(`${API_BASE_URL}/agents/`, { method: 'POST', body: JSON.stringify(agentData) });
};

// Update an existing agent
export const updateAgent = (id: number, agentData: AgentUpdateData): Promise<Agent> => {
  return request<Agent>(`${API_BASE_URL}/agents/${id}`, { method: 'PUT', body: JSON.stringify(agentData) });
};

// Delete an agent
export const deleteAgent = (id: number): Promise<Agent> => {
  return request<Agent>(`${API_BASE_URL}/agents/${id}`, { method: 'DELETE' });
};

// --- Planning Prompt Interfaces ---
export interface PlanningRequestData {
    goal: string;
}

export interface PlanningResponseData {
    prompt: string;
}

export const generatePlanningPrompt = (goal: string): Promise<PlanningResponseData> => {
    return request<PlanningResponseData>(`${API_BASE_URL}/planning/generate-prompt`, {
        method: 'POST',
        body: JSON.stringify({ goal } as PlanningRequestData),
    });
};
