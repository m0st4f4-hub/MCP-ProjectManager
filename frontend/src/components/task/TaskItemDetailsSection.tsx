import React from "react";
import { HStack } from "@chakra-ui/react";
import TaskStatusTag from "../common/TaskStatusTag";
import TaskProjectTag from "../common/TaskProjectTag";
import TaskAgentTag from "../common/TaskAgentTag";
import { Task } from "@/types/task"; // Assuming Task is ITask or similar
import { StatusID, StatusAttributeObject } from "@/lib/statusUtils";

/**
 * @interface TaskItemDetailsSectionProps
 * @description Props for the TaskItemDetailsSection component.
 * This section is responsible for displaying tags related to a task,
 * such as its status, project, and assigned agent.
 */
interface TaskItemDetailsSectionProps {
  /** The main task object, used here to access agent information. */
  task: Task;
  /** Optional: The name of the project this task belongs to. */
  projectName?: string;
  /** 
   * Object containing displayable status information. 
   * Note: While passed, it's not directly used in this component in favor of currentStatusId for TaskStatusTag.
   * Consider removing if TaskStatusTag doesn't internally derive info from it based on currentStatusId.
   */
  statusInfo: StatusAttributeObject; // Review: Is this needed if currentStatusId and iconMap are used?
  /** Style object, typically from a custom hook like useTaskItemStyles. */
  styles: Record<string, unknown>; // Consider a more specific type
  /** Optional: A map of status IDs to React ElementType for rendering status icons in TaskStatusTag. */
  iconMap?: Record<string, React.ElementType>;
  /** The current status ID of the task, used by TaskStatusTag. */
  currentStatusId: StatusID;
  /** If true, applies specific styling adjustments, like reduced margin-top. */
  compact?: boolean;
}

/**
 * @module TaskItemDetailsSection
 * @description
 * Renders a section within a TaskItem that displays key details as tags,
 * such as the task's status, associated project, and assigned agent.
 * It's designed to be used within TaskItemMainSection or TaskItem.
 *
 * @example
 * <TaskItemDetailsSection
 *   task={currentTask}
 *   projectName="Galaxy Quest"
 *   statusInfo={currentStatusInfoObject}
 *   styles={taskStylingObject}
 *   iconMap={statusIconMapping}
 *   currentStatusId="IN_PROGRESS"
 *   compact={false}
 * />
 */
const TaskItemDetailsSection: React.FC<TaskItemDetailsSectionProps> = ({
  task, // The task object
  projectName, // Name of the project
  styles, // Style object from parent
  iconMap, // Icon mapping for status tags
  currentStatusId, // Current status ID for the status tag
  compact, // Compact mode flag
  // statusInfo, // statusInfo is passed but not directly used; currentStatusId is used for TaskStatusTag
}) => (
  // Horizontal stack to layout tags. Allows wrapping if space is limited.
  <HStack gap="spacing.1" mt={compact ? "spacing.1" : "spacing.2"} flexWrap="wrap">
    {/* Displays the current status of the task as a tag. */}
    <TaskStatusTag
      statusId={currentStatusId} // The actual status ID to display
      fontWeight={(styles.statusTagStyle as { fontWeight?: string | number })?.fontWeight}
      fontSize={styles.tagFontSize as string | number | undefined}
      iconMap={iconMap || {}} // Pass iconMap for status-specific icons
      // Safely access background and color from styles, providing fallbacks
      bg={(styles.statusTagColors as { bg: string; color: string } | undefined)?.bg || ''}
      color={(styles.statusTagColors as { bg: string; color: string } | undefined)?.color || ''}
    />

    {/* Conditionally render the project tag if projectName is provided. */}
    {projectName && (
      <TaskProjectTag
        projectName={projectName}
        // Safely access project tag styles, providing a default object structure
        projectTagStyle={(styles.projectTagStyle as { bg: string; color: string; fontWeight: string | number }) || { bg: '', color: '', fontWeight: 'normal' }}
        fontSize={styles.tagFontSize as string | number}
        style={styles.projectTagStyle as React.CSSProperties} // Pass general style object as well
      />
    )}

    {/* Conditionally render the agent tag if agent_name or agent_id is present on the task. */}
    {((task.agent_name || task.agent_id) && (
      <TaskAgentTag
        agentName={(task.agent_name || task.agent_id) ?? ''} // Use agent_name, fallback to agent_id, then to empty string
        // Safely access agent tag styles, providing a default object structure
        agentTagStyle={(styles.agentTagStyle as { bg: string; color: string; fontWeight: string | number }) || { bg: '', color: '', fontWeight: 'normal' }}
        fontSize={styles.tagFontSize as string | number}
        style={styles.agentTagStyle as React.CSSProperties} // Pass general style object as well
      />
    ))}
  </HStack>
);

export default TaskItemDetailsSection;