// D:\mcp\task-manager\frontend\src\store\taskStore.ts
import { Task, TaskCreateData, TaskUpdateData, TaskFilters, TaskSortOptions, Project, Agent, TaskSortField } from '@/types';
import { create } from 'zustand';
import * as api from '@/services/api';
import { produce } from 'immer';
import shallow from 'zustand/shallow';
import debounce from 'lodash.debounce';

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

// Improved upsertTasks: preserve references for unchanged items
const upsertTasks = (tasksToUpsert: Task[], existingTasks: Task[]): Task[] => {
    const taskMap = new Map(existingTasks.map(task => [task.id, task]));
    const result: Task[] = [];
    for (const newTask of tasksToUpsert) {
        const oldTask = taskMap.get(newTask.id);
        if (oldTask && shallowEqual(oldTask, newTask)) {
            result.push(oldTask); // preserve reference
        } else {
            result.push(newTask);
        }
    }
    return result;
};

// Utility: Compare arrays of tasks by id and shallow equality
const areTasksEqual = (a: Task[], b: Task[]): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i].id !== b[i].id || !shallowEqual(a[i], b[i])) return false;
    }
    return true;
};

// Debounced polling function
let debouncedFetchTasks: (() => void) | null = null;

export interface TaskState { // Added export
    tasks: Task[];
    loading: boolean; // For initial load or major user-initiated refreshes
    isPolling: boolean; // To indicate background activity
    error: string | null;
    pollingError: string | null; // For non-intrusive polling errors
    mutationError: { type: 'add' | 'edit' | 'delete' | 'toggle' | 'bulk' | 'archive' | 'unarchive', message: string, taskId?: string, originalTask?: Task, optimisticTask?: Task | TaskCreateData } | null; // MODIFIED: Added archive/unarchive to type
    editingTask: Task | null;
    isEditModalOpen: boolean;
    sortOptions: TaskSortOptions;
    filters: TaskFilters;
    projects: Project[];
    agents: Agent[];
    pollingIntervalId: NodeJS.Timeout | null;
    selectedTaskIds: string[]; // New state for selected task IDs
    
