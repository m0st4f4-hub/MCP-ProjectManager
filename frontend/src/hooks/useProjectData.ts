import { useState, useEffect, useCallback } from 'react';
import { getProjectById, updateProject } from '@/services/api/projects';
import { getAllTasksForProject } from '@/services/api/tasks';
import type { Project } from '@/types/project';
import type { Task } from '@/types/task';

export interface UseProjectDataResult {
  project: Project | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: (data: Partial<Project>) => Promise<void>;
}

export const useProjectData = (projectId: string): UseProjectDataResult => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [proj, projTasks] = await Promise.all([
        getProjectById(projectId),
        getAllTasksForProject(projectId),
      ]);
      setProject(proj);
      setTasks(projTasks);
      setError(null);
    } catch {
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const save = useCallback(
    async (data: Partial<Project>) => {
      if (!project) return;
      const updated = await updateProject(project.id, data);
      setProject(updated);
    },
    [project],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { project, tasks, loading, error, refresh: fetchData, save };
};
