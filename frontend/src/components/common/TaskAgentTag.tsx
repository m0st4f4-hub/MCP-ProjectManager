import React from "react";
import { Tag, TagLabel, Avatar, TagLeftIcon, Tooltip } from "@chakra-ui/react";

interface TaskAgentTagProps {
  agentName: string;
  agentTagStyle: {
    bg: string;
    color: string;
    fontWeight: string | number;
  };
  fontSize?: string | number;
  style?: React.CSSProperties;
}

const TaskAgentTag: React.FC<TaskAgentTagProps> = ({
  agentName,
  agentTagStyle,
  fontSize,
  style,
}) => (
  <Tooltip label={`Agent: ${agentName}`}>
    <Tag
      size="sm"
      bg={agentTagStyle.bg}
      color={agentTagStyle.color}
      borderRadius="radii.round"
      px="spacing.2"
      py="spacing.0-5"
      fontWeight={agentTagStyle.fontWeight}
      fontSize={fontSize}
      style={style}
    >
      <TagLeftIcon
        as={() => <Avatar name={agentName} size="xs" mr="spacing.1" />}
      />
      <TagLabel>{agentName}</TagLabel>
    </Tag>
  </Tooltip>
);

export default TaskAgentTag;