    // Actions
    fetchTasks: (filters?: TaskFilters, isPoll?: boolean) => Promise<void>; // MODIFIED to accept isPoll to differentiate behavior
    fetchProjectsAndAgents: () => Promise<void>;
    addTask: (taskData: TaskCreateData) => Promise<void>;
    updateTask: (taskId: string, taskData: Partial<TaskUpdateData>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    setSortOptions: (sortOptions: TaskSortOptions) => void;
    setFilters: (filters: Partial<TaskFilters>) => void; // MODIFIED: Partial for filters
    setEditingTask: (task: Task | null) => void;
    clearError: () => void;
    clearPollingError: () => void;
    clearMutationError: () => void;
    getTaskById: (id: string) => Task | undefined;
    startPolling: () => void;
    stopPolling: () => void;

    // Selection Actions
    toggleTaskSelection: (taskId: string) => void;
    selectAllTasks: (taskIds: string[]) => void;
    deselectAllTasks: () => void;
    // Bulk actions
    bulkDeleteTasks: () => Promise<void>;
    bulkSetStatusTasks: (status: string) => Promise<void>; 
    removeTasksByProjectId: (projectId: string) => void;

    // Archive actions ADDED
    archiveTask: (taskId: string) => Promise<void>;
    unarchiveTask: (taskId: string) => Promise<void>;
    archiveTasksByProjectId: (projectId: string) => void;
    unarchiveTasksByProjectId: (projectId: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    loading: false,
    isPolling: false,
    error: null,
    pollingError: null,
    mutationError: null,
    editingTask: null,
    isEditModalOpen: false,
    sortOptions: {
        field: 'created_at' as TaskSortField,
        direction: 'desc'
    },
    filters: {
        top_level_only: true,
        hideCompleted: false,
        is_archived: false,
    },
    projects: [],
    agents: [],
    pollingIntervalId: null,
    selectedTaskIds: [],
    
    fetchTasks: async (filtersToApply?: TaskFilters, isPoll = false) => {
        if (!isPoll) {
            set({ loading: true, error: null });
        } else {
            set({ isPolling: true, pollingError: null });
        }
        const currentActiveFilters = filtersToApply || get().filters;
        console.log('[TaskStore] Fetching tasks with filters:', currentActiveFilters);
        try {
            const fetchedTasks = await api.getTasks(currentActiveFilters);
            set(state => {
                let updatedTasks = upsertTasks(fetchedTasks, state.tasks);
                const fetchedIds = new Set(fetchedTasks.map(t => t.id));
                updatedTasks = updatedTasks.filter(t => fetchedIds.has(t.id));

                const newState: Partial<TaskState> = {};
                if (!isPoll && areTasksEqual(updatedTasks, state.tasks) && !filtersToApply) {
                    newState.loading = false;
                    return newState;
                }
                newState.tasks = sortTasks(updatedTasks, state.sortOptions);
                if (!isPoll) newState.loading = false;
                if (isPoll) newState.isPolling = false;
                if (filtersToApply) newState.filters = currentActiveFilters;
                return newState;
            });
        } catch (error: unknown) {
            let errorMessage = 'Failed to fetch tasks';
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            
            if (!isPoll) {
                set({ error: errorMessage, loading: false });
            } else {
                set({ pollingError: errorMessage, isPolling: false });
            }
            console.error("Fetch Tasks Error:", error);
        }
    },

    fetchProjectsAndAgents: async () => {
        try {
            const [projects, agents] = await Promise.all([
                api.getProjects({ is_archived: null }),
                api.getAgents()
            ]);
            set({ projects, agents });
        } catch (error) {
            let errorMessage = 'Failed to fetch projects and agents';
            if (error instanceof Error) errorMessage = error.message;
            else if (typeof error === 'string') errorMessage = error;
            console.error("Error fetching projects and agents:", error);
        }
    },

    startPolling: () => {
        const { fetchTasks, fetchProjectsAndAgents, pollingIntervalId, filters } = get();
        if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
        }
        set({ loading: true, error: null, pollingError: null });
        Promise.all([
            fetchTasks(filters, false),
            fetchProjectsAndAgents()
        ]).finally(() => {
            set({ loading: false });
        });

        debouncedFetchTasks = debounce(() => fetchTasks(get().filters, true), 5000);

        const intervalId = setInterval(() => {
            if (debouncedFetchTasks) debouncedFetchTasks();
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

    addTask: async (taskData: TaskCreateData) => {
        set({ loading: true, mutationError: null });
        try {
            const newTask = await api.createTask(taskData);
            set(state => {
                const newTasks = sortTasks([...state.tasks, newTask], state.sortOptions);
                return {
                    tasks: newTasks,
                    loading: false,
                };
            });
            get().fetchProjectsAndAgents();
        } catch (error) {
            let errorMessage = 'Failed to add task';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            set({ mutationError: errorMessage, loading: false });
            console.error("Error adding task:", error);
            throw error;
        }
    },

    updateTask: async (taskId: string, taskData: Partial<TaskUpdateData>) => {
        set({ loading: true, mutationError: null });
        const originalTask = get().tasks.find(t => t.id === taskId);
        try {
            const updatedTask = await api.updateTask(taskId, taskData as TaskUpdateData);
            set(produce((state: TaskState) => {
                const index = state.tasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    state.tasks[index] = updatedTask;
                    state.tasks = sortTasks(state.tasks, state.sortOptions);
                }
            }));
            const currentFilters = get().filters;
            if (taskData.is_archived !== undefined && taskData.is_archived !== currentFilters.is_archived) {
                await get().fetchTasks(currentFilters);
            }
            set({ loading: false });
        } catch (error) {
            let errorMessage = 'Failed to update task';
            if (error instanceof Error) errorMessage = error.message;
            set({ mutationError: { type: 'edit', message: errorMessage, taskId, originalTask }, loading: false });
            console.error("Error updating task:", error);
            throw error;
        }
    },

    deleteTask: async (taskId: string) => {
        set({ loading: true, mutationError: null });
        try {
            await api.deleteTask(taskId);
            set(state => {
                const newTasks = state.tasks.filter(t => t.id !== taskId);
                return {
                    tasks: sortTasks(newTasks, state.sortOptions),
                    selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
                    loading: false,
                };
            });
        } catch (error) {
            let errorMessage = 'Failed to delete task';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            set({ mutationError: errorMessage, loading: false });
            console.error("Error deleting task:", error);
            throw error;
        }
    },

    openEditModal: (task) => {
        set({ editingTask: task, isEditModalOpen: true });
    },

    closeEditModal: () => {
        set({ editingTask: null, isEditModalOpen: false });
    },

    setSortOptions: (sortOptions: TaskSortOptions) => {
        set({ sortOptions });
        get().fetchTasks();
    },

    setFilters: (newFilters: Partial<TaskFilters>) => {
        const currentFilters = get().filters;
        const mergedFilters = { ...currentFilters, ...newFilters };
        if (mergedFilters.is_archived === currentFilters.is_archived && 
            mergedFilters.projectId === currentFilters.projectId && 
            mergedFilters.status === currentFilters.status &&
            mergedFilters.search === currentFilters.search &&
            mergedFilters.hideCompleted === currentFilters.hideCompleted) {
            if(!shallowEqual(mergedFilters, currentFilters)) {
                 set({ filters: mergedFilters });
            }
        }
        set({ filters: mergedFilters });
        console.log('[TaskStore] Setting new task filters and re-fetching:', mergedFilters);
        get().fetchTasks(mergedFilters, false);
    },

    setEditingTask: (task: Task | null) => set({ editingTask: task, isEditModalOpen: !!task }),

    clearError: () => set({ error: null }),
    clearPollingError: () => set({ pollingError: null }),
    clearMutationError: () => set({ mutationError: null }),

    getTaskById: (id: string) => {
        return get().tasks.find(task => task.id === id);
    },

    toggleTaskSelection: (taskId: string) => {
        set(produce((state: TaskState) => {
            const index = state.selectedTaskIds.indexOf(taskId);
            if (index > -1) {
                state.selectedTaskIds.splice(index, 1);
            } else {
                state.selectedTaskIds.push(taskId);
            }
        }));
    },
    selectAllTasks: (taskIds: string[]) => {
        set({ selectedTaskIds: taskIds });
    },
    deselectAllTasks: () => {
        set({ selectedTaskIds: [] });
    },
    bulkDeleteTasks: async () => {
        const { selectedTaskIds, tasks } = get();
        if (selectedTaskIds.length === 0) return;
        set({ loading: true, mutationError: null });
        try {
            await Promise.all(selectedTaskIds.map(id => api.deleteTask(id)));
            set(produce((draft: TaskState) => {
                draft.tasks = draft.tasks.filter(task => !selectedTaskIds.includes(task.id));
                draft.selectedTaskIds = [];
            }));
            set({ loading: false });
        } catch (error) {
            let errorMessage = 'Failed to bulk delete tasks';
            if (error instanceof Error) errorMessage = error.message;
            set({ mutationError: { type: 'bulk', message: errorMessage }, loading: false });
            console.error("Bulk Delete Error:", error);
        }
    },
    bulkSetStatusTasks: async (status: string) => {
        const { selectedTaskIds, tasks } = get();
        if (selectedTaskIds.length === 0) return;

        const originalTasks: Task[] = [];
        selectedTaskIds.forEach(id => {
            const task = tasks.find(t => t.id === id);
            if (task) originalTasks.push(JSON.parse(JSON.stringify(task)));
        });

        set(produce((draft: TaskState) => {
            selectedTaskIds.forEach(id => {
                const task = draft.tasks.find(t => t.id === id);
                if (task) task.status = status;
            });
        }));

        try {
            await Promise.all(selectedTaskIds.map(id => 
                api.updateTask(id, { status } as Partial<TaskUpdateData>)
            ));
            await get().fetchTasks(get().filters);
        } catch (error) {
            let errorMessage = 'Failed to bulk update task statuses';
            if (error instanceof Error) errorMessage = error.message;
            set(produce((draft: TaskState) => {
                originalTasks.forEach(originalTask => {
                    const taskIndex = draft.tasks.findIndex(t => t.id === originalTask.id);
                    if (taskIndex !== -1) {
                        draft.tasks[taskIndex] = originalTask;
                    }
                });
                draft.mutationError = { type: 'bulk', message: errorMessage };
            }));
            console.error("Bulk Set Status Error:", error);
        }
    },
    removeTasksByProjectId: (projectId: string) => {
        set(produce((draft: TaskState) => {
            draft.tasks = draft.tasks.filter(task => task.project_id !== projectId);
            draft.selectedTaskIds = draft.selectedTaskIds.filter(taskId => {
                const task = draft.tasks.find(t => t.id === taskId);
                return task ? task.project_id !== projectId : false;
            });
        }));
    },
    archiveTask: async (taskId: string) => {
        set({ loading: true, mutationError: null });
        const originalTask = get().tasks.find(t => t.id === taskId);
        try {
            const archivedTask = await api.archiveTask(taskId);
            set(produce((state: TaskState) => {
                const index = state.tasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    state.tasks[index] = archivedTask;
                }
                state.tasks = sortTasks(state.tasks, state.sortOptions);
            }));
            const currentFilters = get().filters;
            if (currentFilters.is_archived === false && archivedTask.is_archived === true) {
                await get().fetchTasks(currentFilters);
            } else {
                set({ loading: false });
            }
        } catch (error) {
            let errorMessage = 'Failed to archive task';
            if (error instanceof Error) errorMessage = error.message;
            set({ mutationError: { type: 'archive', message: errorMessage, taskId, originalTask }, loading: false });
            console.error("Archive Task Error:", error);
            throw error;
        }
    },
    unarchiveTask: async (taskId: string) => {
        set({ loading: true, mutationError: null });
        const originalTask = get().tasks.find(t => t.id === taskId);
        try {
            const unarchivedTask = await api.unarchiveTask(taskId);
            set(produce((state: TaskState) => {
                const index = state.tasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    state.tasks[index] = unarchivedTask;
                }
                state.tasks = sortTasks(state.tasks, state.sortOptions);
            }));
            const currentFilters = get().filters;
            if (currentFilters.is_archived === true && unarchivedTask.is_archived === false) {
                await get().fetchTasks(currentFilters);
            } else {
                set({ loading: false });
            }
        } catch (error) {
            let errorMessage = 'Failed to unarchive task';
            if (error instanceof Error) errorMessage = error.message;
            set({ mutationError: { type: 'unarchive', message: errorMessage, taskId, originalTask }, loading: false });
            console.error("Unarchive Task Error:", error);
            throw error;
        }
    },
    archiveTasksByProjectId: (projectId: string) => {
        set(produce((state: TaskState) => {
            state.tasks.forEach(task => {
                if (task.project_id === projectId && !task.is_archived) {
                    task.is_archived = true;
                    task.updated_at = new Date().toISOString();
                }
            });
            state.tasks = sortTasks(state.tasks, state.sortOptions);
        }));
        if (get().filters.is_archived === false) {
            get().fetchTasks(get().filters);
        }
    },
    unarchiveTasksByProjectId: (projectId: string) => {
        set(produce((state: TaskState) => {
            state.tasks.forEach(task => {
                if (task.project_id === projectId && task.is_archived) {
                    task.is_archived = false;
                    task.updated_at = new Date().toISOString();
                }
            });
            state.tasks = sortTasks(state.tasks, state.sortOptions);
        }));
        if (get().filters.is_archived === true) {
            get().fetchTasks(get().filters);
        }
    },
}));

// Helper function to sort tasks
export const sortTasks = (tasks: Task[], options: TaskSortOptions): Task[] => {
    if (!tasks) return [];
    const field = options.field;
    const direction = options.direction === 'asc' ? 1 : -1;
    return [...tasks].sort((a, b) => {
        let valA = a[field as keyof Task];
        let valB = b[field as keyof Task];

        if (valA == null && valB == null) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
            return valA.localeCompare(valB) * direction;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
            return (valA - valB) * direction;
        }
        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
            return (valA === valB ? 0 : valA ? -1 : 1) * direction;
        }
        if (field === 'created_at' || field === 'updated_at') {
            return (new Date(valA as string).getTime() - new Date(valB as string).getTime()) * direction;
        }
        return 0;
    });
};
