// D:\mcp\task-manager\frontend\src\components\TaskItem.tsx
"use client";

import React, { useCallback, memo } from "react";
import {
  Box,
  Checkbox,
  HStack,
  VStack,
  useToast,
  Button,
} from "@chakra-ui/react";
import { defaultIconMap } from "../common/iconMap";
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { getDisplayableStatus, StatusID, StatusAttributeObject } from "@/lib/statusUtils";
import { TaskItemProps } from "./TaskItem.types";
import { getStatusAccentColor } from "@/components/task";
import { useTaskItemStyles } from "../useTaskItemStyles";
import TaskItemMainSection from "./TaskItemMainSection";
import TaskItemModals from "../TaskItemModals";
import { TaskStatus } from "@/types/task";

// Default mapping from status icon names to actual icon components.
const iconMap = defaultIconMap;

/**
 * @module TaskItem
 * @description
 * TaskItem is the primary component for rendering a single task. It orchestrates
 * the display of task details, actions, and manages UI states like expansion
 * or modal visibility for editing. It delegates rendering of specific sections
 * to sub-components like TaskItemMainSection and TaskItemDetailsSection.
 *
 * It displays a compact or full view of a task, including its completion status,
 * title, project, tags, and provides access to task actions.
 *
 * @example
 * // Example usage within a task list:
 * <TaskItem
 *   task={myTaskObject}
 *   compact={false}
 *   onClick={() => console.log('Task clicked')}
 * />
 *
 * @param {TaskItemProps} props - The props for the TaskItem component.
 * @param {ITask} props.task - The core task object containing all its data.
 * @param {boolean} [props.compact=false] - If true, renders a more compact version of the task item.
 * @param {React.CSSProperties} [props.style] - Custom styles to apply to the root element.
 * @param {() => void} [props.onClick] - Callback function invoked when the task item is clicked.
 */
