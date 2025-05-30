import React, { useState } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";
import TaskTitleEditor from "../common/TaskTitleEditor";
import TaskDescriptionEditor from "../common/TaskDescriptionEditor";
import { inputStyle, textareaStyle } from "./TaskItem.styles";
import { Task, TaskUpdateData } from "@/types/task"; // Assuming Task is ITask or similar
import TaskItemDetailsSection from "./TaskItemDetailsSection";
import { StatusID, StatusAttributeObject } from "@/lib/statusUtils";


/**
 * @interface TaskItemMainSectionProps
 * @description Props for the TaskItemMainSection component.
 * This section displays the core interactive elements of a task,
 * such as its title and description, and handles inline editing for these fields.
 */
interface TaskItemMainSectionProps {
  /** The main task object containing all its data. */
  task: Task;
  /** Optional: The name of the project this task belongs to. */
  projectName?: string;
  /** Object containing displayable status information (name, color, icon). */
  statusInfo: StatusAttributeObject;
  /** Style object, typically from a custom hook like useTaskItemStyles. */
  styles: Record<string, unknown>; // Consider a more specific type if possible
  /** The color to use for text elements, determined by archiving status or other factors. */
  textColor: string;
  /** A map of status IDs to React ElementType, for rendering status icons. */
  iconMap: Record<string, React.ElementType>; // TODO: Confirm usage or remove if not used directly here
  /** The current status ID of the task. */
  currentStatusId: StatusID;
  /** If true, renders a more compact version of this section. */
  compact?: boolean;
  /** 
   * Optional callback to update the task in the store.
   * Used for inline edits of title and description.
   */
  editTaskInStore?: (project_id: string, task_number: number, update: Partial<TaskUpdateData>) => Promise<void>;
}


/**
 * @module TaskItemMainSection
 * @description
 * Renders the main, always-visible part of a task item. This includes
 * the task title (editable), description (editable and expandable), and
 * delegates to TaskItemDetailsSection for other details like project name, status tags etc.
 *
 * @example
 * <TaskItemMainSection
 *   task={currentTask}
 *   projectName="My Project"
 *   statusInfo={currentStatusInfo}
 *   styles={taskStyles}
 *   textColor="text.primary"
 *   iconMap={{}} // Define your icon map
 *   currentStatusId="IN_PROGRESS"
 *   compact={false}
 *   editTaskInStore={handleUpdateTask}
 * />
 */
