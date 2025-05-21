import React from "react";
import { Textarea, HStack, IconButton } from "@chakra-ui/react";
import { EditIcon as ChakraEditIcon } from "@chakra-ui/icons";
import AppIcon from "./AppIcon";

interface TaskDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  fontSize?: string | number;
  fontWeight?: string | number;
  color?: string;
  textareaStyle?: React.CSSProperties;
  saveLabel?: string;
  cancelLabel?: string;
  rows?: number;
}

const TaskDescriptionEditor: React.FC<TaskDescriptionEditorProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  onBlur,
  autoFocus = false,
  fontSize,
  fontWeight,
  color,
  textareaStyle,
  saveLabel = "Save description",
  cancelLabel = "Cancel edit description",
  rows = 1,
}) => {
  return (
    <>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur || onSave}
        autoFocus={autoFocus}
        variant="flushed"
        placeholder="Task description"
        rows={rows}
        fontSize={fontSize}
        fontWeight={fontWeight}
        color={color}
        sx={textareaStyle}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.ctrlKey) onSave();
          if (e.key === "Escape") onCancel();
        }}
      />
      <HStack gap="spacing.1" justifyContent="flex-end" w="full">
        <IconButton
          aria-label={saveLabel}
          icon={<AppIcon component={ChakraEditIcon} boxSize="1rem" />}
          onClick={onSave}
          size="xs"
          variant="ghost"
          color={color}
        />
        <IconButton
          aria-label={cancelLabel}
          icon={<AppIcon component={ChakraEditIcon} boxSize="1rem" />}
          onClick={onCancel}
          size="xs"
          variant="ghost"
          color={color}
        />
      </HStack>
    </>
  );
};

export default TaskDescriptionEditor;
