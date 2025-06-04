// TaskList.utils.ts
// Extracted from TaskList.tsx for Dream Level 3 modularization

import { Task, TaskFilters, GroupByType, Project, Agent, TaskSortOptions } from "@/types";
import { mapStatusToStatusID, formatDisplayName } from "@/lib/utils";
import * as statusUtils from "@/lib/statusUtils";
import { sortTasks } from "@/store/taskStore";
import type { TaskGroup, TaskSubgroup, GroupedTasks } from "./views/ListView.types";

function getTaskCategory(task: Task): string {
  const attrs = statusUtils.getStatusAttributes(task.status as statusUtils.StatusID);
  return attrs?.category || "active";
}

export function applyAllFilters(task: Task, currentFilters: TaskFilters): boolean {
  if (currentFilters.search) {
    const searchTermLower = currentFilters.search.toLowerCase();
    const titleMatch = task.title?.toLowerCase().includes(searchTermLower);
    const descriptionMatch = task.description?.toLowerCase().includes(searchTermLower);
    if (!titleMatch && !descriptionMatch) return false;
  }
  if (currentFilters.status && currentFilters.status !== "all") {
    const taskActualStatusID = mapStatusToStatusID(task.status);
    const taskCategory = getTaskCategory(task);
    if (currentFilters.status === "active") {
      if (taskCategory === "completed" || taskCategory === "failed") return false;
    } else if (currentFilters.status === "completed") {
      if (taskCategory !== "completed" && taskCategory !== "failed") return false;
    } else {
      if (taskActualStatusID !== currentFilters.status) return false;
    }
  }
  if (currentFilters.hideCompleted && getTaskCategory(task) === "completed") {
    return false;
  }
  if (currentFilters.projectId) {
    if (task.project_id !== currentFilters.projectId) return false;
  }
  if (currentFilters.agentId) {
    if (task.agent_id !== currentFilters.agentId) return false;
  }
  if (typeof currentFilters.is_archived === "boolean") {
    if (task.is_archived !== currentFilters.is_archived) {
      return false;
    }
  } else {
    if (task.is_archived) {
      return false;
    }
  }
  return true;
}

function getStatusSubgroupsForProjectOrAgent(currentTasks: Task[], sortOptions: TaskSortOptions) {
  return [
    {
      id: "active",
      name: `Active Tasks (${currentTasks.filter((t) => {
        const attrs = statusUtils.getStatusAttributes(t.status as statusUtils.StatusID);
        return !(attrs?.category === "completed" || t.status?.startsWith("COMPLETED_"));
      }).length})`,
      tasks: sortTasks(
        currentTasks.filter((t) => {
          const attrs = statusUtils.getStatusAttributes(t.status as statusUtils.StatusID);
          return !(attrs?.category === "completed" || t.status?.startsWith("COMPLETED_"));
        }),
        sortOptions,
      ),
      status: "active",
    },
    {
      id: "completed",
      name: `Completed Tasks (${currentTasks.filter((t) => {
        const attrs = statusUtils.getStatusAttributes(t.status as statusUtils.StatusID);
        return attrs?.category === "completed" || t.status?.startsWith("COMPLETED_");
      }).length})`,
      tasks: sortTasks(
        currentTasks.filter((t) => {
          const attrs = statusUtils.getStatusAttributes(t.status as statusUtils.StatusID);
          return attrs?.category === "completed" || t.status?.startsWith("COMPLETED_");
        }),
        sortOptions,
      ),
      status: "completed",
    },
  ];
}

