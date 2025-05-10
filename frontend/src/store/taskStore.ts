// D:\mcp\task-manager\frontend\src\store\taskStore.ts
import { Task, TaskCreateData, TaskUpdateData, TaskFilters, TaskSortOptions, Project, Agent } from '@/types';
import { create } from 'zustand';
import * as api from '@/services/api';

interface TaskState {
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
    removeTask: (id: number) => Promise<void>;
    toggleTaskComplete: (id: number, completed: boolean) => Promise<void>;
    editTask: (id: number, taskData: TaskUpdateData) => Promise<void>;
    openEditModal: (task: Task) => void;
    closeEditModal: () => void;
    setSortOptions: (options: TaskSortOptions) => void;
    setFilters: (filters: TaskFilters) => void;
    startPolling: () => void;
    stopPolling: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    loading: false,
    error: null,
    editingTask: null,
    isEditModalOpen: false,
    sortOptions: {
        field: 'created_at',
        direction: 'desc'
    },
    filters: {
        status: 'all',
        projectId: null,
        agentName: null,
        searchTerm: null
    },
    projects: [],
    agents: [],
    pollingIntervalId: null,
    
    fetchTasks: async () => {
        try {
            const tasks = await api.getTasks(get().filters);
            set(state => ({ ...state, tasks: sortTasks(tasks, state.sortOptions), error: null }));
        } catch (error) {
            set(state => ({ ...state, error: String(error) }));
        }
    },

    fetchProjectsAndAgents: async () => {
        try {
            const [projects, agents] = await Promise.all([
                api.getProjects(),
                api.getAgents()
            ]);
            set(state => ({ ...state, projects, agents, error: null }));
        } catch (error) {
            set(state => ({ ...state, error: String(error) }));
        }
    },

    startPolling: () => {
        const { fetchTasks, fetchProjectsAndAgents, pollingIntervalId } = get();
        if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
        }
        
        set({ loading: true });
        Promise.all([fetchTasks(), fetchProjectsAndAgents()]).finally(() => {
            set({ loading: false });
        });

        const intervalId = setInterval(() => {
            fetchTasks();
            fetchProjectsAndAgents();
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
            const newTask = await api.createTask(taskData);
            set(state => ({ 
                ...state,
                tasks: sortTasks([newTask, ...state.tasks], state.sortOptions),
                loading: false 
            }));
        } catch (error) {
            set(state => ({ ...state, error: String(error), loading: false }));
        }
    },

    removeTask: async (id) => {
        set(state => ({ ...state, loading: true, error: null }));
        try {
            await api.deleteTask(id);
            set(state => ({
                ...state,
                tasks: state.tasks.filter(task => task.id !== id),
                loading: false
            }));
        } catch (error) {
            set(state => ({ ...state, error: String(error), loading: false }));
        }
    },

    toggleTaskComplete: async (id, completed) => {
        try {
            const updated = await api.updateTask(id, { completed });
        set(state => ({
                ...state,
                tasks: sortTasks(
                    state.tasks.map(task => task.id === id ? updated : task),
                    state.sortOptions
                ),
            }));
        } catch (error) {
            set(state => ({ ...state, error: String(error) }));
        }
    },

    editTask: async (id, taskData) => {
        set(state => ({ ...state, loading: true, error: null }));
        try {
            const updated = await api.updateTask(id, taskData);
            set(state => ({
                ...state,
                tasks: sortTasks(
                    state.tasks.map(task => task.id === id ? updated : task),
                    state.sortOptions
                ),
                editingTask: null,
                isEditModalOpen: false,
                loading: false
            }));
        } catch (error) {
            set(state => ({ ...state, error: String(error), loading: false }));
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

    setFilters: (filters) => {
        set(state => ({ ...state, filters }));
        get().fetchTasks();
    }
}));

// Helper function to sort tasks
const sortTasks = (tasks: Task[], options: TaskSortOptions): Task[] => {
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
        
        return 0;
    });
};
