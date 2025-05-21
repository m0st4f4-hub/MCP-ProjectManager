import React from "react";
import { Input, HStack, IconButton } from "@chakra-ui/react";
import { EditIcon as ChakraEditIcon } from "@chakra-ui/icons";
import AppIcon from "./AppIcon";

interface TaskTitleEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  fontSize?: string | number;
  fontWeight?: string | number;
  color?: string;
  inputStyle?: React.CSSProperties;
  saveLabel?: string;
  cancelLabel?: string;
}

const TaskTitleEditor: React.FC<TaskTitleEditorProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  onBlur,
  autoFocus = false,
  fontSize,
  fontWeight,
  color,
  inputStyle,
  saveLabel = "Save title",
  cancelLabel = "Cancel edit title",
}) => {
  return (
    <HStack gap="spacing.1">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur || onSave}
        autoFocus={autoFocus}
        variant="flushed"
        placeholder="Task title"
        fontSize={fontSize}
        fontWeight={fontWeight}
        color={color}
        sx={inputStyle}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
      />
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
  );
};

export default TaskTitleEditor;
