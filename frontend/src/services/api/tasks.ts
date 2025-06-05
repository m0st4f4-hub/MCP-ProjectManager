import {
  TaskFilters,
  Task,
  TaskCreateData,
  TaskUpdateData,
  TaskFileAssociation,
  TaskFileAssociationCreateData,
  TaskDependency,
  TaskDependencyCreateData,
  TaskSortOptions,
  TaskStatus,
  Comment,
  CommentCreateData,
} from "@/types";
import { request, normalizeToStatusID } from "./request";
import { buildApiUrl, API_CONFIG } from "./config";
import { StatusID } from "@/lib/statusUtils";

// Convert StatusID to TaskStatus enum (now simplified since formats match)
const convertStatusIDToTaskStatus = (statusId: StatusID): TaskStatus => {
  // Direct mapping since both use the same format
  switch (statusId) {
    case TaskStatus.TO_DO:
      return TaskStatus.TO_DO;
    case TaskStatus.IN_PROGRESS:
      return TaskStatus.IN_PROGRESS;
    case TaskStatus.IN_REVIEW:
      return TaskStatus.IN_REVIEW;
    case TaskStatus.COMPLETED:
      return TaskStatus.COMPLETED;
    case TaskStatus.BLOCKED:
      return TaskStatus.BLOCKED;
    case TaskStatus.CANCELLED:
      return TaskStatus.CANCELLED;
    default:
      return TaskStatus.TO_DO;
  }
};

// Intermediate raw type for tasks from backend
interface RawTask {
  project_id: string | number;
  task_number: number;
  title: string;
  description?: string | null;
  status?: string | null;
  completed?: boolean | null;
  agent_id?: string | number | null;
  agent_name?: string | null;
  agent_status?: string | null;
  parent_task_id?: string | number | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_archived?: boolean | null;
  subtasks?: RawTask[] | null;
  dependencies?: { project_id: string | number; task_number: number }[] | null;
  [key: string]: unknown;
}

// --- Task File Association API --- // New section

// Associate a file with a task
export const associateFileWithTask = async (
  project_id: string,
  task_number: number,
  fileAssociationData: TaskFileAssociationCreateData // Should contain file_id
): Promise<TaskFileAssociation> => {
  return request<TaskFileAssociation>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}/files/`),
    { method: "POST", body: JSON.stringify(fileAssociationData) }
  );
};

// Get files associated with a task
export const getFilesAssociatedWithTask = async (
  project_id: string,
  task_number: number,
  skip: number = 0,
  limit: number = 100,
  sort_by?: string,
  sort_direction?: string,
  filename?: string
): Promise<TaskFileAssociation[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append("skip", String(skip));
  queryParams.append("limit", String(limit));
  if (sort_by) queryParams.append("sort_by", sort_by);
  if (sort_direction) queryParams.append("sort_direction", sort_direction);
  if (filename) queryParams.append("filename", filename);
  const queryString = queryParams.toString();
  const url = buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}/files/${queryString ? `?${queryString}` : ""}`);
  return request<TaskFileAssociation[]>(url);
};

// Get a specific task file association by file ID
export const getTaskFileAssociationByFileId = async (
  project_id: string,
  task_number: number,
  file_id: string
): Promise<TaskFileAssociation> => {
  return request<TaskFileAssociation>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}/files/${file_id}`)
  );
};

// Disassociate a file from a task
export const disassociateFileFromTask = async (
  project_id: string,
  task_number: number,
  file_id: string
): Promise<void> => { // Assuming backend returns success, not the object
  await request<void>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}/files/${file_id}`),
    { method: "DELETE" }
  );
};

// --- Task Dependency API --- // New section

