import React from "react";
import { Tag, TagLabel, TagLeftIcon } from "@chakra-ui/react";

interface TaskStatusTagProps {
  displayName: string;
  icon?: React.ElementType;
  tagBg: string;
  tagColor: string;
  fontWeight?: string | number;
}

const TaskStatusTag: React.FC<TaskStatusTagProps> = ({
  displayName,
  icon: Icon,
  tagBg,
  tagColor,
  fontWeight = 500,
}) => (
  <Tag
    size="sm"
    bg={tagBg}
    color={tagColor}
    borderRadius="radii.round"
    px="spacing.2"
    py="spacing.0-5"
    fontWeight={fontWeight}
  >
    {Icon && <TagLeftIcon as={Icon} />}
    <TagLabel>{displayName}</TagLabel>
  </Tag>
);

export default TaskStatusTag;