const TaskItem: React.FC<TaskItemProps> = memo(
  function TaskItem({
    task, // The main task object.
    compact = false,
    style,
    onClick,
  }) {
    const projects = useProjectStore((state) => state.projects);
    const projectName = projects.find((p) => p.id === task.project_id)?.name; // Fetches project name from store

    const editTaskInStore = useTaskStore((state) => state.updateTask); // Zustand store action for updating tasks
    const archiveTask = useTaskStore((state) => state.archiveTask);
    const unarchiveTask = useTaskStore((state) => state.unarchiveTask);

    const toast = useToast(); // Chakra UI toast for notifications

    // Determine the current status ID, defaulting to "TO_DO" if not set.
    const currentStatusId = (task.status || "TO_DO") as StatusID;
    const statusInfo = getDisplayableStatus(currentStatusId, task.title); // Utility to get displayable status info (icon, color, etc.)

    const styles = useTaskItemStyles(currentStatusId, compact); // Custom hook to get styles based on status and compactness

    // Callback to toggle the task's completion status.
    // It optimistically updates the UI and then calls the store action.
    const handleToggleCompletion = useCallback(async () => {
      // Determine the new status based on the current status.
      const newStatus = task.status !== TaskStatus.COMPLETED ? TaskStatus.COMPLETED : TaskStatus.TO_DO;
      try {
        // Attempt to update the task in the store.
        await editTaskInStore(task.project_id, task.task_number, { status: newStatus });
      } catch {
        // If the update fails, show an error toast.
        toast({
          title: "Error updating status",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }, [task.project_id, task.task_number, task.status, editTaskInStore, toast]); // Dependencies for useCallback

    // Determine the accent color for the left border based on the task status.
    const currentAccentColor = getStatusAccentColor(
      currentStatusId,
      styles.accentToDo, // Style token for ToDo accent
      styles.accentInProgress,
      styles.accentBlocked,
      styles.accentPending,
      styles.accentCompleted,
      styles.accentDefault, // Default accent color
    );

    // Determine text color based on whether the task is archived.
    const textColor = task.is_archived
      ? styles.textDisabledColor // Disabled text color for archived tasks
      : styles.textPrimaryColor; // Primary text color for active tasks

    return (
      // Root Box element for the TaskItem
      <Box
        p={compact ? "spacing.2" : "spacing.4"} // Padding based on compact prop
        borderRadius="radii.md"
        borderWidth="borders.width.xs"
        borderStyle="solid"
        borderColor={styles.borderDecorativeColor} // Border color
        boxShadow="shadows.sm" // Default shadow
        transition="all 0.2s ease-in-out" // Smooth transition for hover effects
        position="relative" // For potential absolute positioned children
        overflow="hidden" // Ensures content respects border radius
        bg={
          // Background color based on completion status
          task.status === TaskStatus.COMPLETED
            ? styles.bgSurfaceElevatedColor // Elevated background for completed tasks
            : styles.bgSurfaceColor // Standard background for other tasks
        }
        borderLeftWidth="spacing.1" // Left border width for status accent
        borderLeftStyle="solid"
        borderLeftColor={currentAccentColor} // Status accent color
        _hover={{
          // Hover effects
          boxShadow: "shadows.md", // Increase shadow on hover
          transform: "translateY(-1px)", // Slight lift effect on hover
        }}
        style={style} // Apply custom inline styles if provided
        onClick={onClick} // Attach onClick handler if provided
      >
        {/* Horizontal stack for checkbox and main content */}
        <HStack alignItems="flex-start" width="100%" gap="spacing.3">
          {/* Checkbox for task completion */}
          <Box pt="spacing.0-5">
            <Checkbox
              isChecked={task.status === TaskStatus.COMPLETED} // Checked if task is completed
              onChange={handleToggleCompletion} // Handler to toggle completion
              size="lg" // Large size checkbox
              colorScheme={statusInfo?.colorScheme || "gray"} // Color scheme based on status
              aria-label={`Mark task ${task.title} as ${task.status === TaskStatus.COMPLETED ? "incomplete" : "complete"}`}
            />
          </Box>

          {/* Vertical stack for task details */}
          <VStack
            alignItems="flex-start" // Align items to the start (left)
            flexGrow={1} // Allow this stack to grow and fill available space
            minW={0} // Prevent overflow issues by setting a minimum width
            gap={compact ? "spacing.0-5" : "spacing.1"} // Gap between elements based on compact prop
          >
            {/* Main section of the task item, includes title, status, etc. */}
            <TaskItemMainSection
              task={task}
              projectName={projectName} // Pass down the fetched project name
              statusInfo={ // Pass down status information object
                (statusInfo !== undefined
                  ? statusInfo
                  : { // Fallback status info if getDisplayableStatus returns undefined
                      id: currentStatusId,
                      displayName: currentStatusId, // Default display name to status ID
                      colorScheme: 'gray', // Default color scheme
                      icon: undefined, // No icon by default
                      category: 'todo', // Default category
                      description: '', // No description
                      isTerminal: false, // Not terminal by default
                      isDynamic: false, // Not dynamic by default
                    }) as StatusAttributeObject // Use imported StatusAttributeObject
              }
              styles={styles} // Pass down styles from useTaskItemStyles
              textColor={textColor} // Pass down calculated text color
              iconMap={iconMap} // Pass down the populated iconMap
              currentStatusId={currentStatusId} // Pass down current status ID
              compact={compact} // Pass down compact prop
              editTaskInStore={editTaskInStore} // Pass down store action for editing
            />
          </VStack>
        </HStack>
        {/* Modals related to task actions (e.g., edit, details) */}
        {/* This component likely handles its own visibility based on internal state or props from TaskItem */}
        <TaskItemModals task={task} />
        <Button
          size="xs"
          onClick={(e) => {
            e.stopPropagation(); // Prevent task item click when clicking the button
            if (task.is_archived) {
              unarchiveTask(task.project_id, task.task_number);
            } else {
              archiveTask(task.project_id, task.task_number);
            }
          }}
        >
          {task.is_archived ? "Unarchive" : "Archive"}
        </Button>
      </Box>
    );
  }
);

// Set display name for better debugging in React DevTools
TaskItem.displayName = "TaskItem";

export default TaskItem;