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
import { StatusID, getStatusAttributes } from "@/lib/statusUtils"; // Import StatusID and getStatusAttributes

// Intermediate raw type for tasks from backend
interface RawTask {
    id: string | number; // Backend might send number
    title: string;
    description?: string | null;
    status?: string | null; // Backend status string
    completed?: boolean | null; // Backend completed flag
    project_id?: string | number | null;
    agent_id?: string | number | null;
    agent_name?: string | null;
    parent_task_id?: string | number | null;
    created_at?: string | null;
    updated_at?: string | null;
    is_archived?: boolean | null;
    subtasks?: RawTask[] | null; // Assuming subtasks are also RawTask
    dependencies?: (string | number)[] | null; // Assuming dependencies are task IDs
    // Allow any other properties backend might send
    [key: string]: any;
}

// Intermediate raw type for projects from backend
interface RawProject {
    id: string | number;
    name: string;
    description?: string | null;
    is_archived?: boolean | null;
    created_at?: string | null;
    // Allow any other properties
    [key: string]: any;
}

// Intermediate raw type for agents from backend
interface RawAgent {
    id: string | number;
    name: string;
    created_at?: string | null;
    // Allow any other properties
    [key: string]: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Helper to normalize status string to a known StatusID
const normalizeToStatusID = (backendStatus: string | null | undefined, completedFlag: boolean): StatusID => {
    if (completedFlag) {
        return 'Completed';
    }
    if (backendStatus) {
        const lowerStatus = backendStatus.toLowerCase();
        // Exact matches first for precise StatusIDs
        if (lowerStatus === 'execution_in_progress') return 'EXECUTION_IN_PROGRESS';
        if (lowerStatus === 'to do') return 'To Do';
        if (lowerStatus === 'in progress') return 'In Progress'; // General 'In Progress'
        if (lowerStatus === 'blocked') return 'Blocked';
        if (lowerStatus === 'completed') return 'Completed'; // If backend sends 'completed' string
        if (lowerStatus === 'pending_verification') return 'PENDING_VERIFICATION';
        if (lowerStatus === 'verification_complete') return 'VERIFICATION_COMPLETE';
        if (lowerStatus === 'verification_failed') return 'VERIFICATION_FAILED';
        if (lowerStatus === 'failed') return 'FAILED';
        if (lowerStatus === 'context_acquired') return 'CONTEXT_ACQUIRED';
        if (lowerStatus === 'planning_complete') return 'PLANNING_COMPLETE';
        if (lowerStatus === 'completed_awaiting_project_manager') return 'COMPLETED_AWAITING_PROJECT_MANAGER';
        if (lowerStatus.startsWith('completed_handoff_to_')) return 'COMPLETED_HANDOFF_TO_...';
        if (lowerStatus === 'in_progress_awaiting_subtask') return 'IN_PROGRESS_AWAITING_SUBTASK';
        if (lowerStatus === 'pending_recovery_attempt') return 'PENDING_RECOVERY_ATTEMPT';
        
        // Fallback for unknown status strings - ideally, backend sends known statuses
        // or this list is exhaustive for backend strings.
        // For now, if it's an unknown non-empty string, we might default or log warning.
        // Defaulting to 'To Do' for unknown active statuses.
        console.warn(`Unknown backend status string: "${backendStatus}". Defaulting to "To Do".`);
        return 'To Do'; 
    }
    // If backendStatus is null/undefined and not completed, default to 'To Do'
    return 'To Do';
};

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
export const getTasks = async (filters?: TaskFilters): Promise<Task[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.projectId) queryParams.append('project_id', filters.projectId);
  if (filters?.agentId) queryParams.append('agent_id', filters.agentId);
  if (filters?.status && filters.status !== 'all') queryParams.append('status', String(filters.status));
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.top_level_only !== undefined) queryParams.append('top_level_only', String(filters.top_level_only));
  if (filters?.is_archived !== undefined && filters.is_archived !== null) {
    queryParams.append('is_archived', String(filters.is_archived));
  } else if (filters?.is_archived === null) {
    // If is_archived is null, don't send the param to get all (backend default or specific handling for null)
    // Or, if backend expects a specific value for "all including archived", adjust here.
    // For now, omitting the param means backend default (likely non-archived only)
    // To get ALL, the backend expects the param to be absent or specifically handled.
    // The backend GET /tasks and /projects default to is_archived=false. 
    // To get ALL, the parameter should be omitted or set to a value backend understands as "all".
    // Backend expects is_archived=null for ALL.
    // The way FastAPI handles Optional[bool] = False means if the param is NOT sent, it's False.
    // If we want all, we should send nothing, or if the backend is changed to Optional[bool]=None then sending nothing gets all
    // For now, if is_archived is null in filter, DO NOT append. If is_archived is true/false, append.
    // The backend currently interprets ABSENCE of is_archived as False.
    // To get ALL items (archived and not archived), we need a convention. The backend API for list items uses `is_archived: Optional[bool] = Query(False, ...)`
    // This means if param is NOT sent, it defaults to False (non-archived).
    // If `is_archived=True` is sent, it gets archived.
    // If we want a state for "ALL", the backend API needs to support it, e.g. by making `is_archived` truly optional (default None) in endpoint def.
    // For now, if frontend filter `is_archived` is null, we will NOT send the query param, implying the backend default (is_archived=false).
    // This means the frontend state `null` for is_archived filter will behave like `false`.
    // This needs to be aligned with store logic and UI toggles.
    // Let's assume for now, if `filters.is_archived` is null, we want `is_archived=None` behavior (fetch all)
    // The backend currently defaults to is_archived=false if the param is MISSING.
    // To get ALL, the backend expects `is_archived` to be omitted if the backend parameter is `Optional[bool] = None`
    // Given the backend is `Optional[bool] = Query(False, ...)`, if we want all, we need a different strategy, or backend change.
    // Let's stick to: if `filters.is_archived` is boolean, send it. If null, don't send (will get is_archived=false from backend).
    // This means UI will have Active (false), Archived (true). "All" needs backend support or client-side merge.
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/tasks/${queryString ? `?${queryString}` : ''}`;
  
  const rawTasks = await request<RawTask[]>(url); 
  // console.log('Raw tasks from API (api.ts) getTasks:', JSON.stringify(rawTasks, null, 2));

  const transformedTasks = rawTasks.map(rawTask => {
    const statusId = normalizeToStatusID(rawTask.status, rawTask.completed);
    return {
      id: String(rawTask.id),
      title: String(rawTask.title || ''),
      description: rawTask.description ? String(rawTask.description) : null,
      status: statusId,
      completed: statusId === 'Completed' || getStatusAttributes(statusId)?.category === 'completed' || getStatusAttributes(statusId)?.category === 'failed',
      project_id: rawTask.project_id ? String(rawTask.project_id) : null,
      agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
      agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
      parent_task_id: rawTask.parent_task_id ? String(rawTask.parent_task_id) : null,
      created_at: String(rawTask.created_at || new Date().toISOString()),
      updated_at: String(rawTask.updated_at || new Date().toISOString()),
      is_archived: !!rawTask.is_archived,
      subtasks: rawTask.subtasks || [],
      dependencies: rawTask.dependencies || [],
      ...rawTask,
      status: statusId,
      is_archived: !!rawTask.is_archived,
    } as Task;
  });
  console.log('Transformed tasks for store (api.ts) getTasks:', JSON.stringify(transformedTasks, null, 2));
  return transformedTasks;
};

// Fetch a single task by ID
export const getTaskById = async (task_id: string, is_archived?: boolean | null): Promise<Task> => {
  const queryParams = new URLSearchParams();
  if (is_archived !== undefined && is_archived !== null) {
    queryParams.append('is_archived', String(is_archived));
  }
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/tasks/${task_id}${queryString ? `?${queryString}` : ''}`;

  const rawTask = await request<RawTask>(url);
  const statusId = normalizeToStatusID(rawTask.status, rawTask.completed);
  
  const transformedTask = {
    id: String(rawTask.id),
    title: String(rawTask.title || ''),
    description: rawTask.description ? String(rawTask.description) : null,
    status: statusId,
    completed: statusId === 'Completed' || getStatusAttributes(statusId)?.category === 'completed' || getStatusAttributes(statusId)?.category === 'failed',
    project_id: rawTask.project_id ? String(rawTask.project_id) : null,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    parent_task_id: rawTask.parent_task_id ? String(rawTask.parent_task_id) : null,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    is_archived: !!rawTask.is_archived,
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
    ...rawTask,
    status: statusId,
    is_archived: !!rawTask.is_archived,
  } as Task;
  console.log('Transformed single task for store (api.ts) getTaskById:', JSON.stringify(transformedTask, null, 2));
  return transformedTask;
};