export function groupTasksByStatus(topLevelTasks: Task[], sortOptions: TaskSortOptions): { type: GroupByType, groups: TaskGroup[] } {
  const tasksByStatusId: { [key: string]: Task[] } = {};
  topLevelTasks.forEach((task) => {
    const currentTaskStatusId = (task.status || "TO_DO");
    if (!tasksByStatusId[currentTaskStatusId]) {
      tasksByStatusId[currentTaskStatusId] = [];
    }
    tasksByStatusId[currentTaskStatusId].push(task);
  });

  const allStatusIdsInTasks = Object.keys(tasksByStatusId);
  const preferredStatusOrder = [
    "TO_DO",
    "IN_PROGRESS",
    "BLOCKED",
    "PENDING_VERIFICATION",
    "COMPLETED_AWAITING_PROJECT_MANAGER",
    "COMPLETED_HANDOFF_TO_...",
    "FAILED",
    "COMPLETED",
  ];
  allStatusIdsInTasks.sort((a, b) => {
    const aIndex = preferredStatusOrder.indexOf(a);
    const bIndex = preferredStatusOrder.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    const aDisplayName = statusUtils.getDisplayableStatus(a)?.displayName || a;
    const bDisplayName = statusUtils.getDisplayableStatus(b)?.displayName || b;
    return aDisplayName.localeCompare(bDisplayName);
  });

  const statusGroups = allStatusIdsInTasks
    .map((statusIdKey) => {
      const tasksInStatus = tasksByStatusId[statusIdKey] || [];
      const { displayName } = statusUtils.getDisplayableStatus(statusIdKey) || { displayName: statusIdKey };
      return {
        id: statusIdKey,
        name: `${displayName} (${tasksInStatus.length})`,
        tasks: sortTasks(tasksInStatus, sortOptions),
        status: statusIdKey,
      };
    })
    .filter((group) => group.tasks.length > 0);

  return {
    type: "status",
    groups: statusGroups,
  };
}

export function groupTasksByProject(topLevelTasks: Task[], projects: Project[], sortOptions: TaskSortOptions): { type: GroupByType, groups: TaskGroup[] } {
  const tasksByProject: Record<string, Task[]> = {};
  const unassignedTasks: Task[] = [];

  topLevelTasks.forEach((task) => {
    if (task.project_id) {
      if (!tasksByProject[task.project_id]) {
        tasksByProject[task.project_id] = [];
      }
      tasksByProject[task.project_id].push(task);
    } else {
      unassignedTasks.push(task);
    }
  });

  const projectGroups = projects.map((project) => ({
    id: project.id,
    name: `${formatDisplayName(project.name)} (${(tasksByProject[project.id] || []).length})`,
    subgroups: getStatusSubgroupsForProjectOrAgent(tasksByProject[project.id] || [], sortOptions),
  }));

  if (unassignedTasks.length > 0) {
    projectGroups.push({
      id: "unassigned_project",
      name: `Unassigned to Project (${unassignedTasks.length})`,
      subgroups: getStatusSubgroupsForProjectOrAgent(unassignedTasks, sortOptions),
    });
  }

  return { type: "project", groups: projectGroups };
}

export function groupTasksByAgent(topLevelTasks: Task[], agents: Agent[], sortOptions: TaskSortOptions): { type: GroupByType, groups: TaskGroup[] } {
  const tasksByAgent: Record<string, Task[]> = {};
  const unassignedTasks: Task[] = [];

  topLevelTasks.forEach((task) => {
    if (task.agent_id) {
      if (!tasksByAgent[task.agent_id]) {
        tasksByAgent[task.agent_id] = [];
      }
      tasksByAgent[task.agent_id].push(task);
    } else {
      unassignedTasks.push(task);
    }
  });

  const agentGroups = agents.map((agent) => ({
    id: agent.id,
    name: `${formatDisplayName(agent.name)} (${(tasksByAgent[agent.id] || []).length})`,
    subgroups: getStatusSubgroupsForProjectOrAgent(tasksByAgent[agent.id] || [], sortOptions),
  }));

  if (unassignedTasks.length > 0) {
    agentGroups.push({
      id: "unassigned_agent",
      name: `Unassigned to Agent (${unassignedTasks.length})`,
      subgroups: getStatusSubgroupsForProjectOrAgent(unassignedTasks, sortOptions),
    });
  }

  return { type: "agent", groups: agentGroups };
} 