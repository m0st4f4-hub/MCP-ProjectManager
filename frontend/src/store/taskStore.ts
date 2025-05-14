// D:\mcp\task-manager\frontend\src\store\taskStore.ts
import { Task, TaskCreateData, TaskUpdateData, TaskFilters, TaskSortOptions, Project, Agent, TaskSortField } from '@/types';
import { create } from 'zustand';
import * as api from '@/services/api';

// Helper function to get all descendant task IDs
const getAllDescendantIds = (taskId: string, tasks: Task[]): string[] => {
    const descendants: string[] = [];
    const children = tasks.filter(task => task.parent_task_id === taskId);
    for (const child of children) {
        descendants.push(child.id);
        descendants.push(...getAllDescendantIds(child.id, tasks));
    }
    return descendants;
};

// Helper function to upsert tasks (and their subtasks recursively) into a flat list
const upsertTasks = (tasksToUpsert: Task[], existingTasks: Task[]): Task[] => {
    const taskMap = new Map(existingTasks.map(task => [task.id, task]));

    const tasksToProcess = [...tasksToUpsert];
    while (tasksToProcess.length > 0) {
        const currentTask = tasksToProcess.pop();
        if (!currentTask) continue;

        taskMap.set(currentTask.id, currentTask); // Add or update the task

        if (currentTask.subtasks && currentTask.subtasks.length > 0) {
            tasksToProcess.push(...currentTask.subtasks); // Add subtasks to the processing queue
        }
    }
    return Array.from(taskMap.values());
};

export interface TaskState { // Added export
    tasks: Task[];
    loading: boolean;
    error: string | null;
    editingTask: Task | null;
    isEditModalOpen: boolean;
    sortOptions: TaskSortOptions;
    filters: TaskFilters;
    projects: Project[];
    agents: Agent[];
    pollingIntervalId: NodeJS.Timeout | null;
    
    // Actions
    fetchTasks: () => Promise<void>;
    fetchProjectsAndAgents: () => Promise<void>;
    addTask: (taskData: TaskCreateData) => Promise<void>;
    removeTask: (id: string) => Promise<void>;
    toggleTaskComplete: (id: string, completed: boolean) => Promise<void>;
    editTask: (id: string, taskData: TaskUpdateData) => Promise<void>;
    openEditModal: (task: Task) => void;
    closeEditModal: () => void;
    setSortOptions: (options: TaskSortOptions) => void;
    setFilters: (filters: TaskFilters) => void;
    startPolling: () => void;
    stopPolling: () => void;
    deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    loading: false,
    error: null,
    editingTask: null,
    isEditModalOpen: false,
    sortOptions: {
        field: 'created_at' as TaskSortField,
        direction: 'desc'
    },
    filters: {
        status: 'all',
        projectId: null,
        agentId: null,
        searchTerm: null,
        top_level_only: true,
    },
    projects: [],
    agents: [],
    pollingIntervalId: null,
    
    fetchTasks: async () => {
        const filters = get().filters;
        set({ loading: true, error: null });
        try {
            console.log("[fetchTasks] Fetching with filters:", filters);
            const tasks = await api.getTasks(filters);
            set({ tasks, loading: false });
        } catch (error: unknown) {
            let errorMessage = 'Failed to fetch tasks';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            set({ error: errorMessage, loading: false });
        }
    },

