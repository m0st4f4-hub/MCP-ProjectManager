import React from "react";
import { Box, ListItem, Checkbox } from "@chakra-ui/react";
import TaskItem from "../task/TaskItem";
import { Task } from "@/types";

interface ListTaskItemProps {
  task: Task;
  selectedTaskIds: string[];
  toggleTaskSelection: (taskId: string) => void;
  handleAssignAgent: (task: Task) => void;
  handleDeleteInitiate: (task: Task) => void;
  setSelectedTask: (task: Task) => void;
  handleCopyTaskGetCommand: (taskId: string) => void;
}

const ListTaskItem: React.FC<ListTaskItemProps> = ({
  task,
  selectedTaskIds,
  toggleTaskSelection,
  handleAssignAgent,
  handleDeleteInitiate,
  setSelectedTask,
  handleCopyTaskGetCommand,
}) => {
  return (
    <ListItem
      key={task.id}
      display="flex"
      alignItems="center"
      pl="10"
      pr="2"
      py="1"
      borderBottomWidth="DEFAULT"
      borderBottomStyle="solid"
      borderColor="borderDecorative"
      bg={
        selectedTaskIds.includes(task.id)
          ? "surfaceElevated"
          : "transparent"
      }
      _hover={{ bg: "gray.100", _dark: { bg: "gray.600" } }}
    >
      <Checkbox
        isChecked={selectedTaskIds.includes(task.id)}
        onChange={() => toggleTaskSelection(task.id)}
        mr="3"
        aria-label={`Select task ${task.title}`}
        colorScheme="blue"
      />
      <Box flex={1}>
        <TaskItem
          task={task}
          onAssignAgent={() => handleAssignAgent(task)}
          onDeleteInitiate={() => handleDeleteInitiate(task)}
          onClick={() => setSelectedTask(task)}
          onCopyGetCommand={() => handleCopyTaskGetCommand(task.id)}
        />
      </Box>
    </ListItem>
  );
};

export default ListTaskItem; 