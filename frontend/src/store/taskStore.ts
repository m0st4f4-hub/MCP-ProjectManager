// D:\mcp\task-manager\frontend\src\store\taskStore.ts
import { create } from 'zustand';
import {
    Task,
    TaskUpdateData,
    TaskCreateData,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    Project,
    ProjectCreateData,
    ProjectUpdateData,
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    Agent,
    AgentCreateData,
    AgentUpdateData,
    getAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    // generatePlanningPrompt // Commented out or remove if truly unused
} from '@/services/api';

// Updated filters interface
interface TaskFilters {
    projectId?: number;
    agentName?: string;
}

interface TaskState {
    tasks: Task[];
    projects: Project[];
    agents: Agent[];
    loadingTasks: boolean;
    loadingProjects: boolean;
    loadingAgents: boolean;
    loadingCreateProject: boolean;
    loadingCreateAgent: boolean;
    errorTasks: string | null;
    errorProjects: string | null;
    errorAgents: string | null;
    errorCreateProject: string | null;
    errorCreateAgent: string | null;
    editingTask: Task | null;
    isEditModalOpen: boolean;
    fetchTasks: (filters?: TaskFilters) => Promise<void>;
    fetchProjects: () => Promise<void>;
    fetchAgents: () => Promise<void>;
    addTask: (taskData: TaskCreateData) => Promise<void>;
    removeTask: (id: number) => Promise<void>;
    toggleTaskComplete: (id: number, completed: boolean) => Promise<void>;
    editTask: (id: number, taskData: TaskUpdateData) => Promise<void>;
    openEditModal: (task: Task) => void;
    closeEditModal: () => void;
    createProjectAction: (projectData: ProjectCreateData) => Promise<void>;
    updateProjectAction: (id: number, projectData: ProjectUpdateData) => Promise<void>;
    deleteProjectAction: (id: number) => Promise<void>;
    createAgentAction: (agentData: AgentCreateData) => Promise<void>;
    updateAgentAction: (id: number, agentData: AgentUpdateData) => Promise<void>;
    deleteAgentAction: (id: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    projects: [],
    agents: [],
    loadingTasks: false,
    loadingProjects: false,
    loadingAgents: false,
    loadingCreateProject: false,
    loadingCreateAgent: false,
    errorTasks: null,
    errorProjects: null,
    errorAgents: null,
    errorCreateProject: null,
    errorCreateAgent: null,
    editingTask: null,
    isEditModalOpen: false,
    fetchTasks: async (filters?: TaskFilters) => {
        console.log('[taskStore.ts] Starting fetchTasks with filters:', filters);
        set({ loadingTasks: true, errorTasks: null });
        try {
            const fetchedTasks = await getTasks(filters);
            fetchedTasks.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            set({ tasks: fetchedTasks, loadingTasks: false });
            console.log('[taskStore.ts] Tasks fetched:', fetchedTasks);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch tasks';
            set({ errorTasks: errorMsg, loadingTasks: false });
            console.error('[taskStore.ts] Fetch tasks error:', err);
        }
    },
    addTask: async (taskData) => {
        console.log('[taskStore.ts] Starting addTask with data:', taskData);
        try {
            const newTask = await createTask(taskData);
            set((state) => ({
                tasks: [newTask, ...state.tasks].sort((a, b) => {
                    if (a.completed !== b.completed) {
                        return a.completed ? 1 : -1;
        }
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                })
            }));
            console.log('[taskStore.ts] Task added:', newTask);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to add task';
            console.error('[taskStore.ts] Add task error:', errorMsg, err);
            throw err; // Re-throw to be caught in component
        }
    },
    removeTask: async (id) => {
        console.log('[taskStore.ts] Starting removeTask with id:', id);
        const originalTasks = get().tasks;
        set(state => ({ tasks: state.tasks.filter(task => task.id !== id) }));
        try {
            await deleteTask(id);
            console.log('[taskStore.ts] Task removed from API:', id);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete task';
            set({ tasks: originalTasks, errorTasks: errorMsg });
            console.error('[taskStore.ts] Remove task error:', errorMsg, err);
            throw err; 
        }
    },
    toggleTaskComplete: async (id, completed) => {
        console.log(`[taskStore.ts] Toggling task ${id} to ${completed}`);
        const originalTasks = get().tasks;
        set(state => ({
            tasks: state.tasks.map(task =>
                task.id === id ? { ...task, completed, updated_at: new Date().toISOString() } : task
            ).sort((a, b) => { // Re-sort after toggling
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })
        }));
        try {
            const updated = await updateTask(id, { completed });
            // Update with potentially more accurate data from backend (like updated_at)
        set(state => ({
            tasks: state.tasks.map(task =>
                    task.id === id ? { ...task, ...updated } : task
                ).sort((a, b) => { // Re-sort again
                    if (a.completed !== b.completed) {
                        return a.completed ? 1 : -1;
                    }
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                })
            }));
            console.log(`[taskStore.ts] Task ${id} toggled successfully via API.`);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to toggle task';
            set({ tasks: originalTasks, errorTasks: errorMsg });
            console.error('[taskStore.ts] Toggle task error:', errorMsg, err);
            throw err;
        }
    },
    editTask: async (id, taskData) => {
        console.log(`[taskStore.ts] Editing task ${id} with data:`, taskData);
        const originalTasks = get().tasks;
        try {
            const updatedTask = await updateTask(id, taskData);
            set(state => ({
                tasks: state.tasks.map(task => (task.id === id ? updatedTask : task))
                .sort((a, b) => { // Re-sort after editing
                    if (a.completed !== b.completed) {
                        return a.completed ? 1 : -1;
                    }
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                })
            }));
            console.log(`[taskStore.ts] Task ${id} edited successfully via API.`);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to edit task';
            // No need to revert here as the UI typically handles this via the modal state
            console.error('[taskStore.ts] Edit task error:', errorMsg, err);
            throw err;
        }
    },
    openEditModal: (task) => set({ editingTask: task, isEditModalOpen: true }),
    closeEditModal: () => set({ editingTask: null, isEditModalOpen: false }),

    // Project Actions
    fetchProjects: async () => {
        console.log('[taskStore.ts] Starting fetchProjects');
        set({ loadingProjects: true, errorProjects: null });
        try {
            const fetchedProjects = await getProjects();
            set({ projects: fetchedProjects, loadingProjects: false });
            console.log('[taskStore.ts] Projects fetched:', fetchedProjects);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch projects';
            set({ errorProjects: errorMsg, loadingProjects: false });
            console.error('[taskStore.ts] Fetch projects error:', err);
        }
    },
    createProjectAction: async (projectData) => {
        console.log('[taskStore.ts] Starting createProject with data:', projectData);
        set({ loadingCreateProject: true, errorCreateProject: null });
        try {
            const newProject = await createProject(projectData);
            set(state => ({ 
                projects: [...state.projects, newProject], 
                loadingCreateProject: false 
            }));
            console.log('[taskStore.ts] Project created:', newProject);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to create project';
            set({ errorCreateProject: errorMsg, loadingCreateProject: false });
            console.error('[taskStore.ts] Create project error:', errorMsg, err);
            throw err;
        }
    },
    updateProjectAction: async (id, projectData) => {
        console.log(`[taskStore.ts] Updating project ${id} with data:`, projectData);
        const originalProjects = get().projects;
        try {
            const updatedProject = await updateProject(id, projectData);
            set(state => ({
                projects: state.projects.map(p => (p.id === id ? updatedProject : p))
            }));
            console.log(`[taskStore.ts] Project ${id} updated successfully.`);
             // If a project name changed, tasks associated with it might need UI refresh
            // if they display project name directly from task.project.name. However, 
            // if tasks only store project_id and project details are joined/fetched separately
            // or if task.project is updated upon project update through some other mechanism,
            // then direct task refresh might not be needed here.
            // For now, assume tasks will show updated project name if they fetch project details on render.
            // We could also re-fetch tasks if a project name is part of filters or display
            // await get().fetchTasks(); 
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update project';
            // No explicit revert here, store error to be displayed
            set({ errorProjects: errorMsg }); 
            console.error('[taskStore.ts] Update project error:', errorMsg, err);
            throw err;
        }
    },
    deleteProjectAction: async (id: number) => {
        console.log(`[taskStore.ts] Deleting project ${id}`);
        const originalProjects = get().projects;
        set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            errorProjects: null, // Clear previous project errors
        }));
        try {
            await deleteProject(id);
            console.log(`[taskStore.ts] Project ${id} deleted successfully via API.`);
            // Re-fetch tasks as some might have been associated with the deleted project
            await get().fetchTasks();
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete project';
            set({ errorProjects: errorMsg, projects: originalProjects });
            console.error('[taskStore.ts] Delete project error:', errorMsg, err);
            throw err;
        }
    },

    // Agent Actions
    fetchAgents: async () => {
        console.log('[taskStore.ts] Starting fetchAgents');
        set({ loadingAgents: true, errorAgents: null });
        try {
            const fetchedAgents = await getAgents();
            set({ agents: fetchedAgents, loadingAgents: false });
            console.log('[taskStore.ts] Agents fetched:', fetchedAgents);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to fetch agents';
            set({ errorAgents: errorMsg, loadingAgents: false });
            console.error('[taskStore.ts] Fetch agents error:', err);
        }
    },
    createAgentAction: async (agentData) => {
        console.log('[taskStore.ts] Starting createAgent with data:', agentData);
        set({ loadingCreateAgent: true, errorCreateAgent: null });
        try {
            const newAgent = await createAgent(agentData);
        set(state => ({
                agents: [...state.agents, newAgent], 
                loadingCreateAgent: false 
            }));
            console.log('[taskStore.ts] Agent created:', newAgent);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to create agent';
            set({ errorCreateAgent: errorMsg, loadingCreateAgent: false });
            console.error('[taskStore.ts] Create agent error:', errorMsg, err);
            throw err;
        }
    },
    updateAgentAction: async (id, agentData) => {
        console.log(`[taskStore.ts] Updating agent ${id} with data:`, agentData);
        try {
            const updatedAgent = await updateAgent(id, agentData);
            set(state => ({
                agents: state.agents.map(a => (a.id === id ? updatedAgent : a))
            }));
            console.log(`[taskStore.ts] Agent ${id} updated successfully.`);
            // Consider re-fetching tasks if agent_name changed and is used in filters/display
            // await get().fetchTasks();
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update agent';
            set({ errorAgents: errorMsg });
            console.error('[taskStore.ts] Update agent error:', errorMsg, err);
            throw err;
        }
    },
    deleteAgentAction: async (id: number) => {
        console.log(`[taskStore.ts] Deleting agent ${id}`);
        const originalAgents = get().agents;
        set(state => ({
            agents: state.agents.filter(a => a.id !== id),
            errorAgents: null,
        }));
        try {
            await deleteAgent(id);
            console.log(`[taskStore.ts] Agent ${id} deleted successfully via API.`);
            await get().fetchTasks(); // Re-fetch tasks if agent deleted
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete agent';
            set({ errorAgents: errorMsg, agents: originalAgents });
            console.error('[taskStore.ts] Delete agent error:', errorMsg, err);
            throw err;
        }
    },
}));
