import React from "react";
import { ListItem, Checkbox, Box } from "@chakra-ui/react";
import TaskItem from "../task/TaskItem";
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
  <ListItem
    display="flex"
    alignItems="center"
    py="2"
    px="2"
    borderBottomWidth="DEFAULT"
    borderBottomStyle="solid"
    borderColor="borderDecorative"
    bg={selected ? "surfaceElevated" : "transparent"}
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
        projectName={task.project_name || ""}
        onAssignAgent={onAssignAgent}
        onDeleteInitiate={onDeleteInitiate}
        onClick={onClick}
        onCopyGetCommand={(projectId, taskNumber) => onCopyGetCommand(projectId, taskNumber)}
      />
    </Box>
  </ListItem>
);

export default ListTaskMobile; 