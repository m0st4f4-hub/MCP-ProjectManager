import { create } from 'zustand';
import { 
    getProjects, 
    createProject, 
    updateProject, 
    deleteProject,
} from '@/services/api';
import { 
    Project, 
    ProjectCreateData, 
    ProjectUpdateData, 
    ProjectFilters 
} from '@/types/project';

interface ProjectState {
    projects: Project[];
    loading: boolean;
    error: string | null;
    filters: ProjectFilters;
    fetchProjects: (filters?: ProjectFilters) => Promise<void>;
    addProject: (projectData: ProjectCreateData) => Promise<void>; 
    editProject: (id: string, projectData: ProjectUpdateData) => Promise<void>;
    removeProject: (id: string) => Promise<void>;
    setFilters: (filters: Partial<ProjectFilters>) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    loading: false,
    error: null,
    filters: {
        status: 'all'
    },
    fetchProjects: async (filters?: ProjectFilters) => {
        set({ loading: true, error: null });
        const currentFilters = filters || get().filters;
        try {
            const projects = await getProjects(currentFilters);
            set({ projects, loading: false });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch projects';
            set({ error: message, loading: false });
            console.error("Fetch Projects Error:", err);
        }
    },
    addProject: async (projectData: ProjectCreateData) => {
        set({ loading: true, error: null });
        try {
            await createProject(projectData);
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
            set((state) => ({
                projects: state.projects.map(project => project.id === id ? updated : project),
                loading: false
            }));
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
            set((state) => ({
                projects: state.projects.filter(project => project.id !== id),
                loading: false
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete project';
            set({ error: message, loading: false });
            console.error("Remove Project Error:", err);
            throw err;
        }
    },
    setFilters: (filters: Partial<ProjectFilters>) => {
        set({ filters: { ...get().filters, ...filters } });
        get().fetchProjects(filters);
    }
}));