// Create a new task
export const createTask = async (taskData: TaskCreateData): Promise<Task> => {
  const rawTask = await request<RawTask>(`${API_BASE_URL}/tasks/`, { method: 'POST', body: JSON.stringify(taskData) });
  const statusId = normalizeToStatusID(rawTask.status, rawTask.completed);
  
  const transformedTask = {
    id: String(rawTask.id),
    title: String(rawTask.title || ''),
    description: rawTask.description ? String(rawTask.description) : null,
    status: statusId,
    completed: statusId === 'Completed' || getStatusAttributes(statusId)?.category === 'completed' || getStatusAttributes(statusId)?.category === 'failed',
    project_id: rawTask.project_id ? String(rawTask.project_id) : null,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    parent_task_id: rawTask.parent_task_id ? String(rawTask.parent_task_id) : null,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
    ...rawTask,
    status: statusId,
  } as Task;
  console.log('Transformed task for store (api.ts) createTask:', JSON.stringify(transformedTask, null, 2));
  return transformedTask;
};

// Update an existing task
export const updateTask = async (task_id: string, taskData: TaskUpdateData): Promise<Task> => {
  const payload: Partial<RawTask> = { ...taskData };

  if (typeof payload.completed === 'boolean') {
    payload.status = payload.completed ? 'Completed' : 'To Do';
    delete payload.completed;
  }

  const rawTask = await request<RawTask>(`${API_BASE_URL}/tasks/${task_id}`, { method: 'PUT', body: JSON.stringify(payload) });
  const statusId = normalizeToStatusID(rawTask.status, rawTask.completed);

  const transformedTask = {
    id: String(rawTask.id),
    title: String(rawTask.title || ''),
    description: rawTask.description ? String(rawTask.description) : null,
    status: statusId,
    completed: statusId === 'Completed' || getStatusAttributes(statusId)?.category === 'completed' || getStatusAttributes(statusId)?.category === 'failed',
    project_id: rawTask.project_id ? String(rawTask.project_id) : null,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    parent_task_id: rawTask.parent_task_id ? String(rawTask.parent_task_id) : null,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
    ...rawTask,
    status: statusId,
  } as Task;
  console.log('Transformed task for store (api.ts) updateTask:', JSON.stringify(transformedTask, null, 2));
  return transformedTask;
};

