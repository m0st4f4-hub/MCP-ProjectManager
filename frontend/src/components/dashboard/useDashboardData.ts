import * as logger from '@/utils/logger';
import { useEffect, useState, useCallback } from "react";
import { handleApiError } from "@/lib/apiErrorHandler";
import { Project } from "@/types/project";
import { Task } from "@/types/task";
import * as api from "@/services/api";

export function useDashboardData() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setIsLoadingAll(true);
    setInitialLoadError(null);
    try {
      const [projectsFromApi, tasksFromApi] = await Promise.all([
        api.getProjects({ is_archived: null }),
        api.getAllTasks({ is_archived: null }),
      ]);
      setAllProjects(projectsFromApi || []);
      setAllTasks(tasksFromApi || []);
    } catch (error) {
      logger.error(
        "Error fetching all projects/tasks for dashboard totals:",
        error,
      );
      handleApiError(error, "Failed to load dashboard data");
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during initial data load.";
      setInitialLoadError(errorMessage);
      setAllProjects([]);
      setAllTasks([]);
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    allProjects,
    allTasks,
    isLoadingAll,
    initialLoadError,
    fetchAllData,
  };
} 