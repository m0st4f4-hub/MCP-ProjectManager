import React from "react";
import TaskRow from "../task/TaskRow";
import { Task } from "@/types";

interface ListTaskItemProps {
  task: Task;
  projectName: string;
  selectedTaskIds: string[];
  toggleTaskSelection: (taskId: string) => void;
  handleAssignAgent: (task: Task) => void;
  handleDeleteInitiate: (task: Task) => void;
  setSelectedTask: (task: Task) => void;
  handleCopyTaskGetCommand: (task: Task) => void;
}

const ListTaskItem: React.FC<ListTaskItemProps> = ({
  task,
  projectName,
  selectedTaskIds,
  toggleTaskSelection,
  handleAssignAgent,
  handleDeleteInitiate,
  setSelectedTask,
  handleCopyTaskGetCommand,
}) => (
  <TaskRow
    task={task}
    selected={selectedTaskIds.includes(`${task.project_id}-${task.task_number}`)}
    onSelect={() =>
      toggleTaskSelection(`${task.project_id}-${task.task_number}`)
    }
    onAssignAgent={() => handleAssignAgent(task)}
    onDelete={() => handleDeleteInitiate(task)}
    onClick={() => setSelectedTask(task)}
    onCopyGetCommand={() => handleCopyTaskGetCommand(task)}
  />
);

export default ListTaskItem; 