// Delete a task
export const deleteTask = async (task_id: string): Promise<Task> => {
  // Assuming the backend returns the deleted task object or similar structure
  const rawTask = await request<RawTask>(`${API_BASE_URL}/tasks/${task_id}`, { method: 'DELETE' });
  
  // If backend returns 204 No Content for DELETE, rawTask might be null or undefined depending on request helper
  // For now, assuming it returns a task-like structure. Adjust if it returns nothing or just an ID.
  if (!rawTask) {
    // Handle cases where backend might return nothing on delete, or throw if unexpected.
    // For now, we construct a minimal Task-like object if needed, or this could throw an error.
    // This depends on how the store and UI expect deletes to behave.
    // Let's assume for now that if rawTask is null/undefined, we indicate deletion without full task data.
    // This is a placeholder; actual handling might differ based on application logic.
    console.warn(`Task ${task_id} deleted, but no content returned from backend. Returning minimal confirmation.`);
    // It might be better to have deleteTask return Promise<void> or Promise<string> (the ID) if no content is returned.
    // Forcing a Task type here if backend gives nothing is problematic.
    // Let's assume backend DOES return the deleted task for now, as per Promise<Task> signature.
    // If not, the return type of this function should change.
    throw new Error(`Task ${task_id} deleted, but backend did not return the task object.`);
  }

  const statusId = normalizeToStatusID(rawTask.status, rawTask.completed);
  return {
    id: String(rawTask.id),
    title: String(rawTask.title || ''),
    description: rawTask.description ? String(rawTask.description) : null,
    status: statusId,
    completed: statusId === 'Completed' || getStatusAttributes(statusId)?.category === 'completed' || getStatusAttributes(statusId)?.category === 'failed',
    project_id: rawTask.project_id ? String(rawTask.project_id) : null,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    parent_task_id: rawTask.parent_task_id ? String(rawTask.parent_task_id) : null,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    is_archived: !!rawTask.is_archived, 
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
    ...rawTask,
    status: statusId,
    is_archived: !!rawTask.is_archived,
  } as Task;
};

