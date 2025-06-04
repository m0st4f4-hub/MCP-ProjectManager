import React from "react";
import TaskRow from "../task/TaskRow";
import { Task } from "@/types";

interface ListTaskMobileProps {
  task: Task;
  selected: boolean;
  onSelect: () => void;
  onAssignAgent: (task: Task) => void;
  onDeleteInitiate: (task: Task) => void;
  onClick: () => void;
  onCopyGetCommand: (project_id: string, task_number: number) => void;
}

const ListTaskMobile: React.FC<ListTaskMobileProps> = ({
  task,
  selected,
  onSelect,
  onAssignAgent,
  onDeleteInitiate,
  onClick,
  onCopyGetCommand,
}) => (
  <TaskRow
    task={task}
    selected={selected}
    onSelect={onSelect}
    onAssignAgent={() => onAssignAgent(task)}
    onDelete={() => onDeleteInitiate(task)}
    onClick={onClick}
    onCopyGetCommand={() => onCopyGetCommand(task.project_id, task.task_number)}
  />
);

export default ListTaskMobile; 