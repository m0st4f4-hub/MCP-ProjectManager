import React from "react";
import { Tag, TagLabel, Tooltip } from "@chakra-ui/react";
// TaskDependency type is not used here directly, the prop defines the shape

interface TaskDependencyTagProps {
  dependency: { project_id: string; task_number: number };
  isSuccessor?: boolean; // New prop
}

const TaskDependencyTag: React.FC<TaskDependencyTagProps> = ({
  dependency,
  isSuccessor,
}) => {
  const dependencyText = isSuccessor
    ? `Blocks ${dependency.project_id}/${dependency.task_number}`
    : `Depends on ${dependency.project_id}/${dependency.task_number}`;

  return (
    <Tooltip label={dependencyText}>
      <Tag
        size="sm"
        variant="subtle"
        colorScheme={isSuccessor ? "purple" : "orange"} // Different color for successors
        borderRadius="full"
        px="spacing.2"
        py="spacing.0-5"
        fontWeight="medium"
      >
        <TagLabel>{dependencyText}</TagLabel>
      </Tag>
    </Tooltip>
  );
};

export default TaskDependencyTag; 