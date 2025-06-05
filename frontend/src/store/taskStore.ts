// D:\mcp\task-manager\frontend\src\store\taskStore.ts
import {
  Task,
  TaskCreateData,
  TaskUpdateData,
  TaskFilters,
  TaskSortOptions,
  Project,
  Agent,
  TaskSortField,
} from "@/types";
import { TaskStatus } from "@/types/task";
import { create, type StoreApi } from "zustand";
import * as api from "@/services/api";
import { produce } from "immer";
import { shallow } from "zustand/shallow";
import debounce from "lodash.debounce";
import { useProjectStore } from "./projectStore";
import { useAgentStore } from "./agentStore";

// Improved upsertTasks: preserve references for unchanged items
const upsertTasks = (tasksToUpsert: Task[], existingTasks: Task[]): Task[] => {
  const taskMap = new Map(
    existingTasks.map((task: Task) => [`${task.project_id}-${task.task_number}`, task]),
  );
  const result: Task[] = [];
  for (const newTask of tasksToUpsert) {
    const oldTask = taskMap.get(`${newTask.project_id}-${newTask.task_number}`);
    if (oldTask && shallow(oldTask, newTask)) {
      result.push(oldTask); // preserve reference
    } else {
      result.push(newTask);
    }
  }
  return result;
};

// Utility: Compare arrays of tasks by composite key and shallow equality
const areTasksEqual = (a: Task[], b: Task[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].project_id !== b[i].project_id ||
      a[i].task_number !== b[i].task_number ||
      !shallow(a[i], b[i])
    ) {
      return false;
    }
  }
  return true;
};

// Debounced polling function
let debouncedFetchTasks: (() => void) | null = null;

export interface TaskState {
  // Added export
  tasks: Task[];
  loading: boolean; // For initial load or major user-initiated refreshes
  isPolling: boolean; // To indicate background activity
  error: string | null;
  pollingError: string | null; // For non-intrusive polling errors
  mutationError: {
    type:
      | "add"
      | "edit"
      | "delete"
      | "toggle"
      | "bulk"
      | "archive"
      | "unarchive";
    message: string;
    taskId?: string;
    originalTask?: Task;
    optimisticTask?: Task | TaskCreateData;
  } | null; // MODIFIED: Added archive/unarchive to type
  editingTask: Task | null;
  isEditModalOpen: boolean;
  sortOptions: TaskSortOptions;
  filters: TaskFilters;
  projects: Project[];
  agents: Agent[];
  pollingIntervalId: NodeJS.Timeout | null;
  selectedTaskIds: string[]; // Now stores composite keys like "project_id-task_number"

  // Actions
  fetchTasks: (filters?: TaskFilters, isPoll?: boolean) => Promise<void>; // MODIFIED to accept isPoll to differentiate behavior
  fetchProjectsAndAgents: () => Promise<void>;
  addTask: (taskData: TaskCreateData) => Promise<void>;
  updateTask: (
    project_id: string,
    task_number: number,
    taskData: Partial<TaskUpdateData>,
  ) => Promise<void>;
  deleteTask: (
    project_id: string,
    task_number: number,
  ) => Promise<void>;
  setSortOptions: (sortOptions: TaskSortOptions) => void;
  setFilters: (filters: Partial<TaskFilters>) => void; // MODIFIED: Partial for filters
  setEditingTask: (task: Task | null) => void;
  clearError: () => void;
  clearPollingError: () => void;
  clearMutationError: () => void;
  getTaskById: (
    project_id: string,
    task_number: number,
  ) => Task | undefined;
  startPolling: () => void;
  stopPolling: () => void;

  // Selection Actions
  toggleTaskSelection: (taskKey: string) => void;
  selectAllTasks: (taskKeys: string[]) => void; // Expects composite keys
  deselectAllTasks: () => void;
  // Bulk actions
  bulkDeleteTasks: () => Promise<void>;
  bulkSetStatusTasks: (status: TaskStatus) => Promise<void>;
  removeTasksByProjectId: (projectId: string) => void;

  // Archive actions ADDED
  archiveTask: (
    project_id: string,
    task_number: number,
  ) => Promise<void>;
  unarchiveTask: (
    project_id: string,
    task_number: number,
  ) => Promise<void>;
  archiveTasksByProjectId: (projectId: string) => void;
  unarchiveTasksByProjectId: (projectId: string) => void;
}

