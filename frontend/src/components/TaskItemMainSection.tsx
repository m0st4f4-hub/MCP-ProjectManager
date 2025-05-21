import React, { useState } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";
import TaskTitleEditor from "./common/TaskTitleEditor";
import TaskDescriptionEditor from "./common/TaskDescriptionEditor";
import { inputStyle, textareaStyle } from "./TaskItem.styles";
import { Task, TaskUpdateData } from "@/types/task";
import TaskItemDetailsSection from "./TaskItemDetailsSection";
import { StatusID, StatusAttributeObject } from "@/lib/statusUtils";

interface TaskItemMainSectionProps {
  task: Task;
  projectName?: string;
  statusInfo: StatusAttributeObject;
  styles: Record<string, unknown>;
  textColor: string;
  iconMap: Record<string, React.ElementType>;
  currentStatusId: StatusID;
  compact?: boolean;
  editTaskInStore?: (id: string, update: Partial<TaskUpdateData>) => Promise<void>;
}

const TaskItemMainSection: React.FC<TaskItemMainSectionProps> = ({
  task,
  projectName,
  statusInfo,
  styles,
  textColor,
  iconMap,
  currentStatusId,
  compact,
  editTaskInStore,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");

  const startEditingTitle = () => {
    setEditTitle(task.title);
    setIsEditingTitle(true);
    if (task.status !== "IN_PROGRESS" && editTaskInStore) {
      editTaskInStore(task.id, { status: "IN_PROGRESS" });
    }
  };
  const startEditingDescription = () => {
    setEditDescription(task.description || "");
    setIsEditingDescription(true);
    if (task.status !== "IN_PROGRESS" && editTaskInStore) {
      editTaskInStore(task.id, { status: "IN_PROGRESS" });
    }
  };
  const saveTitle = async () => {
    if (editTitle.trim() !== task.title && editTaskInStore) {
      await editTaskInStore(task.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };
  const saveDescription = async () => {
    if (editDescription.trim() !== (task.description || "") && editTaskInStore) {
      await editTaskInStore(task.id, { description: editDescription.trim() });
    }
    setIsEditingDescription(false);
  };
  const cancelTitle = () => {
    setEditTitle(task.title);
    setIsEditingTitle(false);
  };
  const cancelDescription = () => {
    setEditDescription(task.description || "");
    setIsEditingDescription(false);
  };

  return (
    <VStack alignItems="flex-start" flexGrow={1} minW={0} gap={compact ? "spacing.0-5" : "spacing.1"}>
      <Box width="100%">
        {isEditingTitle ? (
          <TaskTitleEditor
            value={editTitle}
            onChange={setEditTitle}
            onSave={saveTitle}
            onCancel={cancelTitle}
            autoFocus
            fontSize={styles.titleFontSize as string | number | undefined}
            fontWeight={styles.titleFontWeight as string | number | undefined}
            color={textColor}
            inputStyle={{
              ...inputStyle,
              borderColor: styles.borderInteractiveFocusedColor as string,
              fontSize: ((styles.theme as { fontSizes: { sm: string } }).fontSizes.sm) as string,
              boxShadow: `0 0 0 1px ${styles.borderInteractiveFocusedColor as string}`,
            }}
          />
        ) : (
          <Text
            onClick={e => {
              e.stopPropagation();
              startEditingTitle();
            }}
            fontSize={styles.titleFontSize as string | number | undefined}
            fontWeight={styles.titleFontWeight as string | number | undefined}
            color={textColor}
            textDecoration={task.status === "COMPLETED" ? "line-through" : "none"}
            cursor="pointer"
            noOfLines={2}
          >
            {task.title}
          </Text>
        )}
      </Box>
      {(task.description || isEditingDescription) &&
        (isEditingDescription ? (
          <TaskDescriptionEditor
            value={editDescription}
            onChange={setEditDescription}
            onSave={saveDescription}
            onCancel={cancelDescription}
            autoFocus
            fontSize={styles.descriptionFontSize as string | number | undefined}
            fontWeight={styles.descriptionFontWeight as string | number | undefined}
            color={styles.textSecondaryColor as string}
            textareaStyle={{
              ...textareaStyle,
              borderColor: styles.borderInteractiveFocusedColor as string,
              fontSize: ((styles.theme as { fontSizes: { sm: string } }).fontSizes.sm) as string,
              boxShadow: `0 0 0 1px ${styles.borderInteractiveFocusedColor as string}`,
            }}
            rows={1}
          />
        ) : (
          <Text
            onClick={e => {
              e.stopPropagation();
              startEditingDescription();
            }}
            fontSize={styles.descriptionFontSize as string | number | undefined}
            color={textColor}
            cursor="pointer"
            noOfLines={compact ? 1 : 2}
          >
            {task.description}
          </Text>
        ))}
      <TaskItemDetailsSection
        task={task}
        projectName={projectName}
        statusInfo={statusInfo}
        styles={styles}
        iconMap={iconMap}
        currentStatusId={currentStatusId}
        compact={compact}
      />
    </VStack>
  );
};

export default TaskItemMainSection; 