    fetchProjectsAndAgents: async () => {
        try {
            console.log("[fetchProjectsAndAgents] Fetching projects and agents...");
            const projects = await api.getProjects(); 
            const agents = await api.getAgents();
            set({ projects, agents });
        } catch (error: unknown) {
            let errorMessage = 'Failed to fetch projects/agents';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }            
            set(state => ({ ...state, error: `Failed to fetch projects/agents: ${errorMessage}` }));
        }
    },

    startPolling: () => {
        const { fetchTasks, fetchProjectsAndAgents, pollingIntervalId } = get();
        if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
        }
        
        set({ loading: true });
        Promise.all([
            fetchTasks(),
            fetchProjectsAndAgents()
        ]).finally(() => {
            set({ loading: false });
        });

        const intervalId = setInterval(() => {
            console.log("[Polling] Fetching tasks...");
            fetchTasks();
        }, 20000);
        set({ pollingIntervalId: intervalId });
    },

    stopPolling: () => {
        const { pollingIntervalId } = get();
        if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
            set({ pollingIntervalId: null });
        }
    },

    addTask: async (taskData) => {
        set(state => ({ ...state, loading: true, error: null }));
        try {
            const newTaskFromApi = await api.createTask(taskData);
            set(state => ({ 
                ...state,
                tasks: sortTasks(upsertTasks([newTaskFromApi], state.tasks), state.sortOptions),
                loading: false 
            }));
        } catch (error: unknown) {
            let errorMessage = 'Failed to add task';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            set(state => ({ ...state, error: errorMessage, loading: false }));
        }
    },

    removeTask: async (id) => {
        const originalTasks = get().tasks;
        
        // Optimistically remove the task and its descendants
        const idsToRemove = new Set([id, ...getAllDescendantIds(id, originalTasks)]);
        const remainingTasksOptimistic = originalTasks.filter(task => !idsToRemove.has(task.id));
        
        set(state => ({
            ...state,
            tasks: sortTasks(remainingTasksOptimistic, state.sortOptions), // Use sortTasks for consistency if needed
            error: null // Clear previous errors for this action
        }));
        
        try {
            // Make the API call
            await api.deleteTask(id);
            // If successful, no need to update state again as it's already removed optimistically
        } catch (error: unknown) {
            let errorMessage = `Failed to delete task ${id}`;
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else {
                errorMessage = `Failed to delete task ${id}: An unknown error occurred`; // Specific message if not Error/string
            }
            // Revert to original state on error
            set(state => ({
                ...state,
                tasks: sortTasks(originalTasks, state.sortOptions),
                error: errorMessage
            }));
        }
    },

    toggleTaskComplete: async (id, completed) => {
        const originalTasks = get().tasks;
        // Optimistically update the UI
        const updatedTasksOptimistic = originalTasks.map(task => 
            task.id === id ? { ...task, completed, updated_at: new Date().toISOString() } : task
        );
        set(state => ({
            ...state,
            tasks: sortTasks(updatedTasksOptimistic, state.sortOptions),
            error: null // Clear previous errors for this action
        }));

        try {
            // Make the API call
            const updatedTaskFromApi = await api.updateTask(id, { completed });
            // Sync with server state (optional if API returns the full updated task)
            // If the API returns the full task, it's good to re-upsert to ensure consistency
            set(state => ({
                ...state,
                tasks: sortTasks(
                    upsertTasks([updatedTaskFromApi], state.tasks), // Use upsert to ensure subtasks/etc. are handled if they were part of the response
                    state.sortOptions
                ),
            }));
        } catch (error: unknown) {
            let errorMessage = `Failed to update task ${id}`;
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else {
                errorMessage = `Failed to update task ${id}: An unknown error occurred`;
            }
            // Revert to original state on error
            set(state => ({
                ...state,
                tasks: sortTasks(originalTasks, state.sortOptions),
                error: errorMessage
            }));
        }
    },

    editTask: async (id, taskData) => {
        set(state => ({ ...state, loading: true, error: null }));
        try {
            const updatedTaskFromApi = await api.updateTask(id, taskData);
            set(state => ({
                ...state,
                tasks: sortTasks(
                    upsertTasks([updatedTaskFromApi], state.tasks),
                    state.sortOptions
                ),
                editingTask: null,
                isEditModalOpen: false,
                loading: false
            }));
        } catch (error: unknown) {
            let errorMessage = 'Failed to edit task';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            set(state => ({ ...state, error: errorMessage, loading: false }));
        }
    },

    openEditModal: (task) => {
        set({ editingTask: task, isEditModalOpen: true });
    },

    closeEditModal: () => {
        set({ editingTask: null, isEditModalOpen: false });
    },

    setSortOptions: (options) => {
        set(state => ({
            ...state,
            sortOptions: options,
            tasks: sortTasks(state.tasks, options)
        }));
    },

    setFilters: (newFilters: Partial<TaskFilters>) => {
        set(state => ({
            filters: { ...state.filters, ...newFilters }
        }));
        get().fetchTasks();
    },

    deleteTask: async (id: string) => {
        const originalTasks = get().tasks;
        // Optimistic update
        set(state => ({ tasks: state.tasks.filter(task => task.id !== id) }));

        try {
            await api.deleteTask(id);
            // Fetch projects and agents again to update counts
            get().fetchProjectsAndAgents(); 
        } catch (error: unknown) {
            console.error('Failed to delete task:', error);
            let errorMessage = 'Error during task deletion in store';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            // Revert optimistic update
            set({ tasks: originalTasks, error: errorMessage }); // also set error state
            throw error; // Re-throw to allow UI to handle if needed
        }
    }
}));

// Helper function to sort tasks
export const sortTasks = (tasks: Task[], options: TaskSortOptions): Task[] => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => {
        if (!a || !b) return 0;

        if (options.field === 'created_at') {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return options.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (options.field === 'title') {
            if (!a.title || !b.title) return 0;
            return options.direction === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        }
        if (options.field === 'status') {
            if (a.status && b.status) {
                return options.direction === 'asc'
                    ? a.status.localeCompare(b.status)
                    : b.status.localeCompare(a.status);
            }
            return 0;
        }
        if (options.field === 'agent') {
            const agentA = typeof a.agent === 'string' ? a.agent : a.agent?.name || '';
            const agentB = typeof b.agent === 'string' ? b.agent : b.agent?.name || '';
            return options.direction === 'asc'
                ? agentA.localeCompare(agentB)
                : agentB.localeCompare(agentA);
        }
        return 0;
    });
};
