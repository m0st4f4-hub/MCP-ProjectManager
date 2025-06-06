import {
  Project,
  ProjectCreateData,
  ProjectUpdateData,
  ProjectFilters,
  ProjectMember,
  ProjectMemberCreateData,
  ProjectFileAssociation,
  ProjectFileAssociationListResponse,
} from '@/types';
import { request } from './request';
import { buildApiUrl, API_CONFIG } from './config';

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
  skip = 0,
  limit = 100
): Promise<Project[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.is_archived !== undefined && filters?.is_archived !== null) {
    queryParams.append('is_archived', String(filters.is_archived));
  }
  queryParams.append('skip', String(skip));
  queryParams.append('limit', String(limit));
  const queryString = queryParams.toString();
  const url = buildApiUrl(
    API_CONFIG.ENDPOINTS.PROJECTS,
    queryString ? `?${queryString}` : ''
  );
  const resp = await request<{ data: RawProject[] }>(url);
  return resp.data.map((rawProject) => ({
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ''),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: !!rawProject.is_archived,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
  }));
};

// Fetch a single project by ID
export const getProjectById = async (
  projectId: string,
  is_archived?: boolean | null
): Promise<Project> => {
  const queryParams = new URLSearchParams();
  if (is_archived !== undefined && is_archived !== null) {
    queryParams.append('is_archived', String(is_archived));
  }
  const queryString = queryParams.toString();
  const url = buildApiUrl(
    API_CONFIG.ENDPOINTS.PROJECTS,
    `/${projectId}${queryString ? `?${queryString}` : ''}`
  );
  const { data: rawProject } = await request<{ data: RawProject }>(url);
  return {
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ''),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: !!rawProject.is_archived,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
  };
};

// Create a new project
export const createProject = async (
  projectData: ProjectCreateData
): Promise<Project> => {
  const { data: rawProject } = await request<{ data: RawProject }>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, '/'),
    { method: 'POST', body: JSON.stringify(projectData) }
  );
  return {
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ''),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: !!rawProject.is_archived,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
  };
};

// Update an existing project
export const updateProject = async (
  project_id: string,
  projectData: ProjectUpdateData
): Promise<Project> => {
  const { data: rawProject } = await request<{ data: RawProject }>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}`),
    { method: 'PUT', body: JSON.stringify(projectData) }
  );
  return {
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ''),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: !!rawProject.is_archived,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
  };
};

// Delete a project
export const deleteProject = async (project_id: string): Promise<Project> => {
  const { data: rawProject } = await request<{ data: RawProject }>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${project_id}`),
    { method: 'DELETE' }
  );
  return {
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ''),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: !!rawProject.is_archived,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
  } as Project;
};

// --- Project Archive/Unarchive ---
export const archiveProject = async (projectId: string): Promise<Project> => {
  const { data: rawProject } = await request<{ data: RawProject }>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${projectId}/archive`),
    { method: 'POST' }
  );
  return {
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ''),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: true,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
  } as Project;
};

export const unarchiveProject = async (projectId: string): Promise<Project> => {
  const { data: rawProject } = await request<{ data: RawProject }>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${projectId}/unarchive`),
    { method: 'POST' }
  );
  return {
    ...rawProject,
    id: String(rawProject.id),
    name: String(rawProject.name || ''),
    description: rawProject.description ? String(rawProject.description) : null,
    is_archived: false,
    created_at: String(rawProject.created_at || new Date().toISOString()),
    task_count:
      typeof rawProject.task_count === 'number' ? rawProject.task_count : 0,
  } as Project;
};

export const getProjectMembers = async (
  projectId: string
): Promise<ProjectMember[]> => {
  return request<ProjectMember[]>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${projectId}/members`)
  );
};

export const addMemberToProject = async (
  projectId: string,
  data: ProjectMemberCreateData
): Promise<ProjectMember> => {
  return request<ProjectMember>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${projectId}/members`),
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};

export const removeMemberFromProject = async (
  projectId: string,
  userId: string
): Promise<void> => {
  return request<void>(
    buildApiUrl(
      API_CONFIG.ENDPOINTS.PROJECTS,
      `/${projectId}/members/${userId}`
    ),
    {
      method: 'DELETE',
    }
  );
};

export interface AssociateFileWithProjectData {
  file_id: string;
}

export const getProjectFiles = async (
  projectId: string,
  skip = 0,
  limit = 100
): Promise<ProjectFileAssociationListResponse> => {
  const params = new URLSearchParams();
  params.append('skip', String(skip));
  params.append('limit', String(limit));
  const query = params.toString();
  return request<ProjectFileAssociationListResponse>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${projectId}/files?${query}`)
  );
};

export const associateFileWithProject = async (
  projectId: string,
  data: AssociateFileWithProjectData
): Promise<ProjectFileAssociation> => {
  return request<ProjectFileAssociation>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${projectId}/files`),
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
};

export const disassociateFileFromProject = async (
  projectId: string,
  fileId: string
): Promise<void> => {
  return request<void>(
    buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS, `/${projectId}/files/${fileId}`),
    {
      method: 'DELETE',
    }
  );
};