// Fetch all projects
export const getProjects = async (filters?: ProjectFilters): Promise<Project[]> => {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.is_archived !== undefined && filters?.is_archived !== null) {
        queryParams.append('is_archived', String(filters.is_archived));
    }
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/projects/${queryString ? `?${queryString}` : ''}`;
    const rawProjects = await request<RawProject[]>(url);

    return rawProjects.map(rawProject => ({
        ...rawProject, // Spread rawProject first
        id: String(rawProject.id),
        name: String(rawProject.name || ''),
        description: rawProject.description ? String(rawProject.description) : null,
        is_archived: !!rawProject.is_archived,
        created_at: String(rawProject.created_at || new Date().toISOString()),
        task_count: typeof rawProject.task_count === 'number' ? rawProject.task_count : 0, // Ensure task_count is a number
    }));
};

// Fetch a single project by ID
export const getProjectById = async (projectId: string, is_archived?: boolean | null): Promise<Project> => {
    const queryParams = new URLSearchParams();
    if (is_archived !== undefined && is_archived !== null) {
        queryParams.append('is_archived', String(is_archived));
    }
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/projects/${projectId}${queryString ? `?${queryString}` : ''}`;
    const rawProject = await request<RawProject>(url);
    return {
        ...rawProject,
        id: String(rawProject.id),
        name: String(rawProject.name || ''),
        description: rawProject.description ? String(rawProject.description) : null,
        is_archived: !!rawProject.is_archived,
        created_at: String(rawProject.created_at || new Date().toISOString()),
        task_count: typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
    };
};

// Create a new project
export const createProject = async (projectData: ProjectCreateData): Promise<Project> => {
    const rawProject = await request<RawProject>(`${API_BASE_URL}/projects/`, { method: 'POST', body: JSON.stringify(projectData) });
    return {
        ...rawProject,
        id: String(rawProject.id),
        name: String(rawProject.name || ''),
        description: rawProject.description ? String(rawProject.description) : null,
        is_archived: !!rawProject.is_archived,
        created_at: String(rawProject.created_at || new Date().toISOString()),
        task_count: typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
    };
};

// Update an existing project
export const updateProject = async (project_id: string, projectData: ProjectUpdateData): Promise<Project> => {
    const rawProject = await request<RawProject>(`${API_BASE_URL}/projects/${project_id}`, { method: 'PUT', body: JSON.stringify(projectData) });
    return {
        ...rawProject,
        id: String(rawProject.id),
        name: String(rawProject.name || ''),
        description: rawProject.description ? String(rawProject.description) : null,
        is_archived: !!rawProject.is_archived,
        created_at: String(rawProject.created_at || new Date().toISOString()),
        task_count: typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
    };
};

// Delete a project
export const deleteProject = async (project_id: string): Promise<Project> => { // Assuming backend returns the deleted project
    const rawProject = await request<RawProject>(`${API_BASE_URL}/projects/${project_id}`, { method: 'DELETE' });
    return {
        ...rawProject,
        id: String(rawProject.id),
        name: String(rawProject.name || ''),
        description: rawProject.description ? String(rawProject.description) : null,
        is_archived: !!rawProject.is_archived,
        created_at: String(rawProject.created_at || new Date().toISOString()),
        task_count: typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
    };
};

