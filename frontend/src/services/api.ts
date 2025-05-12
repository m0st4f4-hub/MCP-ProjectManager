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
import axios from 'axios';
import { AgentTaskCount, ProjectTaskCount } from '@/types';

// Remove local Agent interface definitions
// interface Agent { ... }
// interface AgentCreateData { ... }
// interface AgentUpdateData { ... }

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
  if (filters?.agentName) queryParams.append('agent_name', filters.agentName);
  if (filters?.status && filters.status !== 'all') queryParams.append('status', filters.status.toString());
  if (filters?.search) queryParams.append('search', filters.search);

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
    try {
        const response = await fetch(`${API_BASE_URL}/agents/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });
        console.log(`[API Service] Create agent response status: ${response.status}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: response.statusText }));
            console.error('[API Service] Create agent failed:', errorData);
            throw new Error(errorData.detail || `HTTP error ${response.status}`);
        }
        const newAgent: Agent = await response.json();
        console.log('[API Service] Agent created successfully:', newAgent);
        return newAgent;
    } catch (error) {
        console.error('[API Service] Error in createAgent:', error);
        throw error; // Re-throw the error to be handled by the store
    }
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
// export type AgentCreateDataType = Omit<Agent, 'id' | 'created_at' | 'updated_at' | 'task_count'>; // Removed unused type

// Define TaskFilters - same as in store/taskStore.ts for consistency
export interface TaskFilters {
// ... existing code ...
}
