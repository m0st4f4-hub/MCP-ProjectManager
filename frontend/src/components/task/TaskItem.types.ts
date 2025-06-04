import { Task } from "@/types";
import React from "react";

export interface TaskItemProps {
  task: Task;
  projectName: string;
  compact?: boolean;
  style?: React.CSSProperties;
  onDeleteInitiate: (task: Task) => void;
  onAssignAgent?: (task: Task) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onCopyGetCommand?: (project_id: string, task_number: number) => void;
}
