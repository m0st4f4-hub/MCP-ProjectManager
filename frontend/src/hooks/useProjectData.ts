import { useState, useEffect, useCallback } from "react";
import { getProjectById, updateProject, getAllTasksForProject } from "@/services/api";
import { Project, ProjectUpdateData, Task } from "@/types";

export interface UseProjectDataResult {
  project: Project | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProjectDetails: (data: ProjectUpdateData) => Promise<void>;
}

/**
 * Fetch project details and its tasks.
 * Provides helpers for refreshing data and updating the project.
 */
export const useProjectData = (projectId: string): UseProjectDataResult => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const [proj, projTasks] = await Promise.all([
        getProjectById(projectId),
        getAllTasksForProject(projectId),
      ]);
      setProject(proj);
      setTasks(projTasks);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load project";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateProjectDetails = useCallback(
    async (data: ProjectUpdateData) => {
      if (!projectId) return;
      setLoading(true);
      setError(null);
      try {
        const updated = await updateProject(projectId, data);
        setProject(updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update project";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId],
  );

  return {
    project,
    tasks,
    loading,
    error,
    refresh: fetchData,
    updateProjectDetails,
  };
};

export default useProjectData;