export const useTaskStore = create<TaskState>(
  (
    set: StoreApi<TaskState>["setState"],
    get: StoreApi<TaskState>["getState"],
  ) => ({
  tasks: [],
  loading: false,
  isPolling: false,
  error: null,
  pollingError: null,
  mutationError: null,
  editingTask: null,
  isEditModalOpen: false,
  sortOptions: {
    field: "created_at" as TaskSortField,
    direction: "desc",
  },
  filters: {
    top_level_only: true,
    hideCompleted: false,
    is_archived: false,
    projectId: undefined,
    agentId: undefined,
    status: "all",
    search: undefined,
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
    const currentSortOptions = get().sortOptions;
    console.log(
      "[TaskStore] Fetching tasks with filters:",
      currentActiveFilters,
      "and sort options:",
      currentSortOptions,
    );
    try {
      // Pass sortOptions to API so backend handles sorting
      const fetchedTasks = await api.getAllTasks(
        currentActiveFilters,
        currentSortOptions,
        0,
        100,
      );
      set((state: TaskState) => {
        let updatedTasks = upsertTasks(fetchedTasks, state.tasks);
        const fetchedIds = new Set(
          fetchedTasks.map((t: Task) => `${t.project_id}-${t.task_number}`),
        );
        updatedTasks = updatedTasks.filter((t: Task) =>
          fetchedIds.has(`${t.project_id}-${t.task_number}`),
        );
        const newState: Partial<TaskState> = {};
        if (
          !isPoll &&
          areTasksEqual(updatedTasks, state.tasks) &&
          !filtersToApply
        ) {
          newState.loading = false;
          return newState;
        }
        newState.tasks = updatedTasks; // No local sort, backend handles order
        if (!isPoll) newState.loading = false;
        if (isPoll) newState.isPolling = false;
        if (filtersToApply) newState.filters = currentActiveFilters;
        return newState;
      });
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch tasks";
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === "string") errorMessage = error;
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
      const projectArchiveFilter =
        useProjectStore.getState().filters.is_archived;
      const agentArchiveFilter = useAgentStore.getState().filters.is_archived;

      const [projects, agents] = await Promise.all([
        api.getProjects({
          is_archived:
            projectArchiveFilter === null ? undefined : projectArchiveFilter,
        }),
        api.getAgents(
          0, // Default skip
          100, // Default limit
          undefined, // No search query here
          undefined, // No status filter here
          agentArchiveFilter === null ? undefined : agentArchiveFilter // Pass is_archived filter
        ),
      ]);
      set({ projects, agents });
    } catch (error) {
      let errorMessage = "Failed to fetch projects and agents";
      if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === "string") errorMessage = error;
      console.error("Error fetching projects and agents:", errorMessage, error);
    }
  },

  startPolling: () => {
    const { fetchTasks, fetchProjectsAndAgents, pollingIntervalId, filters } =
      get();
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
    }
    set({ loading: true, error: null, pollingError: null });
    Promise.all([fetchTasks(filters, false), fetchProjectsAndAgents()]).finally(
      () => {
        set({ loading: false });
      },
    );

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
      const project_id = taskData.project_id;
      if (!project_id) {
        throw new Error("Project ID is required to add a task.");
      }
      const newTask = await api.createTask(project_id, taskData);
      set((state: TaskState) => {
        // Insert new task at the start (or end) as desired, backend will re-sort on next fetch
        const newTasks = [newTask, ...state.tasks];
        return {
          tasks: newTasks,
          loading: false,
        };
      });
      get().fetchProjectsAndAgents();
    } catch (error) {
      let errorMessage = "Failed to add task";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      set({
        mutationError: { type: "add", message: errorMessage },
        loading: false,
      });
      console.error("Error adding task:", error);
      throw error;
    }
  },

  updateTask: async (project_id: string, task_number: number, taskData: Partial<TaskUpdateData>) => {
    set({ loading: true, mutationError: null });
    const originalTask = get().tasks.find(
      (t: Task) => t.project_id === project_id && t.task_number === task_number,
    );
    try {
      const updatedTask = await api.updateTask(
        project_id,
        task_number,
        taskData as TaskUpdateData,
      );
      set(
        produce((state: TaskState) => {
          const index = state.tasks.findIndex(
            (t: Task) => t.project_id === project_id && t.task_number === task_number,
          );
          if (index !== -1) {
            state.tasks[index] = updatedTask;
          }
          // No local sort, backend handles order
        }),
      );
      const currentFilters = get().filters;
      if (
        taskData.is_archived !== undefined &&
        taskData.is_archived !== currentFilters.is_archived
      ) {
        await get().fetchTasks(currentFilters);
      }
      set({ loading: false });
    } catch (error) {
      let errorMessage = "Failed to update task";
      if (error instanceof Error) errorMessage = error.message;
      set({
        mutationError: {
          type: "edit",
          message: errorMessage,
          taskId: `${project_id}-${task_number}`,
          originalTask,
        },
        loading: false,
      });
      console.error("Error updating task:", error);
      throw error;
    }
  },

  deleteTask: async (project_id: string, task_number: number) => {
    set({ loading: true, mutationError: null });
    try {
      await api.deleteTask(project_id, task_number);
      set((state: TaskState) => {
        const newTasks = state.tasks.filter(
          (t: Task) => t.project_id !== project_id || t.task_number !== task_number,
        );
        return {
          tasks: newTasks, // No local sort
          selectedTaskIds: state.selectedTaskIds.filter((id: string) => id !== `${project_id}-${task_number}`),
          loading: false,
        };
      });
    } catch (error) {
      let errorMessage = "Failed to delete task";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      set({
        mutationError: { type: "delete", message: errorMessage },
        loading: false,
      });
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  openEditModal: (task: Task) => {
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
    if (!shallow(mergedFilters, currentFilters)) {
      set({ filters: mergedFilters });
      console.log(
        "[TaskStore] Setting new task filters and re-fetching:",
        mergedFilters,
      );
      get().fetchTasks(mergedFilters, false);
    }
  },

  setEditingTask: (task: Task | null) =>
    set({ editingTask: task, isEditModalOpen: !!task }),

  clearError: () => set({ error: null }),
  clearPollingError: () => set({ pollingError: null }),
  clearMutationError: () => set({ mutationError: null }),

  getTaskById: (project_id: string, task_number: number) => {
    return get().tasks.find(
      (task: Task) => task.project_id === project_id && task.task_number === task_number,
    );
  },

  toggleTaskSelection: (taskKey: string) => {
    set(
      produce((state: TaskState) => {
        const index = state.selectedTaskIds.indexOf(taskKey);
        if (index > -1) {
          state.selectedTaskIds.splice(index, 1);
        } else {
          state.selectedTaskIds.push(taskKey);
        }
      }),
    );
  },
  selectAllTasks: (taskKeys: string[]) => {
    set({ selectedTaskIds: taskKeys });
  },
  deselectAllTasks: () => {
    set({ selectedTaskIds: [] });
  },
  bulkDeleteTasks: async () => {
    const { selectedTaskIds } = get();
    if (selectedTaskIds.length === 0) return;
    set({ loading: true, mutationError: null });
    try {
      await Promise.all(selectedTaskIds.map((id: string) => {
        const [project_id, task_number] = id.split('-');
        return api.deleteTask(project_id, parseInt(task_number));
      }));
      set(
        produce((draft: TaskState) => {
          draft.tasks = draft.tasks.filter(
            (task: Task) =>
              !selectedTaskIds.includes(`${task.project_id}-${task.task_number}`),
          );
          draft.selectedTaskIds = [];
        }),
      );
      set({ loading: false });
    } catch (error) {
      let errorMessage = "Failed to bulk delete tasks";
      if (error instanceof Error) errorMessage = error.message;
      set({
        mutationError: { type: "bulk", message: errorMessage },
        loading: false,
      });
      console.error("Bulk Delete Error:", error);
    }
  },
  bulkSetStatusTasks: async (status: TaskStatus) => {
    const { selectedTaskIds, tasks } = get();
    if (selectedTaskIds.length === 0) return;

    const originalTasks: Task[] = [];
    selectedTaskIds.forEach((id: string) => {
      const [project_id, task_number] = id.split('-');
      const task = tasks.find(
        (t: Task) => t.project_id === project_id && t.task_number === parseInt(task_number),
      );
      if (task) originalTasks.push(JSON.parse(JSON.stringify(task)));
    });

    set(
      produce((draft: TaskState) => {
        selectedTaskIds.forEach((id: string) => {
          const [project_id, task_number] = id.split('-');
          const task = draft.tasks.find(
            (t: Task) => t.project_id === project_id && t.task_number === parseInt(task_number),
          );
          if (task) task.status = status;
        });
      }),
    );

    try {
      await Promise.all(
        selectedTaskIds.map((id: string) => {
          const [project_id, task_number] = id.split('-');
          return api.updateTask(project_id, parseInt(task_number), { status } as Partial<TaskUpdateData>);
        }),
      );
      await get().fetchTasks(get().filters);
    } catch (error) {
      let errorMessage = "Failed to bulk update task statuses";
      if (error instanceof Error) errorMessage = error.message;
      set(
        produce((draft: TaskState) => {
          originalTasks.forEach((originalTask: Task) => {
            const taskIndex = draft.tasks.findIndex(
              (t: Task) =>
                t.project_id === originalTask.project_id &&
                t.task_number === originalTask.task_number,
            );
            if (taskIndex !== -1) {
              draft.tasks[taskIndex] = originalTask;
            }
          });
          draft.mutationError = { type: "bulk", message: errorMessage };
        }),
      );
      console.error("Bulk Set Status Error:", error);
    }
  },
  removeTasksByProjectId: (projectId: string) => {
    set(
      produce((draft: TaskState) => {
        draft.tasks = draft.tasks.filter(
          (task: Task) => task.project_id !== projectId,
        );
        draft.selectedTaskIds = draft.selectedTaskIds.filter((taskId: string) => {
          const [project_id, task_number] = taskId.split('-');
          const task = draft.tasks.find(
            (t: Task) => t.project_id === project_id && t.task_number === parseInt(task_number),
          );
          return task ? task.project_id !== projectId : false;
        });
      }),
    );
  },
  archiveTask: async (project_id: string, task_number: number) => {
    set({ loading: true, mutationError: null });
    const originalTask = get().tasks.find(
      (t: Task) => t.project_id === project_id && t.task_number === task_number,
    );
    try {
      const archivedTask = await api.archiveTask(project_id, task_number);
      set(
        produce((state: TaskState) => {
          const index = state.tasks.findIndex(
            (t: Task) => t.project_id === project_id && t.task_number === task_number,
          );
          if (index !== -1) {
            state.tasks[index] = archivedTask;
          }
        }),
      );
      const currentFilters = get().filters;
      if (
        currentFilters.is_archived === false &&
        archivedTask.is_archived === true
      ) {
        await get().fetchTasks(currentFilters);
      } else {
        set({ loading: false });
      }
    } catch (error) {
      let errorMessage = "Failed to archive task";
      if (error instanceof Error) errorMessage = error.message;
      set({
        mutationError: {
          type: "archive",
          message: errorMessage,
          taskId: `${project_id}-${task_number}`,
          originalTask,
        },
        loading: false,
      });
      console.error("Archive Task Error:", error);
      throw error;
    }
  },
  unarchiveTask: async (project_id: string, task_number: number) => {
    set({ loading: true, mutationError: null });
    const originalTask = get().tasks.find(
      (t: Task) => t.project_id === project_id && t.task_number === task_number,
    );
    try {
      const unarchivedTask = await api.unarchiveTask(project_id, task_number);
      set(
        produce((state: TaskState) => {
          const index = state.tasks.findIndex(
            (t: Task) => t.project_id === project_id && t.task_number === task_number,
          );
          if (index !== -1) {
            state.tasks[index] = unarchivedTask;
          }
        }),
      );
      const currentFilters = get().filters;
      if (
        currentFilters.is_archived === true &&
        unarchivedTask.is_archived === false
      ) {
        await get().fetchTasks(currentFilters);
      } else {
        set({ loading: false });
      }
    } catch (error) {
      let errorMessage = "Failed to unarchive task";
      if (error instanceof Error) errorMessage = error.message;
      set({
        mutationError: {
          type: "unarchive",
          message: errorMessage,
          taskId: `${project_id}-${task_number}`,
          originalTask,
        },
        loading: false,
      });
      console.error("Unarchive Task Error:", error);
      throw error;
    }
  },
  archiveTasksByProjectId: (projectId: string) => {
    set(
      produce((state: TaskState) => {
        state.tasks.forEach((task: Task) => {
          if (task.project_id === projectId && !task.is_archived) {
            task.is_archived = true;
            task.updated_at = new Date().toISOString();
          }
        });
      }),
    );
    if (get().filters.is_archived === false) {
      get().fetchTasks(get().filters);
    }
  },
  unarchiveTasksByProjectId: (projectId: string) => {
    set(
      produce((state: TaskState) => {
        state.tasks.forEach((task: Task) => {
          if (task.project_id === projectId && task.is_archived) {
            task.is_archived = false;
            task.updated_at = new Date().toISOString();
          }
        });
      }),
    );
    if (get().filters.is_archived === true) {
      get().fetchTasks(get().filters);
    }
  },
}));

// Helper function to sort tasks
export const sortTasks = (tasks: Task[], options: TaskSortOptions): Task[] => {
  if (!tasks) return [];
  const field = options.field;
  const direction = options.direction === "asc" ? 1 : -1;
  return [...tasks].sort((a: Task, b: Task) => {
    const valA = a[field as keyof Task];
    const valB = b[field as keyof Task];

    if (valA == null && valB == null) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;

    if (typeof valA === "string" && typeof valB === "string") {
      return valA.localeCompare(valB) * direction;
    }
    if (typeof valA === "number" && typeof valB === "number") {
      return (valA - valB) * direction;
    }
    if (typeof valA === "boolean" && typeof valB === "boolean") {
      return (valA === valB ? 0 : valA ? -1 : 1) * direction;
    }
    if (field === "created_at") {
      return (
        (new Date(valA as string).getTime() -
          new Date(valB as string).getTime()) *
        direction
      );
    }
    return 0;
  });
};
