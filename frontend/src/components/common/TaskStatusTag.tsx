import React from "react";
import { Tag, TagLabel, TagLeftIcon } from "@chakra-ui/react";
import { getDisplayableStatus, StatusID } from "@/lib/statusUtils";
import { IconMap, defaultIconMap } from "./iconMap";

/**
 * Props for {@link TaskStatusTag}. The optional {@link IconMap iconMap}
 * allows consumers to supply custom icon components keyed by the string
 * identifiers used in {@link getDisplayableStatus}.
 */
interface TaskStatusTagProps {
  statusId: StatusID;
  fontWeight?: string | number;
  fontSize?: string | number;
  /**
   * Mapping from icon name to component. Defaults to {@link defaultIconMap}.
   */
  iconMap?: IconMap;
  style?: React.CSSProperties;
  bg: string;
  color: string;
}

const TaskStatusTag: React.FC<TaskStatusTagProps> = ({
  statusId,
  fontWeight,
  fontSize,
  iconMap = defaultIconMap,
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