// Add a task dependency
export const addTaskDependency = async (
  project_id: string,
  task_number: number,
  dependencyData: TaskDependencyCreateData // Should contain dependent and depends_on info
): Promise<TaskDependency> => {
  return request<TaskDependency>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}/dependencies/`),
    { method: "POST", body: JSON.stringify(dependencyData) }
  );
};

// Get all task dependencies (both predecessors and successors related to this task)
export const getAllTaskDependencies = async (
  project_id: string,
  task_number: number
): Promise<TaskDependency[]> => {
    // Backend provides separate endpoints for predecessors and successors.
    // We can fetch both and combine, or provide separate functions.
    // For now, providing separate functions based on available backend endpoints.
    // This function could call the other two and combine results if needed.
    // Let's just add the specific backend endpoints for now.
    throw new Error("Backend does not have a single endpoint for all dependencies. Use getTaskPredecessors and getTaskSuccessors.");
};

// Get task predecessors (tasks that this task depends on)
export const getTaskPredecessors = async (
    project_id: string,
    task_number: number
  ): Promise<TaskDependency[]> => {
    return request<TaskDependency[]>(
      buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}/dependencies/predecessors/`)
    );
  };

// Get task successors (tasks that depend on this task)
export const getTaskSuccessors = async (
  project_id: string,
  task_number: number
): Promise<TaskDependency[]> => {
  return request<TaskDependency[]>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}/dependencies/successors/`)
  );
};

// Remove a task dependency
export const removeTaskDependency = async (
  project_id: string,
  task_number: number, // The task from which the dependency is being removed
  predecessor_project_id: string,
  predecessor_task_number: number
): Promise<void> => { // Assuming backend returns success, not the object
    // Note: Backend DELETE endpoint uses predecessor_project_id and predecessor_task_number
    // in the path, not in the body.
  await request<void>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}/dependencies/${predecessor_project_id}/${predecessor_task_number}`),
    { method: "DELETE" }
  );
};

