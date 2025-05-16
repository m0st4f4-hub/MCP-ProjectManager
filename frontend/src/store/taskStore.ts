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
        agentName: null
    },
    projects: [],
    agents: [],
    
    fetchTasks: async () => {
        set({ loading: true, error: null });
        try {
            const tasks = await api.getTasks(get().filters);
            set({ tasks: sortTasks(tasks, get().sortOptions), loading: false });
        } catch (error) {
            set({ error: String(error), loading: false });
        }
    },

    fetchProjectsAndAgents: async () => {
        try {
            const [projects, agents] = await Promise.all([
                api.getProjects(),
                api.getAgents()
            ]);
            set({ projects, agents });
        } catch (error) {
            set({ error: String(error) });
        }
    },

    addTask: async (taskData) => {
        set({ loading: true, error: null });
        try {
            const newTask = await api.createTask(taskData);
            set(state => ({ 
                tasks: sortTasks([newTask, ...state.tasks], state.sortOptions),
                loading: false 
            }));
        } catch (error) {
            set({ error: String(error), loading: false });
        }
    },

    removeTask: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.deleteTask(id);
            set(state => ({
                tasks: state.tasks.filter(task => task.id !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: String(error), loading: false });
        }
    },

    toggleTaskComplete: async (id, completed) => {
        set({ loading: true, error: null });
        try {
            const updated = await api.updateTask(id, { completed });
        set(state => ({
                tasks: sortTasks(
                    state.tasks.map(task => task.id === id ? updated : task),
                    state.sortOptions
                ),
                loading: false
            }));
        } catch (error) {
            set({ error: String(error), loading: false });
        }
    },

    editTask: async (id, taskData) => {
        set({ loading: true, error: null });
        try {
            const updated = await api.updateTask(id, taskData);
            set(state => ({
                tasks: sortTasks(
                    state.tasks.map(task => task.id === id ? updated : task),
                    state.sortOptions
                ),
                editingTask: null,
                isEditModalOpen: false,
                loading: false
            }));
        } catch (error) {
            set({ error: String(error), loading: false });
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
            sortOptions: options,
            tasks: sortTasks(state.tasks, options)
        }));
    },

    setFilters: (filters) => {
        set({ filters });
        get().fetchTasks();
    }
}));

// Helper function to sort tasks
const sortTasks = (tasks: Task[], options: TaskSortOptions): Task[] => {
    return [...tasks].sort((a, b) => {
        if (options.field === 'created_at') {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return options.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        if (options.field === 'title') {
            return options.direction === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        }
        
        return 0;
    });
};
