import { useState, useEffect, useCallback } from 'react';
import {
  Project,
  Task,
  getProjectById,
  updateProject as apiUpdateProject,
  getAllTasksForProject,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from '../services/api';
import * as logger from '../utils/logger';

export interface UseProjectDataOptions {
  page?: number;
  pageSize?: number;
}

export interface UseProjectDataResult {
  project: Project | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
  updateProject: (data: Partial<Project>) => Promise<void>;
  createTask: (data: Omit<Task, 'id' | 'project_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

/**
 * Custom hook to fetch and manage a single project and its associated tasks.
 * @param projectId The ID of the project.
 * @param options Pagination options for tasks.
 * @returns An object with project data, tasks, loading/error states, and management functions.
 */
export const useProjectData = (
  projectId: string,
  options: UseProjectDataOptions = {}
): UseProjectDataResult => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { page = 0, pageSize = 20 } = options;

  const fetchData = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);
    try {
      const [projectData, tasksData] = await Promise.all([
        getProjectById(projectId),
        getAllTasksForProject(projectId, undefined, undefined, page, pageSize),
      ]);
      setProject(projectData);
      setTasks(tasksData);
    } catch (err) {
      const errorMessage = 'Failed to fetch project data.';
      setError(errorMessage);
      logger.error(errorMessage, err);
    } finally {
      setLoading(false);
    }
  }, [projectId, page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateProject = async (data: Partial<Project>) => {
    if (!project) return;
    const updatedProject = await apiUpdateProject(project.id, data);
    setProject(updatedProject);
  };

  const createTask = async (data: Omit<Task, 'id' | 'project_id' | 'created_at' | 'updated_at'>) => {
    const newTask = await apiCreateTask({ ...data, project_id: projectId });
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    const updatedTask = await apiUpdateTask(taskId, data);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
  };

  const deleteTask = async (taskId: string) => {
    await apiDeleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return {
    project,
    tasks,
    loading,
    error,
    refreshData: fetchData,
    updateProject,
    createTask,
    updateTask,
    deleteTask,
  };
};