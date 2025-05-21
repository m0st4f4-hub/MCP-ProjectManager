import React from "react";
import { Tag, TagLabel, Avatar, Tooltip } from "@chakra-ui/react";

interface TaskAgentTagProps {
  agentName: string;
  tagBg: string;
  tagColor: string;
  fontWeight?: string | number;
}

const TaskAgentTag: React.FC<TaskAgentTagProps> = ({
  agentName,
  tagBg,
  tagColor,
  fontWeight = 500,
}) => (
  <Tooltip label={`Agent: ${agentName}`}>
    <Tag
      size="sm"
      bg={tagBg}
      color={tagColor}
      borderRadius="radii.round"
      px="spacing.2"
      py="spacing.0-5"
      fontWeight={fontWeight}
    >
      <Avatar name={agentName} size="xs" mr="spacing.1" />
      <TagLabel>{agentName}</TagLabel>
    </Tag>
  </Tooltip>
);

export default TaskAgentTag;
