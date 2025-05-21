import React from "react";
import { HStack } from "@chakra-ui/react";
import TaskStatusTag from "./common/TaskStatusTag";
import TaskProjectTag from "./common/TaskProjectTag";
import TaskAgentTag from "./common/TaskAgentTag";
import { Task } from "@/types/task";
import { StatusID, StatusAttributeObject } from "@/lib/statusUtils";

interface TaskItemDetailsSectionProps {
  task: Task;
  projectName?: string;
  statusInfo: StatusAttributeObject;
  styles: Record<string, unknown>;
  iconMap?: Record<string, React.ElementType>;
  currentStatusId: StatusID;
  compact?: boolean;
}

const TaskItemDetailsSection: React.FC<TaskItemDetailsSectionProps> = ({
  task,
  projectName,
  styles,
  iconMap,
  currentStatusId,
  compact,
}) => (
  <HStack gap="spacing.1" mt={compact ? "spacing.1" : "spacing.2"} flexWrap="wrap">
    <TaskStatusTag
      statusId={currentStatusId}
      fontWeight={(styles.statusTagStyle as { fontWeight?: string | number })?.fontWeight}
      fontSize={styles.tagFontSize as string | number | undefined}
      iconMap={iconMap || {}}
      bg={(styles.statusTagColors as { bg: string; color: string } | undefined)?.bg || ''}
      color={(styles.statusTagColors as { bg: string; color: string } | undefined)?.color || ''}
    />
    {projectName && (
      <TaskProjectTag
        projectName={projectName}
        projectTagStyle={(styles.projectTagStyle as { bg: string; color: string; fontWeight: string | number }) || { bg: '', color: '', fontWeight: 'normal' }}
        fontSize={styles.tagFontSize as string | number}
        style={styles.projectTagStyle as React.CSSProperties}
      />
    )}
    {((task.agent_name || task.agent_id) && (
      <TaskAgentTag
        agentName={(task.agent_name || task.agent_id) ?? ''}
        agentTagStyle={(styles.agentTagStyle as { bg: string; color: string; fontWeight: string | number }) || { bg: '', color: '', fontWeight: 'normal' }}
        fontSize={styles.tagFontSize as string | number}
        style={styles.agentTagStyle as React.CSSProperties}
      />
    ))}
  </HStack>
);

export default TaskItemDetailsSection; 