const TaskItemMainSection: React.FC<TaskItemMainSectionProps> = ({
  task, // The task object
  projectName, // Name of the project
  statusInfo, // Displayable status information
  styles, // Style object from parent
  textColor, // Text color
  iconMap, // Icon mapping (currently unused directly here, passed to DetailsSection)
  currentStatusId, // Current status ID
  compact, // Compact mode flag
  editTaskInStore, // Function to update task in store
}) => {
  // State for managing inline editing of title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  // State for managing inline editing of description
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  // State for the title value during editing
  const [editTitle, setEditTitle] = useState(task.title);
  // State for the description value during editing
  const [editDescription, setEditDescription] = useState(task.description || "");

  // Handler to initiate title editing
  const startEditingTitle = () => {
    setEditTitle(task.title); // Initialize edit field with current title
    setIsEditingTitle(true); // Set editing mode to true
    // If task is not already "IN_PROGRESS", update its status
    // This is an optimistic update or side-effect of starting to edit.
    if (task.status !== "IN_PROGRESS" && editTaskInStore) {
      editTaskInStore(task.project_id, task.task_number, { status: "IN_PROGRESS" });
    }
  };

  // Handler to initiate description editing
  const startEditingDescription = () => {
    setEditDescription(task.description || ""); // Initialize edit field with current description
    setIsEditingDescription(true); // Set editing mode to true
    // If task is not already "IN_PROGRESS", update its status
    if (task.status !== "IN_PROGRESS" && editTaskInStore) {
      editTaskInStore(task.project_id, task.task_number, { status: "IN_PROGRESS" });
    }
  };

  // Handler to save the edited title
  const saveTitle = async () => {
    // Only save if the title has actually changed and editTaskInStore is available
    if (editTitle.trim() !== task.title && editTaskInStore) {
      await editTaskInStore(task.project_id, task.task_number, { title: editTitle.trim() });
    }
    setIsEditingTitle(false); // Exit editing mode
  };

  // Handler to save the edited description
  const saveDescription = async () => {
    // Only save if the description has actually changed and editTaskInStore is available
    if (editDescription.trim() !== (task.description || "") && editTaskInStore) {
      await editTaskInStore(task.project_id, task.task_number, { description: editDescription.trim() });
    }
    setIsEditingDescription(false); // Exit editing mode
  };

  // Handler to cancel title editing
  const cancelTitle = () => {
    setEditTitle(task.title); // Reset edit field to original title
    setIsEditingTitle(false); // Exit editing mode
  };

  // Handler to cancel description editing
  const cancelDescription = () => {
    setEditDescription(task.description || ""); // Reset edit field to original description
    setIsEditingDescription(false); // Exit editing mode
  };

  return (
    // Main container for this section
    <VStack alignItems="flex-start" flexGrow={1} minW={0} gap={compact ? "spacing.0-5" : "spacing.1"}>
      {/* Container for the title editor/display */}
      <Box width="100%">
        {isEditingTitle ? (
          // Render TaskTitleEditor when in title editing mode
          <TaskTitleEditor
            value={editTitle}
            onChange={setEditTitle}
            onSave={saveTitle}
            onCancel={cancelTitle}
            autoFocus // Automatically focus the input field
            fontSize={styles.titleFontSize as string | number | undefined}
            fontWeight={styles.titleFontWeight as string | number | undefined}
            color={textColor}
            inputStyle={{ // Custom styles for the input field
              ...inputStyle, // Base input style
              borderColor: styles.borderInteractiveFocusedColor as string,
              fontSize: ((styles.theme as { fontSizes: { sm: string } }).fontSizes.sm) as string,
              boxShadow: `0 0 0 1px ${styles.borderInteractiveFocusedColor as string}`,
            }}
          />
        ) : (
          // Render Text display for title when not editing
          <Text
            onClick={e => {
              e.stopPropagation(); // Prevent click from bubbling to parent TaskItem onClick
              startEditingTitle(); // Initiate title editing on click
            }}
            fontSize={styles.titleFontSize as string | number | undefined}
            fontWeight={styles.titleFontWeight as string | number | undefined}
            color={textColor}
            textDecoration={task.status === "COMPLETED" ? "line-through" : "none"} // Line-through if completed
            cursor="pointer" // Indicate it's clickable
            noOfLines={2} // Limit to 2 lines, truncates with ellipsis if longer
          >
            {task.title}
          </Text>
        )}
      </Box>

      {/* Conditional rendering for description: show if description exists or if currently editing description */}
      {(task.description || isEditingDescription) &&
        (isEditingDescription ? (
          // Render TaskDescriptionEditor when in description editing mode
          <TaskDescriptionEditor
            value={editDescription}
            onChange={setEditDescription}
            onSave={saveDescription}
            onCancel={cancelDescription}
            autoFocus // Automatically focus the textarea
            fontSize={styles.descriptionFontSize as string | number | undefined}
            fontWeight={styles.descriptionFontWeight as string | number | undefined}
            color={styles.textSecondaryColor as string} // Use secondary text color for editor
            textareaStyle={{ // Custom styles for the textarea
              ...textareaStyle, // Base textarea style
              borderColor: styles.borderInteractiveFocusedColor as string,
              fontSize: ((styles.theme as { fontSizes: { sm: string } }).fontSizes.sm) as string,
              boxShadow: `0 0 0 1px ${styles.borderInteractiveFocusedColor as string}`,
            }}
            rows={1} // Start with 1 row, likely expands
          />
        ) : (
          // Render Text display for description when not editing
          <Text
            onClick={e => {
              e.stopPropagation(); // Prevent click from bubbling
              startEditingDescription(); // Initiate description editing on click
            }}
            fontSize={styles.descriptionFontSize as string | number | undefined}
            color={textColor} // Use primary text color (can be different from editor)
            cursor="pointer" // Indicate it's clickable
            noOfLines={compact ? 1 : 2} // Limit lines based on compact mode
          >
            {task.description}
          </Text>
        ))}
      
      {/* Renders other details like project name, status tags, agent, etc. */}
      <TaskItemDetailsSection
        task={task}
        projectName={projectName} // Pass down project name
        styles={styles} // Pass down styles
        iconMap={iconMap} // Pass down icon map (might be used for status icons within details)
        currentStatusId={currentStatusId} // Pass down current status ID
        compact={compact} // Pass down compact mode
      />
    </VStack>
  );
};

export default TaskItemMainSection;