import React from "react";
import { Tag, TagLabel, TagLeftIcon, Tooltip } from "@chakra-ui/react";
import { GoProject } from "react-icons/go";

interface TaskProjectTagProps {
  projectName: string;
  tagBg: string;
  tagColor: string;
  fontWeight?: string | number;
}

const TaskProjectTag: React.FC<TaskProjectTagProps> = ({
  projectName,
  tagBg,
  tagColor,
  fontWeight = 500,
}) => (
  <Tooltip label={`Project: ${projectName}`}>
    <Tag
      size="sm"
      bg={tagBg}
      color={tagColor}
      borderRadius="radii.round"
      px="spacing.2"
      py="spacing.0-5"
      fontWeight={fontWeight}
    >
      <TagLeftIcon as={GoProject} />
      <TagLabel>{projectName}</TagLabel>
    </Tag>
  </Tooltip>
);

export default TaskProjectTag;
