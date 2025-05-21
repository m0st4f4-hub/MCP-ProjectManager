import { Task } from "@/types";
import React from "react";

export interface TaskItemProps {
  task: Task;
  compact?: boolean;
  style?: React.CSSProperties;
  onDeleteInitiate: (task: Task) => void;
  onAssignAgent?: (task: Task) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onCopyGetCommand?: (taskId: string) => void;
}
