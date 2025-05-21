import React from "react";
import { Tag, TagLabel, TagLeftIcon, Tooltip } from "@chakra-ui/react";
import { GoProject } from "react-icons/go";

interface TaskProjectTagProps {
  projectName: string;
  projectTagStyle: {
    bg: string;
    color: string;
    fontWeight: string | number;
  };
  fontSize?: string | number;
  style?: React.CSSProperties;
}

const TaskProjectTag: React.FC<TaskProjectTagProps> = ({
  projectName,
  projectTagStyle,
  fontSize,
  style,
}) => (
  <Tooltip label={`Project: ${projectName}`}>
    <Tag
      size="sm"
      bg={projectTagStyle.bg}
      color={projectTagStyle.color}
      borderRadius="radii.round"
      px="spacing.2"
      py="spacing.0-5"
      fontWeight={projectTagStyle.fontWeight}
      fontSize={fontSize}
      style={style}
    >
      <TagLeftIcon as={GoProject} />
      <TagLabel>{projectName}</TagLabel>
    </Tag>
  </Tooltip>
);

export default TaskProjectTag;
