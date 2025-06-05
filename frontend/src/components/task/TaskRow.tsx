import React from "react";
import { ListItem, Checkbox, Box } from "@chakra-ui/react";
import TaskItem from "./TaskItem";
import { Task } from "@/types";

interface TaskRowProps {
  task: Task;
  selected: boolean;
  onSelect: () => void;
  onAssignAgent: () => void;
  onDelete: () => void;
  onClick: () => void;
  onCopyGetCommand: () => void;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  selected,
  onSelect,
  onAssignAgent,
  onDelete,
  onClick,
  onCopyGetCommand,
}) => (
  <ListItem
    display="flex"
    alignItems="center"
    py="2"
    px="2"
    borderBottomWidth="DEFAULT"
    borderBottomStyle="solid"
    borderColor="borderDecorative"
    data-testid="task-row"
  >
    <Checkbox
      isChecked={selected}
      onChange={onSelect}
      mr="3"
      colorScheme="blue"
      aria-label={`Select task ${task.title}`}
    />
    <Box flex={1}>
      <TaskItem
        task={task}
        projectName={task.project_name ?? ''}
        onAssignAgent={onAssignAgent}
        onDeleteInitiate={onDelete}
        onClick={onClick}
        onCopyGetCommand={onCopyGetCommand}
      />
    </Box>
  </ListItem>
);

export default TaskRow;