// Fetch all agents
export const getAgents = async (filters?: AgentFilters): Promise<Agent[]> => {
    const queryParams = new URLSearchParams();
    if (filters?.search) queryParams.append('search', filters.search);
    // Add other agent filters if any, e.g., status, is_archived
    if (filters?.is_archived !== undefined && filters?.is_archived !== null) {
        queryParams.append('is_archived', String(filters.is_archived));
    }
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/agents/${queryString ? `?${queryString}` : ''}`;
    const rawAgents = await request<RawAgent[]>(url);
    return rawAgents.map(rawAgent => ({
        ...rawAgent,
        id: String(rawAgent.id),
        name: String(rawAgent.name || ''),
        created_at: String(rawAgent.created_at || new Date().toISOString()),
    }));
};

export const getAgentById = async (agent_id: string): Promise<Agent> => {
    const rawAgent = await request<RawAgent>(`${API_BASE_URL}/agents/${agent_id}`);
    return {
        ...rawAgent,
        id: String(rawAgent.id),
        name: String(rawAgent.name || ''),
        created_at: String(rawAgent.created_at || new Date().toISOString()),
    };
};

export const getAgentByName = async (agent_name: string): Promise<Agent> => {
    // Backend might need a specific endpoint like /agents/name/{agent_name} or query param
    const rawAgent = await request<RawAgent>(`${API_BASE_URL}/agents/name/${agent_name}`);
    return {
        ...rawAgent,
        id: String(rawAgent.id),
        name: String(rawAgent.name || ''),
        created_at: String(rawAgent.created_at || new Date().toISOString()),
    };
};

export const createAgent = async (name: string): Promise<Agent> => {
    const rawAgent = await request<RawAgent>(`${API_BASE_URL}/agents/`, { method: 'POST', body: JSON.stringify({ name }) });
    return {
        ...rawAgent,
        id: String(rawAgent.id),
        name: String(rawAgent.name || ''),
        created_at: String(rawAgent.created_at || new Date().toISOString()),
    };
};

export const updateAgentById = async (agent_id: string, agentData: AgentUpdateDataType): Promise<Agent> => {
    const rawAgent = await request<RawAgent>(`${API_BASE_URL}/agents/${agent_id}`, { method: 'PUT', body: JSON.stringify(agentData) });
    return {
        ...rawAgent,
        id: String(rawAgent.id),
        name: String(rawAgent.name || ''),
        created_at: String(rawAgent.created_at || new Date().toISOString()),
    };
};

export const deleteAgentById = async (agent_id: string): Promise<null> => {
    await request<null>(`${API_BASE_URL}/agents/${agent_id}`, { method: 'DELETE' });
    return null;
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

// --- Task Archive/Unarchive ---
export const archiveTask = async (taskId: string): Promise<Task> => {
    const rawTask = await request<RawTask>(`${API_BASE_URL}/tasks/${taskId}/archive`, { method: 'POST' });
    const statusId = normalizeToStatusID(rawTask.status, rawTask.completed);
    return {
        ...rawTask,
        id: String(rawTask.id),
        status: statusId,
        completed: statusId === 'Completed' || getStatusAttributes(statusId)?.category === 'completed' || getStatusAttributes(statusId)?.category === 'failed',
        is_archived: true, // Explicitly set after archiving
        subtasks: rawTask.subtasks || [],
        dependencies: rawTask.dependencies || [],
        ...rawTask, // spread last to ensure our explicit ones take precedence if backend sends conflicting structure
        status: statusId,
        is_archived: true, 
    } as Task;
};

export const unarchiveTask = async (taskId: string): Promise<Task> => {
    const rawTask = await request<RawTask>(`${API_BASE_URL}/tasks/${taskId}/unarchive`, { method: 'POST' });
    const statusId = normalizeToStatusID(rawTask.status, rawTask.completed);
    return {
        ...rawTask,
        id: String(rawTask.id),
        status: statusId,
        completed: statusId === 'Completed' || getStatusAttributes(statusId)?.category === 'completed' || getStatusAttributes(statusId)?.category === 'failed',
        is_archived: false, // Explicitly set after unarchiving
        subtasks: rawTask.subtasks || [],
        dependencies: rawTask.dependencies || [],
        ...rawTask,
        status: statusId,
        is_archived: false,
    } as Task;
};

// --- Project Archive/Unarchive ---
export const archiveProject = async (projectId: string): Promise<Project> => {
    const rawProject = await request<RawProject>(`${API_BASE_URL}/projects/${projectId}/archive`, { method: 'POST' });
    return {
        ...rawProject,
        id: String(rawProject.id),
        name: String(rawProject.name || ''),
        description: rawProject.description ? String(rawProject.description) : null,
        is_archived: true,
        created_at: String(rawProject.created_at || new Date().toISOString()),
        task_count: typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
        ...rawProject,
        is_archived: true,
    } as Project;
};

export const unarchiveProject = async (projectId: string): Promise<Project> => {
    const rawProject = await request<RawProject>(`${API_BASE_URL}/projects/${projectId}/unarchive`, { method: 'POST' });
    return {
        ...rawProject,
        id: String(rawProject.id),
        name: String(rawProject.name || ''),
        description: rawProject.description ? String(rawProject.description) : null,
        is_archived: false,
        created_at: String(rawProject.created_at || new Date().toISOString()),
        task_count: typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
        ...rawProject,
        is_archived: false,
    } as Project;
};
