import { useMemo } from "react";
import { Task } from "@/types/task";
import { TaskState } from "@/store/taskStore"; // Assuming filters structure is part of TaskState or a specific FilterType
import { getTaskCategory } from "@/lib/taskUtils"; // Corrected import path

// It's often better to define a specific type for filters if it's complex
type TaskFilters = TaskState["filters"]; // Or a more specific type

/**
 * Custom hook to filter tasks based on provided criteria.
 * @param tasks - The array of tasks to filter.
 * @param filters - The filter criteria.
 * @returns A memoized array of filtered tasks.
 */
export const useFilteredTasks = (
  tasks: Task[],
  filters: TaskFilters,
): Task[] => {
  return useMemo(() => {
    if (!filters) {
      // If no filters, return tasks that are not archived by default
      return tasks.filter((task) => !task.is_archived);
    }
    return tasks.filter((task) => {
      // Archived filter
      if (typeof filters.is_archived === "boolean") {
        if (task.is_archived !== filters.is_archived) return false;
      } else {
        // Default to hiding archived tasks if filter is not explicitly set to null/true
        if (task.is_archived) return false;
      }

      // Project ID filter
      if (filters.projectId && task.project_id !== filters.projectId) {
        return false;
      }

      // Status filter
      if (filters.status && filters.status !== "all") {
        const taskCategory = getTaskCategory(task);
        if (filters.status === "active") {
          if (taskCategory === "completed" || taskCategory === "failed")
            return false;
        } else if (filters.status === "completed") {
          if (taskCategory !== "completed" && taskCategory !== "failed")
            return false;
        } else if (filters.status !== taskCategory) {
          // Direct category match if not active/completed
          return false;
        }
      }

      // Agent ID filter
      if (filters.agentId && task.agent_id !== filters.agentId) {
        return false;
      }

      // Search term filter
      if (filters.search) {
        const searchTermLower = filters.search.toLowerCase();
        const titleMatch = task.title?.toLowerCase().includes(searchTermLower);
        const descriptionMatch = task.description
          ?.toLowerCase()
          .includes(searchTermLower);
        if (!titleMatch && !descriptionMatch) return false;
      }

      // Hide completed filter (specific toggle)
      if (filters.hideCompleted && getTaskCategory(task) === "completed") {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);
};

// Note: You'll need to move or ensure `getTaskCategory` is accessible.
// It might be better in a shared utility file, e.g., `src/lib/taskUtils.ts`.
// For now, assuming it's made available, e.g., by moving it to `lib/taskUtils.ts`
// and importing it here. If `getTaskCategory` itself uses `mapStatusToStatusID`
// and `getStatusAttributes`, those also need to be correctly pathed or moved.

// Placeholder for getTaskCategory if not refactored yet, to make hook self-contained for now.
// This should be replaced by a proper import from a utility file.
// const getTaskCategory = (task: Task): string => {
//   if (!task.status) return "todo";
//   // const canonicalStatusId = mapStatusToStatusID(task.status); // Needs mapStatusToStatusID
//   // const attributes = getStatusAttributes(canonicalStatusId); // Needs getStatusAttributes
//   // return attributes ? attributes.category : "todo";
//   // Simplified for placeholder:
//   const statusLower = task.status.toLowerCase();
//   if (statusLower.includes("done") || statusLower.includes("complete")) return "completed";
//   if (statusLower.includes("progress")) return "inProgress";
//   if (statusLower.includes("block")) return "blocked";
//   if (statusLower.includes("fail")) return "failed";
//   return "todo";
// };
