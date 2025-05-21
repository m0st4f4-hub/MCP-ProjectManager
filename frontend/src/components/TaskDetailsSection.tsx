import React from "react";
import {
  Box,
  Collapse,
  SimpleGrid,
  Text,
  useTheme,
  useToken,
} from "@chakra-ui/react";
import { Task } from "@/types";

interface TaskDetailsSectionProps {
  task: Task;
  isOpen: boolean;
  compact: boolean;
}

const TaskDetailsSection: React.FC<TaskDetailsSectionProps> = ({
  task,
  isOpen,
  compact,
}) => {
  const theme = useTheme();
  const [textPrimaryColor, textSecondaryColor] = useToken("colors", [
    "chakra-body-text",
    "gray.500",
  ]);
  const detailTextFontSize = compact ? "xs" : "sm";

  return (
    <Collapse in={isOpen} animateOpacity>
      <Box pt={compact ? 2 : 3} pb={compact ? 1 : 2}>
        <SimpleGrid
          columns={2}
          spacingX="spacing.3"
          spacingY="spacing.1"
          fontSize={detailTextFontSize}
        >
          <Text
            color={textSecondaryColor}
            fontWeight={theme.fontWeights.medium}
            textAlign="right"
          >
            ID:
          </Text>
          <Text color={textPrimaryColor} wordBreak="break-word">
            {task.id}
          </Text>

          <Text
            color={textSecondaryColor}
            fontWeight={theme.fontWeights.medium}
            textAlign="right"
          >
            Created:
          </Text>
          <Text color={textPrimaryColor} wordBreak="break-word">
            {new Date(task.created_at).toLocaleString()}
          </Text>

          <Text
            color={textSecondaryColor}
            fontWeight={theme.fontWeights.medium}
            textAlign="right"
          >
            Updated:
          </Text>
          <Text color={textPrimaryColor} wordBreak="break-word">
            {task.updated_at
              ? new Date(task.updated_at).toLocaleString()
              : "N/A"}
          </Text>

          {task.project_id && (
            <>
              <Text
                color={textSecondaryColor}
                fontWeight={theme.fontWeights.medium}
                textAlign="right"
              >
                Project ID:
              </Text>
              <Text color={textPrimaryColor} wordBreak="break-word">
                {task.project_id}
              </Text>
            </>
          )}
          {task.agent_id && (
            <>
              <Text
                color={textSecondaryColor}
                fontWeight={theme.fontWeights.medium}
                textAlign="right"
              >
                Agent ID:
              </Text>
              <Text color={textPrimaryColor} wordBreak="break-word">
                {task.agent_id}
              </Text>
            </>
          )}
        </SimpleGrid>
      </Box>
    </Collapse>
  );
};

export default TaskDetailsSection;
