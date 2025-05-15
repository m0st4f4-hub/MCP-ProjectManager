import { create } from 'zustand';
import { 
    getProjects, 
    createProject, 
    updateProject, 
    deleteProject,
    archiveProject as archiveProjectAPI,
    unarchiveProject as unarchiveProjectAPI,
    getProjectById
} from '@/services/api';
import { 
    Project, 
    ProjectCreateData, 
    ProjectUpdateData, 
    ProjectFilters 
} from '@/types/project';
import { produce } from 'immer';
import shallow from 'zustand/shallow';
import debounce from 'lodash.debounce';
import { useTaskStore } from './taskStore';

export interface ProjectState {
    projects: Project[];
    loading: boolean;
    error: string | null;
    filters: ProjectFilters;
    fetchProjects: (filters?: ProjectFilters) => Promise<void>;
    addProject: (projectData: ProjectCreateData) => Promise<void>;
    editProject: (id: string, projectData: ProjectUpdateData) => Promise<void>;
    removeProject: (id: string) => Promise<void>;
    setFilters: (filters: Partial<ProjectFilters>) => void;
    archiveProject: (id: string) => Promise<void>;
    unarchiveProject: (id: string) => Promise<void>;
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
const upsertProjects = (fetchedProjects: Project[], existingProjects: Project[]): Project[] => {
    const projectMap = new Map(existingProjects.map(project => [project.id, project]));
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
    filters: {
        is_archived: false,
    },
    fetchProjects: async (filtersToApply?: ProjectFilters) => {
        set({ loading: true, error: null });
        const currentActiveFilters = filtersToApply || get().filters;
        console.log('[ProjectStore] Fetching projects with filters:', currentActiveFilters);
        try {
            const fetchedProjects = await getProjects(currentActiveFilters);
            set(state => {
                const updatedProjects = upsertProjects(fetchedProjects, state.projects);
                if (areProjectsEqual(updatedProjects, state.projects) && !filtersToApply) {
                    return { loading: false };
                }
                return { projects: updatedProjects, loading: false, filters: currentActiveFilters };
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch projects';
            set({ error: message, loading: false });
            console.error("Fetch Projects Error:", err);
        }
    },
    addProject: async (projectData: ProjectCreateData) => {
        set({ loading: true, error: null });
        try {
            const newProject = await createProject(projectData);
            set(produce((state: ProjectState) => {
                state.projects.push(newProject);
            }));
            await get().fetchProjects();
            set({ loading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add project';
            set({ error: message, loading: false });
            console.error("Add Project Error:", err);
            throw err;
        }
    },
    editProject: async (id: string, projectData: ProjectUpdateData) => {
        set({ loading: true, error: null });
        try {
            const updated = await updateProject(id, projectData);
            set(produce((state: ProjectState) => {
                const index = state.projects.findIndex(p => p.id === id);
                if (index !== -1) {
                    state.projects[index] = updated;
                }
            }));
            const currentFilters = get().filters;
            if (projectData.is_archived !== undefined && projectData.is_archived !== currentFilters.is_archived) {
                await get().fetchProjects();
            } else {
                set({ loading: false });
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update project';
            set({ error: message, loading: false });
            console.error("Edit Project Error:", err);
            throw err;
        }
    },
    removeProject: async (id: string) => {
        set({ loading: true, error: null });
        try {
            await deleteProject(id);
            set(produce((state: ProjectState) => {
                state.projects = state.projects.filter(project => project.id !== id);
            }));
            useTaskStore.getState().removeTasksByProjectId(id);
            set({ loading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete project';
            set({ error: message, loading: false });
            console.error("Remove Project Error:", err);
            throw err;
        }
    },
    archiveProject: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const archivedProject = await archiveProjectAPI(id);
            set(produce((state: ProjectState) => {
                const index = state.projects.findIndex(p => p.id === id);
                if (index !== -1) {
                    state.projects[index] = archivedProject;
                }
            }));
            await get().fetchProjects();
            useTaskStore.getState().archiveTasksByProjectId(id);
            set({loading: false});
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to archive project';
            set({ error: message, loading: false });
            console.error("Archive Project Error:", err);
            throw err;
        }
    },
    unarchiveProject: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const unarchivedProject = await unarchiveProjectAPI(id);
            set(produce((state: ProjectState) => {
                const index = state.projects.findIndex(p => p.id === id);
                if (index !== -1) {
                    state.projects[index] = unarchivedProject;
                }
            }));
            await get().fetchProjects();
            useTaskStore.getState().unarchiveTasksByProjectId(id);
            set({loading: false});
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to unarchive project';
            set({ error: message, loading: false });
            console.error("Unarchive Project Error:", err);
            throw err;
        }
    },
    setFilters: (newFilters: Partial<ProjectFilters>) => {
        const currentFilters = get().filters;
        const mergedFilters = { ...currentFilters, ...newFilters };
        if (mergedFilters.is_archived === currentFilters.is_archived && mergedFilters.search === currentFilters.search && mergedFilters.status === currentFilters.status) {
            if (!shallowEqual(mergedFilters, currentFilters)) {
                 set({ filters: mergedFilters });
            }
        } 
        set({ filters: mergedFilters });
        console.log("[ProjectStore] Setting new filters and re-fetching:", mergedFilters);
        get().fetchProjects(mergedFilters);
    }
}));
