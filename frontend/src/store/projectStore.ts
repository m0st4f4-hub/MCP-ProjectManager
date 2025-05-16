import { Project, ProjectCreateData, ProjectUpdateData, ProjectFilters, ProjectSortOptions } from '@/types/project';
import { createBaseStore, BaseState, withLoading } from './baseStore';
import * as api from '@/services/api';

interface ProjectState extends BaseState {
    projects: Project[];
    editingProject: Project | null;
    isEditModalOpen: boolean;
    sortOptions: ProjectSortOptions;
    filters: ProjectFilters;
    
    // Actions
    fetchProjects: (filters?: ProjectFilters) => Promise<void>;
    addProject: (projectData: ProjectCreateData) => Promise<void>;
    removeProject: (id: number) => Promise<void>;
    editProject: (id: number, projectData: ProjectUpdateData) => Promise<void>;
    openEditModal: (project: Project) => void;
    closeEditModal: () => void;
    setSortOptions: (options: ProjectSortOptions) => void;
    setFilters: (filters: ProjectFilters) => void;
}

const initialState: Omit<ProjectState, keyof BaseState> = {
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
    
    // These will be implemented in the store
    fetchProjects: async () => {},
    addProject: async () => {},
    removeProject: async () => {},
    editProject: async () => {},
    openEditModal: () => {},
    closeEditModal: () => {},
    setSortOptions: () => {},
    setFilters: () => {}
};

export const useProjectStore = createBaseStore<ProjectState>(
    initialState,
    { name: 'project-store', persist: true }
);

// Initialize the store with actions
useProjectStore.setState((state) => ({
    ...state,
    
    fetchProjects: async (filters?: ProjectFilters) => {
        return withLoading(useProjectStore.setState, async () => {
            const fetchedProjects = await api.getProjects();
            const sortedProjects = sortProjects(fetchedProjects, state.sortOptions);
            useProjectStore.setState({ projects: sortedProjects });
        });
    },

    addProject: async (projectData: ProjectCreateData) => {
        return withLoading(useProjectStore.setState, async () => {
            const newProject = await api.createProject(projectData);
            useProjectStore.setState((state) => ({
                projects: sortProjects([newProject, ...state.projects], state.sortOptions)
            }));
        });
    },

    removeProject: async (id: number) => {
        return withLoading(useProjectStore.setState, async () => {
            await api.deleteProject(id);
            useProjectStore.setState((state) => ({
                projects: state.projects.filter(project => project.id !== id)
            }));
        });
    },

    editProject: async (id: number, projectData: ProjectUpdateData) => {
        return withLoading(useProjectStore.setState, async () => {
            const updated = await api.updateProject(id, projectData);
            useProjectStore.setState((state) => ({
                projects: sortProjects(
                    state.projects.map(project => project.id === id ? updated : project),
                    state.sortOptions
                ),
                editingProject: null,
                isEditModalOpen: false
            }));
        });
    },

    openEditModal: (project: Project) => {
        useProjectStore.setState({ editingProject: project, isEditModalOpen: true });
    },

    closeEditModal: () => {
        useProjectStore.setState({ editingProject: null, isEditModalOpen: false });
    },

    setSortOptions: (options: ProjectSortOptions) => {
        useProjectStore.setState((state) => ({
            sortOptions: options,
            projects: sortProjects(state.projects, options)
        }));
    },

    setFilters: (filters: ProjectFilters) => {
        useProjectStore.setState({ filters });
        state.fetchProjects(filters);
    }
}));

// Helper function to sort projects
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
        
        return 0;
    });
}; 