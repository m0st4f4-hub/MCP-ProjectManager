import { Task } from "@/types/task";
import { mapStatusToStatusID } from "@/lib/utils";
import { getStatusAttributes } from "@/lib/statusUtils";

/**
 * Determines the category of a task based on its status.
 * Uses mapStatusToStatusID and getStatusAttributes to derive a canonical category.
 * @param task - The task object.
 * @returns A string representing the task category (e.g., "completed", "inProgress", "todo", "failed", "blocked").
 */
export const getTaskCategory = (task: Task): string => {
  if (!task.status) return "todo"; // Default category if status is undefined
  const canonicalStatusId = mapStatusToStatusID(task.status);
  const attributes = getStatusAttributes(canonicalStatusId);
  return attributes ? attributes.category : "todo"; // Default if attributes are somehow not found
}; 