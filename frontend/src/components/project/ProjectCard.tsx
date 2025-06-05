import React from 'react';
import {
  Box,
  Flex,
  Heading,
  VStack,
  Text,
  Badge,
  BoxProps,
} from '@chakra-ui/react';
import { CheckCircleIcon, RepeatClockIcon, TimeIcon } from '@chakra-ui/icons';
import { format, formatRelative } from 'date-fns';
import { parseDate } from '@/utils/date';
import { ProjectWithMeta, Project } from '@/types';
import { colorPrimitives } from '@/tokens/colors';
import AppIcon from '../common/AppIcon';
import ProjectCardMenu from './ProjectCardMenu';

interface ProjectCardProps {
  project: ProjectWithMeta;
  projectToDeleteId?: string | null;
  onEdit: (project: ProjectWithMeta) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (project: Project) => void;
  onCopyGet: (id: string) => void;
  onOpenCliPrompt: (project: ProjectWithMeta) => void;
}

const getProjectStatusInfo = (project: ProjectWithMeta) => {
  const totalTasks = project.task_count ?? 0;
  let colorScheme = 'gray';
  let icon: React.ElementType = TimeIcon;
  let fullText = 'Pending Start';

  if (project.is_archived) {
    colorScheme = 'purple';
    icon = CheckCircleIcon; // Using check icon for archived state
    fullText = 'Archived';
  } else if (project.status === 'completed') {
    colorScheme = 'green';
    icon = CheckCircleIcon;
    fullText = 'Completed';
  } else if (project.status === 'in_progress') {
    colorScheme = 'blue';
    icon = RepeatClockIcon;
    fullText = 'In Progress';
  } else if (totalTasks === 0) {
    colorScheme = 'gray';
    icon = CheckCircleIcon;
    fullText = 'Idle (No Tasks)';
  }
  return { colorScheme, icon, fullText };
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  projectToDeleteId,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  onCopyGet,
  onOpenCliPrompt,
}) => {
  const { colorScheme, icon: StatusIcon, fullText } = getProjectStatusInfo(project);
  const displayTotalTasks = project.task_count ?? 0;
  const displayCompletedTasks = project.completed_task_count ?? 0;
  const displayProgress = displayTotalTasks > 0 ? (displayCompletedTasks / displayTotalTasks) * 100 : 0;
  const displayDescription = project.description || 'No description provided.';

  const cardBaseStyles: BoxProps = {
    p: 4,
    borderRadius: 'lg',
    borderWidth: 'DEFAULT',
    borderStyle: 'solid',
    boxShadow: 'sm',
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const cardActiveStyles = {
    ...cardBaseStyles,
    bg: 'bgSurface',
    borderColor: 'borderDecorative',
    _hover: {
      boxShadow: 'md',
      borderColor: 'borderInteractive',
      transform: 'translateY(-0.125rem)',
    },
  };

  const cardArchivedStyles = {
    ...cardBaseStyles,
    bg: 'bgDisabled',
    borderColor: 'borderDisabled',
    color: 'textDisabled',
    _hover: {
      boxShadow: 'sm',
      borderColor: 'borderDisabled',
      transform: 'translateY(0)',
    },
  };

  const currentCardStyles = project.is_archived ? cardArchivedStyles : cardActiveStyles;

  return (
    <Box {...currentCardStyles} role="group" data-testid={`project-card-${project.id}`}>
      {project.is_archived && (
        <Flex
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="overlayDisabledBg"
          alignItems="center"
          justifyContent="center"
          color="textDisabled"
          fontWeight="bold"
          fontSize="lg"
          zIndex="1"
          p="4"
          textAlign="center"
          borderRadius="lg"
        >
          <Text isTruncated>Archived</Text>
        </Flex>
      )}
      <VStack spacing="3" align="stretch" flexGrow={1} opacity={project.is_archived ? 0.6 : 1}>
        <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Heading as="h3" size="md" color={project.is_archived ? 'textDisabled' : 'textStrong'} fontWeight="semibold" noOfLines={2} title={project.name} flexGrow={1} mr={2}>
            {project.name}
          </Heading>
          <ProjectCardMenu
            project={project}
            onEdit={onEdit}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            onDelete={onDelete}
            onCopyGet={onCopyGet}
            onOpenCliPrompt={onOpenCliPrompt}
            disableActions={!!(project.is_archived && projectToDeleteId === project.id)}
          />
        </Flex>
        <Text fontSize="sm" color={project.description ? 'textSecondary' : 'textPlaceholder'} fontWeight="normal" lineHeight="condensed" noOfLines={2} title={displayDescription} fontStyle={project.description ? undefined : 'italic'}>
          {displayDescription}
        </Text>
        <Flex justifyContent="space-between" alignItems="center" mt="1" mb="1">
          <Badge px="2.5" py="0.5" borderRadius="full" fontSize="xs" textTransform="capitalize" display="inline-flex" alignItems="center" variant="subtle" colorScheme={colorScheme}>
            <AppIcon component={StatusIcon} mr="1.5" boxSize={3} />
            {fullText}
          </Badge>
          <Text fontSize="sm" color="textSecondary" fontWeight="medium">
            {displayCompletedTasks}/{displayTotalTasks} Tasks
          </Text>
        </Flex>
        {(displayTotalTasks > 0 || project.is_archived) && (
          <Box w="full" bg={project.is_archived ? 'transparent' : 'borderDecorative'} borderRadius="full" h="1.5" overflow="hidden" mt={1}>
            <Box
              bg={
                project.is_archived
                  ? 'transparent'
                  : displayProgress === 100
                  ? colorPrimitives.green[500]
                  : 'primary'
              }
              h="full"
              w={`${displayProgress}%`}
              borderRadius="full"
              transition="width 0.3s ease-in-out"
            />
          </Box>
        )}
        <Flex justifyContent="space-between" alignItems="center" mt="auto" pt="3">
          <Text fontSize="xs" color="textSecondary">
            Created: {project.created_at ? format(parseDate(project.created_at), 'MMM d, yy') : 'N/A'}
          </Text>
          <Text fontSize="xs" color="textSecondary">
            Updated: {project.updated_at ? formatRelative(parseDate(project.updated_at), new Date()) : 'Never'}
          </Text>
        </Flex>
      </VStack>
    </Box>
  );
};

export default ProjectCard;
