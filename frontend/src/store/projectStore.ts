import { StoreApi } from 'zustand';
import { Project, ProjectCreateData, ProjectUpdateData, ProjectFilters, ProjectSortOptions } from '@/types/project';
import { createBaseStore, BaseState, withLoading } from './baseStore';
import * as api from '@/services/api';

// Define the action types separately for clarity if needed, or use Pick inline
type ProjectActions = {
    fetchProjects: (filters?: ProjectFilters) => Promise<void>;
    addProject: (projectData: ProjectCreateData) => Promise<void>;
    removeProject: (id: string) => Promise<void>;
    editProject: (id: string, projectData: ProjectUpdateData) => Promise<void>;
    openEditModal: (project: Project) => void;
    closeEditModal: () => void;
    setSortOptions: (options: ProjectSortOptions) => void;
    setFilters: (filters: ProjectFilters) => void;
};

export interface ProjectState extends BaseState, ProjectActions {
    projects: Project[];
    editingProject: Project | null;
    isEditModalOpen: boolean;
    sortOptions: ProjectSortOptions;
    filters: ProjectFilters;
}

const initialProjectData: Omit<ProjectState, keyof BaseState | keyof ProjectActions> = {
    projects: [],
    editingProject: null,
    isEditModalOpen: false,
    sortOptions: {
        field: 'created_at',
        direction: 'desc'
    },
    filters: {
        status: 'all'
    },
};

const projectActionsCreator = (
    set: StoreApi<ProjectState>['setState'], 
    get: StoreApi<ProjectState>['getState']
): ProjectActions => ({
    fetchProjects: async (filters?: ProjectFilters) => {
        return withLoading(set, async () => {
            const effectiveFilters = filters || get().filters;
            const fetchedProjects = await api.getProjects(effectiveFilters);
            const sortedProjects = sortProjects(fetchedProjects, get().sortOptions);
            set({ projects: sortedProjects } as Partial<ProjectState>);
        });
    },
    addProject: async (projectData: ProjectCreateData) => {
        return withLoading(set, async () => {
            const newProject = await api.createProject(projectData);
            set((state) => ({
                projects: sortProjects([newProject, ...state.projects], state.sortOptions)
            } as Partial<ProjectState>));
        });
    },
    removeProject: async (id: string) => {
        return withLoading(set, async () => {
            await api.deleteProject(id);
            set((state) => ({
                projects: state.projects.filter(project => project.id !== id)
            } as Partial<ProjectState>));
        });
    },
    editProject: async (id: string, projectData: ProjectUpdateData) => {
        return withLoading(set, async () => {
            const updated = await api.updateProject(id, projectData);
            set((state) => ({
                projects: sortProjects(
                    state.projects.map(project => project.id === id ? updated : project),
                    state.sortOptions
                ),
                editingProject: null,
                isEditModalOpen: false
            } as Partial<ProjectState>));
        });
    },
    openEditModal: (project: Project) => {
        set({ editingProject: project, isEditModalOpen: true } as Partial<ProjectState>);
    },
    closeEditModal: () => {
        set({ editingProject: null, isEditModalOpen: false } as Partial<ProjectState>);
    },
    setSortOptions: (options: ProjectSortOptions) => {
        set((state) => ({
            sortOptions: options,
            projects: sortProjects(state.projects, options)
        } as Partial<ProjectState>));
    },
    setFilters: (filters: ProjectFilters) => {
        set({ filters } as Partial<ProjectState>);
        get().fetchProjects(filters); // Call fetchProjects after setting filters
    }
});

export const useProjectStore = createBaseStore<ProjectState, ProjectActions>(
    initialProjectData,
    projectActionsCreator,
    { name: 'project-store', persist: true }
);

// Helper function to sort projects (remains the same)
const sortProjects = (projects: Project[], options: ProjectSortOptions): Project[] => {
    return [...projects].sort((a, b) => {
        if (options.field === 'created_at') {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return options.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (options.field === 'name') {
            return options.direction === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        // Add more sort fields if needed
        return 0;
    });
};
