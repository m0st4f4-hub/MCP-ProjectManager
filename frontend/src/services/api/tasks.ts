import { TaskFilters, Task, TaskCreateData, TaskUpdateData } from "@/types";
import { request, normalizeToStatusID } from "./request";

// Intermediate raw type for tasks from backend
interface RawTask {
  id: string | number;
  title: string;
  description?: string | null;
  status?: string | null;
  completed?: boolean | null;
  project_id?: string | number | null;
  agent_id?: string | number | null;
  agent_name?: string | null;
  parent_task_id?: string | number | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_archived?: boolean | null;
  subtasks?: RawTask[] | null;
  dependencies?: (string | number)[] | null;
  [key: string]: unknown;
}

// Fetch all tasks
export const getTasks = async (filters?: TaskFilters): Promise<Task[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.projectId) queryParams.append("project_id", filters.projectId);
  if (filters?.agentId) queryParams.append("agent_id", filters.agentId);
  if (filters?.status && filters.status !== "all")
    queryParams.append("status", String(filters.status));
  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.is_archived !== undefined && filters.is_archived !== null) {
    queryParams.append("is_archived", String(filters.is_archived));
  }
  const queryString = queryParams.toString();
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/tasks/${queryString ? `?${queryString}` : ""}`;
  const rawTasks = await request<RawTask[]>(url);
  return rawTasks.map((rawTask) => {
    const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
    return {
      ...rawTask,
      id: String(rawTask.id),
      title: String(rawTask.title || ""),
      description: rawTask.description ? String(rawTask.description) : null,
      status: statusId,
      project_id: rawTask.project_id ? String(rawTask.project_id) : null,
      agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
      agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
      created_at: String(rawTask.created_at || new Date().toISOString()),
      updated_at: String(rawTask.updated_at || new Date().toISOString()),
      is_archived: !!rawTask.is_archived,
      subtasks: rawTask.subtasks || [],
      dependencies: rawTask.dependencies || [],
    } as Task;
  });
};

// Fetch a single task by ID
export const getTaskById = async (
  task_id: string,
  is_archived?: boolean | null,
): Promise<Task> => {
  const queryParams = new URLSearchParams();
  if (is_archived !== undefined && is_archived !== null) {
    queryParams.append("is_archived", String(is_archived));
  }
  const queryString = queryParams.toString();
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/tasks/${task_id}${queryString ? `?${queryString}` : ""}`;
  const rawTask = await request<RawTask>(url);
  const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
  return {
    ...rawTask,
    id: String(rawTask.id),
    title: String(rawTask.title || ""),
    description: rawTask.description ? String(rawTask.description) : null,
    status: statusId,
    project_id: rawTask.project_id ? String(rawTask.project_id) : null,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    is_archived: !!rawTask.is_archived,
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
  } as Task;
};

// Create a new task
export const createTask = async (taskData: TaskCreateData): Promise<Task> => {
  const rawTask = await request<RawTask>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/tasks/`,
    { method: "POST", body: JSON.stringify(taskData) },
  );
  const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
  return {
    ...rawTask,
    id: String(rawTask.id),
    title: String(rawTask.title || ""),
    description: rawTask.description ? String(rawTask.description) : null,
    status: statusId,
    project_id: rawTask.project_id ? String(rawTask.project_id) : null,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
  } as Task;
};

// Update an existing task
export const updateTask = async (
  task_id: string,
  taskData: TaskUpdateData,
): Promise<Task> => {
  const payload: Partial<RawTask> = { ...taskData };
  if (typeof payload.completed === "boolean") {
    payload.status = payload.completed ? "Completed" : "To Do";
    delete payload.completed;
  }
  const rawTask = await request<RawTask>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/tasks/${task_id}`,
    { method: "PUT", body: JSON.stringify(payload) },
  );
  const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
  return {
    ...rawTask,
    id: String(rawTask.id),
    title: String(rawTask.title || ""),
    description: rawTask.description ? String(rawTask.description) : null,
    status: statusId,
    project_id: rawTask.project_id ? String(rawTask.project_id) : null,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
  } as Task;
};

// Delete a task
export const deleteTask = async (task_id: string): Promise<Task> => {
  const rawTask = await request<RawTask>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/tasks/${task_id}`,
    { method: "DELETE" },
  );
  if (!rawTask) {
    throw new Error(
      `Task ${task_id} deleted, but backend did not return the task object.`,
    );
  }
  const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
  return {
    ...rawTask,
    id: String(rawTask.id),
    title: String(rawTask.title || ""),
    description: rawTask.description ? String(rawTask.description) : null,
    status: statusId,
    project_id: rawTask.project_id ? String(rawTask.project_id) : null,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    is_archived: !!rawTask.is_archived,
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
  } as Task;
};

// --- Task Archive/Unarchive ---
export const archiveTask = async (taskId: string): Promise<Task> => {
  const rawTask = await request<RawTask>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/tasks/${taskId}/archive`,
    { method: "POST" },
  );
  const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
  return {
    ...rawTask,
    id: String(rawTask.id),
    status: statusId,
    project_id: rawTask.project_id ? String(rawTask.project_id) : null,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    is_archived: true,
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
  } as Task;
};

export const unarchiveTask = async (taskId: string): Promise<Task> => {
  const rawTask = await request<RawTask>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/tasks/${taskId}/unarchive`,
    { method: "POST" },
  );
  const statusId = normalizeToStatusID(rawTask.status, !!rawTask.completed);
  return {
    ...rawTask,
    id: String(rawTask.id),
    status: statusId,
    project_id: rawTask.project_id ? String(rawTask.project_id) : null,
    agent_id: rawTask.agent_id ? String(rawTask.agent_id) : null,
    agent_name: rawTask.agent_name ? String(rawTask.agent_name) : null,
    created_at: String(rawTask.created_at || new Date().toISOString()),
    updated_at: String(rawTask.updated_at || new Date().toISOString()),
    is_archived: false,
    subtasks: rawTask.subtasks || [],
    dependencies: rawTask.dependencies || [],
  } as Task;
};
