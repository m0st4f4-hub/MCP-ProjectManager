"use client";

import React, { useCallback, memo } from "react";
import {
  Box,
  Checkbox,
  HStack,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { getDisplayableStatus, StatusID } from "@/lib/statusUtils";
import { TaskItemProps } from "./TaskItem.types";
import { getStatusAccentColor } from "./TaskItem.utils";
import { useTaskItemStyles } from "./useTaskItemStyles";
import TaskItemMainSection from "./TaskItemMainSection";
import TaskItemModals from "./TaskItemModals";

const TaskItem: React.FC<TaskItemProps> = memo(
  function TaskItem({
    task,
    compact = false,
    style,
    onClick,
    onCopyGetCommand,
  }) {
    const projects = useProjectStore((state) => state.projects);
    const projectName = projects.find((p) => p.id === task.project_id)?.name;

    const editTaskInStore = useTaskStore((state) => state.updateTask);
    const toast = useToast();

    const currentStatusId = (task.status || "TO_DO") as StatusID;
    const statusInfo = getDisplayableStatus(currentStatusId, task.title);

    const styles = useTaskItemStyles(currentStatusId, compact);

    const handleToggleCompletion = useCallback(async () => {
      const newStatus = task.status !== "COMPLETED" ? "COMPLETED" : "TO_DO";
      try {
        await editTaskInStore(task.id, { status: newStatus });
      } catch {
        toast({
          title: "Error updating status",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }, [task.id, task.status, editTaskInStore, toast]);

    const currentAccentColor = getStatusAccentColor(
      currentStatusId,
      styles.accentToDo,
      styles.accentInProgress,
      styles.accentBlocked,
      styles.accentPending,
      styles.accentCompleted,
      styles.accentDefault,
    );

    const textColor = task.is_archived
      ? styles.textDisabledColor
      : styles.textPrimaryColor;

    return (
      <Box
        p={compact ? "spacing.2" : "spacing.4"}
        borderRadius="radii.md"
        borderWidth="borders.width.xs"
        borderStyle="solid"
        borderColor={styles.borderDecorativeColor}
        boxShadow="shadows.sm"
        transition="all 0.2s ease-in-out"
        position="relative"
        overflow="hidden"
        bg={
          task.status === "COMPLETED"
            ? styles.bgSurfaceElevatedColor
            : styles.bgSurfaceColor
        }
        borderLeftWidth="spacing.1"
        borderLeftStyle="solid"
        borderLeftColor={currentAccentColor}
        _hover={{
          boxShadow: "shadows.md",
          transform: "translateY(-1px)",
        }}
        style={style}
        onClick={onClick}
      >
        <HStack alignItems="flex-start" width="100%" gap="spacing.3">
          <Box pt="spacing.0-5">
            <Checkbox
              isChecked={task.status === "COMPLETED"}
              onChange={handleToggleCompletion}
              size="lg"
              colorScheme={statusInfo?.colorScheme || "gray"}
              aria-label={`Mark task ${task.title} as ${task.status === "COMPLETED" ? "incomplete" : "complete"}`}
            />
          </Box>

          <VStack
            alignItems="flex-start"
            flexGrow={1}
            minW={0}
            gap={compact ? "spacing.0-5" : "spacing.1"}
          >
            <TaskItemMainSection
              task={task}
              projectName={projectName}
              statusInfo={
                (statusInfo !== undefined
                  ? statusInfo
                  : {
                      id: currentStatusId,
                      displayName: currentStatusId,
                      colorScheme: 'gray',
                      icon: undefined,
                      category: 'todo',
                      description: '',
                      isTerminal: false,
                      isDynamic: false,
                    }) as import("@/lib/statusUtils").StatusAttributeObject
              }
              styles={styles}
              textColor={textColor}
              iconMap={{}}
              currentStatusId={currentStatusId}
              compact={compact}
              editTaskInStore={editTaskInStore}
            />
          </VStack>
        </HStack>
        <TaskItemModals task={task} />
      </Box>
    );
  }
);

TaskItem.displayName = "TaskItem";

export default TaskItem;