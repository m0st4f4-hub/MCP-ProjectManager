import {
  Project,
  ProjectCreateData,
  ProjectUpdateData,
  ProjectFilters,
} from "@/types";
import { request } from "./request";

// Intermediate raw type for projects from backend
interface RawProject {
  id: string | number;
  name: string;
  description?: string | null;
  is_archived?: boolean | null;
  created_at?: string | null;
  [key: string]: unknown;
}

// Fetch all projects
export const getProjects = async (
  filters?: ProjectFilters,
): Promise<Project[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.status) queryParams.append("status", filters.status);
  if (filters?.is_archived !== undefined && filters?.is_archived !== null) {
    queryParams.append("is_archived", String(filters.is_archived));
  }
  const queryString = queryParams.toString();
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/projects/${queryString ? `?${queryString}` : ""}`;
  const rawProjects = await request<RawProject[]>(url);
  return rawProjects.map((rawProject) => ({
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ""),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: !!rawProject.is_archived,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === "number" ? rawProject.task_count : 0,
  }));
};

// Fetch a single project by ID
export const getProjectById = async (
  projectId: string,
  is_archived?: boolean | null,
): Promise<Project> => {
  const queryParams = new URLSearchParams();
  if (is_archived !== undefined && is_archived !== null) {
    queryParams.append("is_archived", String(is_archived));
  }
  const queryString = queryParams.toString();
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/projects/${projectId}${queryString ? `?${queryString}` : ""}`;
  const rawProject = await request<RawProject>(url);
  return {
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ""),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: !!rawProject.is_archived,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === "number" ? rawProject.task_count : 0,
  };
};

// Create a new project
export const createProject = async (
  projectData: ProjectCreateData,
): Promise<Project> => {
  const rawProject = await request<RawProject>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/projects/`,
    { method: "POST", body: JSON.stringify(projectData) },
  );
  return {
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ""),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: !!rawProject.is_archived,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === "number" ? rawProject.task_count : 0,
  };
};

// Update an existing project
export const updateProject = async (
  project_id: string,
  projectData: ProjectUpdateData,
): Promise<Project> => {
  const rawProject = await request<RawProject>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/projects/${project_id}`,
    { method: "PUT", body: JSON.stringify(projectData) },
  );
  return {
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ""),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: !!rawProject.is_archived,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === "number" ? rawProject.task_count : 0,
  };
};

// Delete a project
export const deleteProject = async (project_id: string): Promise<Project> => {
  const rawProject = await request<RawProject>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/projects/${project_id}`,
    { method: "DELETE" },
  );
  return {
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ""),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: !!rawProject.is_archived,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === "number" ? rawProject.task_count : 0,
  };
};

// --- Project Archive/Unarchive ---
export const archiveProject = async (projectId: string): Promise<Project> => {
  const rawProject = await request<RawProject>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/projects/${projectId}/archive`,
    { method: "POST" },
  );
  return {
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ""),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: true,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === "number" ? rawProject.task_count : 0,
  } as Project;
};

export const unarchiveProject = async (projectId: string): Promise<Project> => {
  const rawProject = await request<RawProject>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/projects/${projectId}/unarchive`,
    { method: "POST" },
  );
  return {
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ""),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: false,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === "number" ? rawProject.task_count : 0,
  } as Project;
};