// Fetch all tasks
export const getTasks = async (
  projectId: string,
  filters?: TaskFilters,
  sortOptions?: TaskSortOptions,
  page = 0,
  pageSize = 100,
): Promise<Task[]> => {
  const skip = page * pageSize;
  const limit = pageSize;
  const queryParams = new URLSearchParams();
  if (filters?.agentId) queryParams.append("agent_id", filters.agentId);
  if (filters?.status && filters.status !== "all")
    queryParams.append("status", String(filters.status));
  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.is_archived !== undefined && filters.is_archived !== null) {
    queryParams.append("is_archived", String(filters.is_archived));
  }
  // Add pagination and sorting parameters if provided
  queryParams.append("skip", String(skip));
  queryParams.append("limit", String(limit));
  // Add sorting parameters if provided
  if (sortOptions) {
    if (sortOptions.field) queryParams.append("sort_by", sortOptions.field);
    if (sortOptions.direction) queryParams.append("sort_direction", sortOptions.direction);
  }
  const queryString = queryParams.toString();
  const url = buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${projectId}/tasks${queryString ? `?${queryString}` : ""}`);
  const rawTasks = await request<RawTask[]>(url);
  return rawTasks.map((rawTask) => {
    const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
    return {
      ...rawTask,
      id: `${rawTask.project_id}-${rawTask.task_number}`, // Computed ID for frontend compatibility
      project_id: String(rawTask.project_id),
      task_number: Number(rawTask.task_number),
      title: String(rawTask.title || ""),
      description: rawTask.description ? String(rawTask.description) : null,
      status: convertStatusIDToTaskStatus(statusId),
      agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
      agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
      agent_status: rawTask.agent_status ? String(rawTask.agent_status) : undefined,
      created_at: String(rawTask.created_at || new Date().toISOString()),
      updated_at: String(rawTask.updated_at || new Date().toISOString()),
      is_archived: !!rawTask.is_archived,
      subtasks: rawTask.subtasks || [],
      dependencies: rawTask.dependencies || [],
    } as Task;
  });
};

// Fetch all tasks across all projects
export const getAllTasks = async (
  filters?: TaskFilters,
  sortOptions?: TaskSortOptions,
  page = 0,
  pageSize = 100,
): Promise<Task[]> => {
  const skip = page * pageSize;
  const limit = pageSize;
  const queryParams = new URLSearchParams();
  if (filters?.agentId) queryParams.append("agent_id", filters.agentId);
  if (filters?.status && filters.status !== "all")
    queryParams.append("status", String(filters.status));
  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.is_archived !== undefined && filters.is_archived !== null) {
    queryParams.append("is_archived", String(filters.is_archived));
  }
  queryParams.append("skip", String(skip));
  queryParams.append("limit", String(limit));
  // Add sorting parameters if provided
  if (sortOptions) {
    if (sortOptions.field) queryParams.append("sort_by", sortOptions.field);
    if (sortOptions.direction) queryParams.append("sort_direction", sortOptions.direction);
  }
  const queryString = queryParams.toString();
  const url = buildApiUrl(API_CONFIG.ENDPOINTS.TASKS, queryString ? `?${queryString}` : "");
  const rawTasks = await request<RawTask[]>(url);
  return rawTasks.map((rawTask) => {
    const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
    return {
      ...rawTask,
      id: `${rawTask.project_id}-${rawTask.task_number}`, // Computed ID for frontend compatibility
      project_id: String(rawTask.project_id),
      task_number: Number(rawTask.task_number),
      title: String(rawTask.title || ""),
      description: rawTask.description ? String(rawTask.description) : null,
      status: convertStatusIDToTaskStatus(statusId),
      agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
      agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
      agent_status: rawTask.agent_status ? String(rawTask.agent_status) : undefined,
      created_at: String(rawTask.created_at || new Date().toISOString()),
      updated_at: String(rawTask.updated_at || new Date().toISOString()),
      is_archived: !!rawTask.is_archived,
      subtasks: rawTask.subtasks || [],
      dependencies: rawTask.dependencies || [],
    } as Task;
  });
};

// Fetch a single task by project_id and task_number
export const getTaskById = async (
  project_id: string,
  task_number: number,
  is_archived?: boolean | null,
): Promise<Task> => {
  const queryParams = new URLSearchParams();
  if (is_archived !== undefined && is_archived !== null) {
    queryParams.append("is_archived", String(is_archived));
  }
  const queryString = queryParams.toString();
  const url = buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}${queryString ? `?${queryString}` : ""}`);
  const rawTask = await request<RawTask>(url);
  const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
  return {
    ...rawTask,
    id: `${rawTask.project_id}-${rawTask.task_number}`, // Computed ID for frontend compatibility
    project_id: String(rawTask.project_id),
    task_number: Number(rawTask.task_number),
    title: String(rawTask.title || ""),
    description: rawTask.description ? String(rawTask.description) : null,
    status: statusId,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    agent_status: rawTask.agent_status ? String(rawTask.agent_status) : undefined,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    is_archived: !!rawTask.is_archived,
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
  } as Task;
};

// Create a new task
export const createTask = async (project_id: string, taskData: TaskCreateData): Promise<Task> => {
  const rawTask = await request<RawTask>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/`),
    { method: "POST", body: JSON.stringify(taskData) },
  );
  const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
  return {
    ...rawTask,
    id: `${rawTask.project_id}-${rawTask.task_number}`, // Computed ID for frontend compatibility
    project_id: String(rawTask.project_id),
    task_number: Number(rawTask.task_number),
    title: String(rawTask.title || ""),
    description: rawTask.description ? String(rawTask.description) : null,
    status: statusId,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    agent_status: rawTask.agent_status ? String(rawTask.agent_status) : undefined,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
  } as Task;
};

// Update an existing task
export const updateTask = async (
  project_id: string,
  task_number: number,
  taskData: TaskUpdateData,
): Promise<Task> => {
  const payload: Partial<RawTask> = { ...taskData };
  if (typeof payload.completed === "boolean") {
    payload.status = payload.completed
      ? TaskStatus.COMPLETED
      : TaskStatus.TO_DO;
    delete payload.completed;
  }
  const rawTask = await request<RawTask>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}`),
    { method: "PUT", body: JSON.stringify(payload) },
  );
  const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
  return {
    ...rawTask,
    id: `${rawTask.project_id}-${rawTask.task_number}`, // Computed ID for frontend compatibility
    project_id: String(rawTask.project_id),
    task_number: Number(rawTask.task_number),
    title: String(rawTask.title || ""),
    description: rawTask.description ? String(rawTask.description) : null,
    status: statusId,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    agent_status: rawTask.agent_status ? String(rawTask.agent_status) : undefined,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
  } as Task;
};

