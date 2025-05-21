"use client"; // Added 'use client' as it's a client component

import React from "react";
import {
  Tag,
  TagLeftIcon,
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { Task } from "@/types/task";
import { Project } from "@/types/project";
import { getStatusAttributes } from "@/lib/statusUtils";
import { mapStatusToStatusID } from "@/lib/utils";
import { FaTasks } from "react-icons/fa";
import { semanticColors } from "@/tokens/colors";
import AppIcon from "../common/AppIcon";
import { sizing, shadows, typography } from "../../tokens";

interface UnassignedTasksListProps {
  unassignedTasks: Task[];
  projects: Project[];
}

const UnassignedTasksList: React.FC<UnassignedTasksListProps> = ({
  unassignedTasks,
  projects,
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Define semantic colors
  const surfaceBg = isDark
    ? semanticColors.surface.dark
    : semanticColors.surface.DEFAULT;
  const decorativeBorder = isDark
    ? semanticColors.borderDecorative.dark
    : semanticColors.borderDecorative.DEFAULT;
  const onSurfaceColor = isDark
    ? semanticColors.onSurface.dark
    : semanticColors.onSurface.DEFAULT;
  const textSecondaryColor = isDark
    ? semanticColors.textSecondary.dark
    : semanticColors.textSecondary.DEFAULT;

  if (!unassignedTasks || unassignedTasks.length === 0) {
    return null;
  }

  return (
    <Box
      bg={surfaceBg}
      borderRadius={sizing.borderRadius.lg}
      p={sizing.spacing[4]}
      borderWidth={sizing.borderWidth.DEFAULT}
      borderStyle="solid"
      borderColor={decorativeBorder}
      boxShadow={shadows.md}
      mt={sizing.spacing[5]}
    >
      <Heading
        as="h3"
        fontSize={typography.fontSize.h4}
        fontWeight={typography.fontWeight.semibold}
        lineHeight={typography.lineHeight.condensed}
        color={onSurfaceColor}
        mb={sizing.spacing[2]}
        display="flex"
        alignItems="center"
      >
        <AppIcon name="warning" boxSize={5} mr={2} />
        Unassigned Tasks (All Active Projects)
      </Heading>
      <VStack as="ul" spacing={sizing.spacing[2]} align="stretch">
        {unassignedTasks.slice(0, 5).map((task) => {
          const statusId = task.status
            ? mapStatusToStatusID(task.status)
            : undefined;
          const statusAttributes = statusId
            ? getStatusAttributes(statusId)
            : undefined;
          return (
            <Box as="li" key={task.id}>
              <HStack spacing={sizing.spacing[2]} align="center">
                <AppIcon name="warning" boxSize={4} mr={2} />
                <Tag
                  colorScheme={statusAttributes?.colorScheme || "gray"}
                  size="sm"
                >
                  <TagLeftIcon>
                    <AppIcon
                      component={
                        typeof statusAttributes?.icon !== "string" &&
                        statusAttributes?.icon
                          ? statusAttributes.icon
                          : FaTasks
                      }
                    />
                  </TagLeftIcon>
                  {task.status || "Unknown"}
                </Tag>
                <Text
                  fontWeight={typography.fontWeight.medium}
                  noOfLines={1}
                  color={onSurfaceColor}
                >
                  {task.title}
                </Text>
                {task.project_id &&
                  projects.find((p) => p.id === task.project_id) && (
                    <Text
                      as="span"
                      fontSize="xs"
                      color={textSecondaryColor}
                      noOfLines={1}
                    >
                      P: {projects.find((p) => p.id === task.project_id)?.name}
                    </Text>
                  )}
              </HStack>
            </Box>
          );
        })}
        {unassignedTasks.length > 5 && (
          <Text fontSize="sm" color={textSecondaryColor} mt={sizing.spacing[2]}>
            ...and {unassignedTasks.length - 5} more.
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default UnassignedTasksList;
