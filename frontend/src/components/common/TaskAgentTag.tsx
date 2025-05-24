import React from "react";
import { Tag, TagLabel, Avatar, TagLeftIcon, Tooltip, Badge } from "@chakra-ui/react";

interface TaskAgentTagProps {
  agentName: string;
  agentTagStyle: {
    bg: string;
    color: string;
    fontWeight: string | number;
  };
  fontSize?: string | number;
  style?: React.CSSProperties;
  status?: string;
}

const statusColorMap: Record<string, string> = {
  available: "green",
  busy: "orange",
  offline: "gray",
};

const TaskAgentTag: React.FC<TaskAgentTagProps> = ({
  agentName,
  agentTagStyle,
  fontSize,
  style,
  status,
}) => {
  const displayStatus = status ? status.toLowerCase() : "offline";
  const badgeColor = statusColorMap[displayStatus] || "gray";
  return (
    <Tooltip label={`Agent: ${agentName}${status ? ` (${displayStatus})` : ""}`}>
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
        <Badge ml={2} colorScheme={badgeColor} fontSize="0.7em" variant="subtle">
          {displayStatus}
        </Badge>
    </Tag>
  </Tooltip>
);
};

export default TaskAgentTag;
