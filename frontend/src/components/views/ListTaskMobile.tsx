import React from "react";
import { ListItem, Checkbox, Box } from "@chakra-ui/react";
import TaskItem from "../TaskItem";
import { Task } from "@/types";

interface ListTaskMobileProps {
  task: Task;
  selected: boolean;
  onSelect: () => void;
  onAssignAgent: (task: Task) => void;
  onDeleteInitiate: (task: Task) => void;
  onClick: () => void;
  onCopyGetCommand: (taskId: string) => void;
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
        onAssignAgent={onAssignAgent}
        onDeleteInitiate={onDeleteInitiate}
        onClick={onClick}
        onCopyGetCommand={onCopyGetCommand}
      />
    </Box>
  </ListItem>
);

export default ListTaskMobile; 