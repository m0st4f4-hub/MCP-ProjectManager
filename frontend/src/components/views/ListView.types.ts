import { Task } from "@/types/task";

export type GroupByType = "status" | "project" | "agent" | "parent";

export interface TaskGroup {
  id: string;
  name: string;
  tasks?: Task[];
  subgroups?: TaskSubgroup[];
  status?: string;
}

export interface TaskSubgroup {
  id: string;
  name: string;
  tasks: Task[];
  status?: string;
}

export interface GroupedTasks {
  type: GroupByType;
  groups: TaskGroup[];
}

export interface ListViewProps {
  groupedTasks: GroupedTasks;
  isLoading: boolean;
  isMobile: boolean;
}

export interface ListGroupProps {
  group: TaskGroup;
  expandedGroups: Record<string, boolean>;
  toggleGroup: (groupId: string) => void;
  selectedTaskIds: string[];
  toggleTaskSelection: (taskId: string) => void;
  handleAssignAgent: (task: Task) => void;
  handleDeleteInitiate: (task: Task) => void;
  setSelectedTask: (task: Task) => void;
  handleCopyTaskGetCommand: (taskId: string) => void;
  isMobile?: boolean;
} 