// Fetch all tasks for a specific project (alias for getTasks for backward compatibility)
export const getAllTasksForProject = async (
  projectId: string,
  filters?: TaskFilters,
  sortOptions?: TaskSortOptions,
  page = 0,
  pageSize = 100,
): Promise<Task[]> => {
  return getTasks(projectId, filters, sortOptions, page, pageSize);
};
export const deleteTask = async (
  project_id: string,
  task_number: number,
): Promise<Task> => {
  const rawTask = await request<RawTask>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}`),
    { method: "DELETE" },
  );
  if (!rawTask) {
    throw new Error(
      `Task ${project_id}/${task_number} deleted, but backend did not return the task object.`,
    );
  }
  const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
  return {
    ...rawTask,
    id: `${rawTask.project_id}-${rawTask.task_number}`, // Computed ID for frontend compatibility
    project_id: String(rawTask.project_id),
    task_number: Number(rawTask.task_number),
    title: String(rawTask.title || ""),
    description: rawTask.description ? String(rawTask.description) : null,
    status: statusId,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    agent_status: rawTask.agent_status ? String(rawTask.agent_status) : undefined,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    is_archived: !!rawTask.is_archived,
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
  } as Task;
};

// --- Task Comments API ---
export const getTaskComments = async (
  project_id: string,
  task_number: number
): Promise<Comment[]> => {
  return request<Comment[]>(
    buildApiUrl(
      API_CONFIG.ENDPOINTS.PROJECTS,
      `/${project_id}/tasks/${task_number}/comments/`
    )
  );
};

export const addTaskComment = async (
  project_id: string,
  task_number: number,
  commentData: CommentCreateData
): Promise<Comment> => {
  return request<Comment>(
    buildApiUrl(
      API_CONFIG.ENDPOINTS.PROJECTS,
      `/${project_id}/tasks/${task_number}/comments/`
    ),
    { method: "POST", body: JSON.stringify(commentData) }
  );
};

// --- Task Archive/Unarchive ---
export const archiveTask = async (
  project_id: string,
  task_number: number,
): Promise<Task> => {
  const rawTask = await request<RawTask>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}/archive`),
    { method: "POST" },
  );
  const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
  return {
    ...rawTask,
    id: `${rawTask.project_id}-${rawTask.task_number}`, // Computed ID for frontend compatibility
    project_id: String(rawTask.project_id),
    task_number: Number(rawTask.task_number),
    status: statusId,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    agent_status: rawTask.agent_status ? String(rawTask.agent_status) : undefined,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    is_archived: true,
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
  } as Task;
};

export const unarchiveTask = async (
  project_id: string,
  task_number: number,
): Promise<Task> => {
  const rawTask = await request<RawTask>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}/tasks/${task_number}/unarchive`),
    { method: "POST" },
  );
  const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
  return {
    ...rawTask,
    id: `${rawTask.project_id}-${rawTask.task_number}`, // Computed ID for frontend compatibility
    project_id: String(rawTask.project_id),
    task_number: Number(rawTask.task_number),
    status: statusId,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    agent_status: rawTask.agent_status ? String(rawTask.agent_status) : undefined,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    is_archived: false,
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
  } as Task;
};
