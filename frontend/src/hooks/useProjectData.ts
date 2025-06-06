import { useState, useEffect, useCallback } from 'react';
import { Project, Task } from '../types';
import { api } from '../services/api';

interface UseProjectDataReturn {
  project: Project | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProject: (updates: Partial<Project>) => Promise<void>;
  createTask: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

/**
 * Custom hook for managing project data and related tasks
 * @param projectId - The project ID to fetch data for
 * @returns Project data, tasks, and management functions
 */
export function useProjectData(projectId: string | undefined): UseProjectDataReturn {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchProjectData = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      setTasks([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch project and tasks in parallel
      const [projectResponse, tasksResponse] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`)
      ]);
      
      setProject(projectResponse.data);
      setTasks(tasksResponse.data);
    } catch (err) {
      console.error('Failed to fetch project data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  const updateProject = useCallback(async (updates: Partial<Project>) => {
    if (!projectId || !project) return;
    
    try {
      const response = await api.patch(`/projects/${projectId}`, updates);
      setProject(response.data);
    } catch (err) {
      console.error('Failed to update project:', err);
      throw err;
    }
  }, [projectId, project]);
  
  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) return;
    
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, taskData);
      setTasks(prev => [...prev, response.data]);
    } catch (err) {
      console.error('Failed to create task:', err);
      throw err;
    }
  }, [projectId]);
  
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!projectId) return;
    
    try {
      const response = await api.patch(`/projects/${projectId}/tasks/${taskId}`, updates);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? response.data : task
      ));
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  }, [projectId]);
  
  const deleteTask = useCallback(async (taskId: string) => {
    if (!projectId) return;
    
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  }, [projectId]);
  
  // Initial data fetch
  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);
  
  return {
    project,
    tasks,
    loading,
    error,
    refresh: fetchProjectData,
    updateProject,
    createTask,
    updateTask,
    deleteTask
  };
}