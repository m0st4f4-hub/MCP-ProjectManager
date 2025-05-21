import { useMemo } from "react";
import { Project } from "@/types/project";
import { ProjectState } from "@/store/projectStore";
import { TaskState } from "@/store/taskStore"; // For task-based project filtering

type ProjectFilters = ProjectState["filters"];
type TaskViewProjectFilter = TaskState["filters"]["projectId"]; // Specifically the projectId from task filters

/**
 * Custom hook to filter projects based on provided criteria.
 * @param projects - The array of projects to filter.
 * @param projectStoreFilters - The filter criteria from the project store.
 * @param taskViewProjectIdFilter - Optional project ID from task filters, to sync project list.
 * @returns A memoized array of filtered projects.
 */
export const useFilteredProjects = (
  projects: Project[],
  projectStoreFilters: ProjectFilters,
  taskViewProjectIdFilter?: TaskViewProjectFilter,
): Project[] => {
  return useMemo(() => {
    if (!projectStoreFilters && !taskViewProjectIdFilter) {
      return projects.filter((project) => !project.is_archived);
    }

    return projects.filter((project) => {
      // Archived filter from project store
      if (projectStoreFilters) {
        if (typeof projectStoreFilters.is_archived === "boolean") {
          if (project.is_archived !== projectStoreFilters.is_archived)
            return false;
        } else {
          // Default to hiding archived projects if filter is not explicitly set to null/true
          if (project.is_archived) return false;
        }
        // Search filter from project store
        if (projectStoreFilters.search) {
          const searchTermLower = projectStoreFilters.search.toLowerCase();
          const nameMatch = project.name
            ?.toLowerCase()
            .includes(searchTermLower);
          const descriptionMatch = project.description
            ?.toLowerCase()
            .includes(searchTermLower);
          if (!nameMatch && !descriptionMatch) return false;
        }
        // Status filter from project store (if applicable, e.g. "active", "archived")
        // This example assumes status directly maps to is_archived or a similar field.
        // You might need a getProjectCategory or similar if status is more complex.
        if (projectStoreFilters.status) {
          if (
            projectStoreFilters.status === "active" &&
            project.is_archived !== false
          )
            return false;
          if (
            projectStoreFilters.status === "completed" &&
            project.is_archived !== true
          )
            return false;
          // Add more status conditions if necessary
        }
      }

      // Project ID filter from task view (if a project is selected in task list)
      if (taskViewProjectIdFilter && project.id !== taskViewProjectIdFilter) {
        return false;
      }

      return true;
    });
  }, [projects, projectStoreFilters, taskViewProjectIdFilter]);
};
