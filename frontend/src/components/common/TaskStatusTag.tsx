import React from "react";
import { Tag, TagLabel, TagLeftIcon } from "@chakra-ui/react";
import { getDisplayableStatus, StatusID } from "@/lib/statusUtils";

interface TaskStatusTagProps {
  statusId: StatusID;
  fontWeight?: string | number;
  fontSize?: string | number;
  iconMap: Record<string, React.ElementType>;
  style?: React.CSSProperties;
  bg: string;
  color: string;
}

const TaskStatusTag: React.FC<TaskStatusTagProps> = ({
  statusId,
  fontWeight,
  fontSize,
  iconMap,
  style,
  bg,
  color,
}) => {
  const statusInfo = getDisplayableStatus(statusId);
  const IconComponent =
    typeof statusInfo?.icon === "string"
      ? iconMap[statusInfo.icon]
      : statusInfo?.icon;
  return (
    <Tag
      size="sm"
      bg={bg}
      color={color}
      borderRadius="radii.round"
      px="spacing.2"
      py="spacing.0-5"
      fontWeight={fontWeight}
      fontSize={fontSize}
      style={style}
    >
      {IconComponent && <TagLeftIcon as={IconComponent} />}
      <TagLabel>{statusInfo?.displayName || statusId}</TagLabel>
    </Tag>
  );
};

export default TaskStatusTag;
