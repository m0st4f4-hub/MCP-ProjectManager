import React from "react";
import { Tag, TagLabel, Tooltip } from "@chakra-ui/react";
import { TaskDependency } from "@/types/task"; // Assuming TaskDependency type is defined or use the inline type

interface TaskDependencyTagProps {
  dependency: { project_id: string; task_number: number }; // Use inline type based on task.ts structure
}

const TaskDependencyTag: React.FC<TaskDependencyTagProps> = ({
  dependency,
}) => {
  const dependencyText = `Depends on ${dependency.project_id}/${dependency.task_number}`;

  return (
    <Tooltip label={dependencyText}>
      <Tag
        size="sm"
        variant="subtle"
        colorScheme="orange"
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