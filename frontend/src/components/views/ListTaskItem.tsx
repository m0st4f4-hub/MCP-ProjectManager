import React from "react";
import { Box, ListItem, Checkbox } from "@chakra-ui/react";
import TaskItem from "../task/TaskItem";
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
}) => {
  return (
    <ListItem
      key={`${task.project_id}-${task.task_number}`}
      display="flex"
      alignItems="center"
      py="2"
      px="2"
      borderBottomWidth="DEFAULT"
      borderBottomStyle="solid"
      borderColor="borderDecorative"
      bg={selectedTaskIds.includes(`${task.project_id}-${task.task_number}`) ? "surfaceElevated" : "transparent"}
    >
      <Checkbox
        isChecked={selectedTaskIds.includes(`${task.project_id}-${task.task_number}`)}
        onChange={() => toggleTaskSelection(`${task.project_id}-${task.task_number}`)}
        mr="3"
        colorScheme="blue"
        aria-label={`Select task ${task.title}`}
      />
      <Box flex={1}>
        <TaskItem
          task={task}
          projectName={projectName}
          onAssignAgent={() => handleAssignAgent(task)}
          onDeleteInitiate={() => handleDeleteInitiate(task)}
          onClick={() => setSelectedTask(task)}
          onCopyGetCommand={() => handleCopyTaskGetCommand(task)}
        />
      </Box>
    </ListItem>
  );
};

export default ListTaskItem; 