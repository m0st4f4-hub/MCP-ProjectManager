import { create } from "zustand";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  archiveProject as archiveProjectAPI,
  unarchiveProject as unarchiveProjectAPI,
} from "@/services/api";
import {
  Project,
  ProjectCreateData,
  ProjectUpdateData,
  ProjectFilters,
} from "@/types/project";
import { produce } from "immer";
import { debounce } from "lodash";
import { useTaskStore } from "./taskStore";
import { handleApiError } from "@/lib/apiErrorHandler";

let debouncedFetchProjects: (() => void) | null = null;

export interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  filters: ProjectFilters;
  fetchProjects: (filters?: ProjectFilters, isPoll?: boolean) => Promise<void>;
  addProject: (projectData: ProjectCreateData) => Promise<void>;
  editProject: (id: string, projectData: ProjectUpdateData) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  archiveProject: (id: string) => Promise<void>;
  unarchiveProject: (id: string) => Promise<void>;
  pollingIntervalId: NodeJS.Timeout | null;
  isPolling: boolean;
  pollingError: string | null;
  startPolling: () => void;
  stopPolling: () => void;
  clearPollingError: () => void;
}

// Utility: Shallow equality for objects
function shallowEqual<T extends object>(a: T, b: T): boolean {
  if (a === b) return true;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key as keyof T] !== b[key as keyof T]) return false;
  }
  return true;
}

// Improved upsertProjects: preserve references for unchanged items
const upsertProjects = (
  fetchedProjects: Project[],
  existingProjects: Project[],
): Project[] => {
  const projectMap = new Map(
    existingProjects.map((project) => [project.id, project]),
  );
  const result: Project[] = [];
  for (const newProject of fetchedProjects) {
    const oldProject = projectMap.get(newProject.id);
    if (oldProject && shallowEqual(oldProject, newProject)) {
      result.push(oldProject); // preserve reference
    } else {
      result.push(newProject);
    }
  }
  return result;
};

// Utility: Compare arrays of projects by id and shallow equality
const areProjectsEqual = (a: Project[], b: Project[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || !shallowEqual(a[i], b[i])) return false;
  }
  return true;
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,
  pollingIntervalId: null,
  isPolling: false,
  pollingError: null,
  filters: {
    is_archived: false,
    search: undefined,
    status: "all",
    agentId: undefined,
  },
  fetchProjects: async (filtersToApply?: ProjectFilters, isPoll = false) => {
    if (!isPoll) {
      set({ loading: true, error: null });
    } else {
      set({ isPolling: true, pollingError: null });
    }
    const currentActiveFilters = filtersToApply || get().filters;
    console.log(
      "[ProjectStore] Fetching projects with filters:",
      currentActiveFilters,
    );
    try {
      const fetchedProjects = await getProjects(currentActiveFilters);
      set((state) => {
        const updatedProjects = upsertProjects(fetchedProjects, state.projects);
        if (
          areProjectsEqual(updatedProjects, state.projects) &&
          !filtersToApply
        ) {
          const newState: Partial<ProjectState> = {};
          if (!isPoll) newState.loading = false;
          else newState.isPolling = false;
          return newState;
        }
        const newState: Partial<ProjectState> = { projects: updatedProjects };
        if (!isPoll) newState.loading = false;
        else newState.isPolling = false;
        if (filtersToApply) newState.filters = currentActiveFilters;
        return newState;
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch projects";
      if (!isPoll) {
        set({ error: message, loading: false });
      } else {
        set({ pollingError: message, isPolling: false });
      }
      handleApiError(err, "Failed to fetch projects");
      console.error("Fetch Projects Error:", err);
    }
  },
  addProject: async (projectData: ProjectCreateData) => {
    set({ loading: true, error: null });
    try {
      const newProject = await createProject(projectData);
      set(
        produce((state: ProjectState) => {
          state.projects.push(newProject);
        }),
      );
      await get().fetchProjects();
      set({ loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add project";
      set({ error: message, loading: false });
      handleApiError(err, "Failed to add project");
      console.error("Add Project Error:", err);
      throw err;
    }
  },
  editProject: async (id: string, projectData: ProjectUpdateData) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateProject(id, projectData);
      set(
        produce((state: ProjectState) => {
          const index = state.projects.findIndex((p) => p.id === id);
          if (index !== -1) {
            state.projects[index] = updated;
          }
        }),
      );
      const currentFilters = get().filters;
      if (
        projectData.is_archived !== undefined &&
        projectData.is_archived !== currentFilters.is_archived
      ) {
        await get().fetchProjects();
      } else {
        set({ loading: false });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update project";
      set({ error: message, loading: false });
      handleApiError(err, "Failed to update project");
      console.error("Edit Project Error:", err);
      throw err;
    }
  },
  removeProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await deleteProject(id);
      set(
        produce((state: ProjectState) => {
          state.projects = state.projects.filter(
            (project) => project.id !== id,
          );
        }),
      );
      useTaskStore.getState().removeTasksByProjectId(id);
      set({ loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete project";
      set({ error: message, loading: false });
      handleApiError(err, "Failed to delete project");
      console.error("Remove Project Error:", err);
      throw err;
    }
  },
  archiveProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const archivedProject = await archiveProjectAPI(id);
      set(
        produce((state: ProjectState) => {
          const index = state.projects.findIndex((p) => p.id === id);
          if (index !== -1) {
            state.projects[index] = archivedProject;
          }
        }),
      );
      await get().fetchProjects();
      useTaskStore.getState().archiveTasksByProjectId(id);
      set({ loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to archive project";
      set({ error: message, loading: false });
      handleApiError(err, "Failed to archive project");
      console.error("Archive Project Error:", err);
      throw err;
    }
  },
  unarchiveProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const unarchivedProject = await unarchiveProjectAPI(id);
      set(
        produce((state: ProjectState) => {
          const index = state.projects.findIndex((p) => p.id === id);
          if (index !== -1) {
            state.projects[index] = unarchivedProject;
          }
        }),
      );
      await get().fetchProjects();
      useTaskStore.getState().unarchiveTasksByProjectId(id);
      set({ loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to unarchive project";
      set({ error: message, loading: false });
      handleApiError(err, "Failed to unarchive project");
      console.error("Unarchive Project Error:", err);
      throw err;
    }
  },
  setFilters: (newFilters: Partial<ProjectFilters>) => {
    const currentFilters = get().filters;
    const mergedFilters = { ...currentFilters, ...newFilters };
    if (!shallowEqual(mergedFilters, currentFilters)) {
      set({ filters: mergedFilters });
      console.log(
        "[ProjectStore] Setting new filters and re-fetching:",
        mergedFilters,
      );
      get().fetchProjects(mergedFilters);
    }
  },
  startPolling: () => {
    const { fetchProjects, pollingIntervalId, filters } = get();
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
    }
    set({ loading: true, error: null, pollingError: null });
    fetchProjects(filters, false).finally(() => {
      set({ loading: false });
    });

    debouncedFetchProjects = debounce(
      () => fetchProjects(get().filters, true),
      5000,
    );

    const intervalId = setInterval(() => {
      if (debouncedFetchProjects) debouncedFetchProjects();
    }, 20000);
    set({ pollingIntervalId: intervalId });
  },
  stopPolling: () => {
    const { pollingIntervalId } = get();
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      set({ pollingIntervalId: null, isPolling: false });
    }
  },
  clearPollingError: () => set({ pollingError: null }),
}));
