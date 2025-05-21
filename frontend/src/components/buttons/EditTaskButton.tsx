import React from "react";
import {
  IconButton,
  Tooltip,
  useTheme,
  useToken,
  IconButtonProps,
} from "@chakra-ui/react";
import AppIcon from "../../common/AppIcon"; // Adjusted path

interface EditTaskButtonProps {
  onClick: () => void;
  isDisabled?: boolean;
  ariaLabel?: string;
  size?: IconButtonProps["size"];
  variant?: IconButtonProps["variant"];
  // We need to know if the task is archived to set the correct text color
  isArchived?: boolean; 
}

const EditTaskButton: React.FC<EditTaskButtonProps> = ({
  onClick,
  isDisabled = false,
  ariaLabel = "Edit task",
  size = "sm",
  variant = "ghost",
  isArchived = false,
}) => {
  const theme = useTheme();
  const [
    textPrimaryColor,
    textDisabledColor,
    bgInteractiveSubtleHoverColor,
    editIconHoverColor,
  ] = useToken("colors", [
    "textPrimary",
    "textDisabled",
    "bgInteractiveSubtleHover",
    "blue.500", // Standard hover color for edit
  ]);

  const currentTextColor = isArchived ? textDisabledColor : textPrimaryColor;

  return (
    <Tooltip label="Edit Task" placement="top">
      <IconButton
        aria-label={ariaLabel}
        icon={<AppIcon name="edit" />}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        size={size}
        variant={variant}
        color={currentTextColor}
        _hover={{
          bg: bgInteractiveSubtleHoverColor,
          color: editIconHoverColor,
        }}
        isDisabled={isDisabled}
      />
    </Tooltip>
  );
};

export default EditTaskButton;
