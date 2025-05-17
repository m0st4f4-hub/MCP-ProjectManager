"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  VStack,
  SimpleGrid,
  Badge,
  IconButton,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Spinner,
  Textarea,
  useDisclosure,
  Text,
  BoxProps,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CopyIcon,
  RepeatClockIcon,
  AddIcon,
  SearchIcon,
  CheckCircleIcon,
  WarningTwoIcon,
  TimeIcon,
  CopyIcon as ChakraCopyIcon,
} from "@chakra-ui/icons";
import { useProjectStore, ProjectState } from "@/store/projectStore";
import { useTaskStore, TaskState } from "@/store/taskStore";
import {
  Project,
  ProjectWithMeta,
  TaskWithMeta,
  Task,
  ProjectUpdateData,
} from "@/types";
import {
  /* Eye, */ Edit3,
  Trash2,
  /* PlusCircle, */ Archive as LucideArchive,
} from "lucide-react";
import { format, formatRelative } from "date-fns";
import CreateProjectModal from "./dashboard/CreateProjectModal";
import EditProjectModal from "./modals/EditProjectModal";
import { colorPrimitives } from "@/tokens/colors";
import AppIcon from "./common/AppIcon";
// import { NotificationContext } from '@/contexts/NotificationContext'; // Will be removed if unused later

const ArchiveIcon = (props: React.ComponentProps<typeof LucideArchive>) => (
  <LucideArchive {...props} />
);

const ProjectList: React.FC = () => {
  const projectsFromStore = useProjectStore((state: ProjectState) => state.projects);
  const loading = useProjectStore((state: ProjectState) => state.loading);
  const error = useProjectStore((state: ProjectState) => state.error);
  const fetchProjects = useProjectStore(
    (state: ProjectState) => state.fetchProjects,
  );
  const removeProject = useProjectStore(
    (state: ProjectState) => state.removeProject,
  );
  const archiveProject = useProjectStore(
    (state: ProjectState) => state.archiveProject,
  );
  const unarchiveProject = useProjectStore(
    (state: ProjectState) => state.unarchiveProject,
  );
  const editProject = useProjectStore(
    (state: ProjectState) => state.editProject,
  );
  const projectFilters = useProjectStore(
    (state: ProjectState) => state.filters,
  );
  const allTasksFromStore = useTaskStore((state: TaskState) => state.tasks);
  const toast = useToast();
  const [cliPromptModalOpen, setCliPromptModalOpen] = useState(false);
  const [cliPromptText, setCliPromptText] = useState("");
  const [cliPromptProjectName, setCliPromptProjectName] = useState("");
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);

  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onClose: onCreateModalClose,
  } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
  } = useDisclosure();
  const [editingProject, setEditingProject] = useState<ProjectWithMeta | null>(
    null,
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteInitiate = (project: Project) => {
    setProjectToDelete(project);
    onAlertOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await removeProject(projectToDelete.id);
      toast({
        title: projectToDelete.is_archived
          ? "Archived project permanently deleted"
          : "Project deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error deleting project",
        description: err instanceof Error ? err.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setProjectToDelete(null);
    onAlertClose();
  };

  const handleArchiveProject = async (projectId: string) => {
    try {
      await archiveProject(projectId);
      toast({
        title: "Project archived",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error archiving project",
        description: err instanceof Error ? err.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUnarchiveProject = async (projectId: string) => {
    try {
      await unarchiveProject(projectId);
      toast({
        title: "Project unarchived",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error unarchiving project",
        description: err instanceof Error ? err.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditProject = (project: ProjectWithMeta) => {
    setEditingProject(project);
    onEditModalOpen();
  };

  const handleProjectUpdatedInModal = async (
    updatedData: ProjectUpdateData,
  ) => {
    if (!editingProject) return;
    try {
      await editProject(editingProject.id, updatedData);
      toast({
        title: "Project details updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error updating project",
        description: err instanceof Error ? err.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw err;
    }
  };

  const handleProjectDeletedFromModal = async (projectId: string) => {
    try {
      await removeProject(projectId);
      toast({
        title: "Project deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error deleting project",
        description: err instanceof Error ? err.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      throw err;
    }
  };

  const handleCopyGetCommand = async (projectId: string) => {
    const command = `mcp project get --id ${projectId}`;
    try {
      await navigator.clipboard.writeText(command);
      toast({
        title: "Project 'get' command copied!",
        description: command,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to copy command",
        description: err instanceof Error ? err.message : String(err),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredProjects = useMemo(() => {
    if (!projectsFromStore) return [];
    return projectsFromStore.filter((project: Project) => {
      if (!project) return false;
      const totalTasks = project.task_count ?? 0;
      const completedTasks = project.completed_task_count ?? 0;
      const isProjectArchived = project.is_archived ?? false;

      if (projectFilters.search) {
        const searchTermLower = projectFilters.search.toLowerCase();
        const nameMatch = project.name?.toLowerCase().includes(searchTermLower);
        const descriptionMatch = project.description
          ?.toLowerCase()
          .includes(searchTermLower);
        if (!nameMatch && !descriptionMatch) return false;
      }

      if (projectFilters.agentId && allTasksFromStore) {
        const agentTasksInProject = allTasksFromStore.filter(
          (task: Task) =>
            task.project_id === project.id &&
            task.agent_id === projectFilters.agentId,
        );
        if (agentTasksInProject.length === 0) return false;
      }

      const filterStatus = projectFilters.status;
      const filterIsArchived = projectFilters.is_archived; // This comes from the store's ProjectFilters type

      // Handle the main status filter first (active, completed, all, archived)
      if (filterStatus && filterStatus !== "all") {
        if (filterStatus === "active") {
          if (
            isProjectArchived ||
            (totalTasks > 0 && completedTasks === totalTasks) ||
            totalTasks === 0
          )
            return false;
        }
        if (filterStatus === "completed") {
          if (
            isProjectArchived ||
            !(totalTasks > 0 && completedTasks === totalTasks)
          )
            return false;
        }
        // For 'active' or 'completed' statuses, the project must NOT be archived.
        if (filterStatus === "active" || filterStatus === "completed") {
          if (isProjectArchived) return false;
        }
      }

      // If filterStatus is 'all', then apply the is_archived toggle filter
      // If filterIsArchived is true, show only archived projects.
      // If filterIsArchived is false, show only non-archived projects.
      // If filterIsArchived is null/undefined (not explicitly set by user), show all based on other criteria.
      if (filterStatus === "all") {
        if (filterIsArchived === true && !isProjectArchived) return false;
        if (filterIsArchived === false && isProjectArchived) return false;
      }

      if (projectFilters.projectId && project.id !== projectFilters.projectId) {
        return false;
      }

      return true;
    });
  }, [projectsFromStore, projectFilters, allTasksFromStore]);

  const projectsToDisplay: ProjectWithMeta[] = useMemo(() => {
    if (!filteredProjects || !allTasksFromStore) return [];
    return filteredProjects.map((p: Project) => {
      const projectSpecificTasks = allTasksFromStore.filter(t => t.project_id === p.id);
      const calculatedCompletedCount = projectSpecificTasks.filter(t => t.status === "COMPLETED").length;
      const calculatedTotalCount = projectSpecificTasks.length;
      
      // Determine status and progress based on calculated counts
      let projectStatus: ProjectWithMeta['status'] = "not_started";
      if (calculatedTotalCount > 0) {
        if (calculatedCompletedCount === calculatedTotalCount) {
          projectStatus = "completed";
        } else {
          projectStatus = "in_progress";
        }
      }
      const projectProgress = calculatedTotalCount > 0 ? (calculatedCompletedCount / calculatedTotalCount) * 100 : 0;

      return {
        ...p, // Spread the original Project object
        tasks: projectSpecificTasks, // Attach the actual task objects
        taskCount: calculatedTotalCount, // Use calculated total (camelCase)
        completedTaskCount: calculatedCompletedCount, // Use calculated completed (camelCase)
        progress: projectProgress,
        status: projectStatus,
      };
    });
  }, [filteredProjects, allTasksFromStore]);

  const handleOpenCliPrompt = (project: ProjectWithMeta) => {
    const projectTasks: TaskWithMeta[] = (project.tasks || []).map(
      (task: Task) => ({
        ...task,
        completed: task.status === "COMPLETED",
      }),
    );
    const totalTasksInProject = projectTasks.length;
    const completedTasksInProject = projectTasks.filter(
      (task) => task.completed,
    ).length;
    const { fullText: projectStatusForPrompt } = getProjectStatusInfo(project);

    let prompt = `# MCP Project Review & Action Prompt
# Target Agent: @ProjectManager.mdc (or an appropriate coordinating agent)
# Goal: Review status, manage unassigned/pending tasks, and ensure progression for project '${project.name}'.

## Project Context
Project Name: ${project.name}
Project ID: ${project.id}
Description: ${project.description || "No description provided."}
Status: ${projectStatusForPrompt}
Total Tasks: ${totalTasksInProject}
Completed Tasks: ${completedTasksInProject}
Pending Tasks: ${totalTasksInProject - completedTasksInProject}
Created At: ${project.created_at ? formatRelative(new Date(project.created_at), new Date()) : "N/A"}
Last Activity: ${project.updated_at ? formatRelative(new Date(project.updated_at), new Date()) : "N/A"}

---
## Tasks Overview & Suggested Actions
`;

    if (projectTasks.length === 0) {
      prompt += "\nNo tasks currently associated with this project.\n";
      prompt +=
        "\nSuggested Action: Consider defining initial tasks using mcp_project-manager_create_task.";
      prompt += `\nExample: mcp_project-manager_create_task(project_id='${project.id}', title='New Initial Task', description='Define sub-goals and assign agents.')`;
    } else {
      projectTasks.forEach((task, idx) => {
        const agentDisplay = task.agent_name
          ? `@${task.agent_name}`
          : task.agent_id
            ? `AgentID: ${task.agent_id}`
            : "UNASSIGNED";
        const taskStatusDisplay = task.completed
          ? "Completed"
          : task.status || "To Do";
        prompt += `\n### Task ${idx + 1}: ${task.title} (ID: ${task.id})\n  Status: ${taskStatusDisplay}\n  Assigned Agent: ${agentDisplay}\n  Description: ${task.description || "No description."}\n`;
        if (!task.agent_id && !task.completed) {
          prompt += `  Suggested Action: Assign an agent. Example: mcp_project-manager_update_task_by_id(task_id='${task.id}', agent_name='TARGET_AGENT_NAME')\n`;
        } else if (!task.completed) {
          prompt += `  Suggested Action: Monitor progress. If blocked, investigate. Current agent: ${agentDisplay}.\n`;
        } else {
          prompt += `  Status: Completed. No immediate action required for this task through this prompt.\n`;
        }
      });
    }

    prompt += `
---
# General Actions for Project '${project.name}'
- If project is idle or pending start with no tasks, consider adding initial tasks.
- If project has unassigned tasks, assign them to relevant agents.
- If project is stuck or progress is slow, review task details and dependencies.
- If project requires external input or is blocked, note this and seek resolution.
- For completed tasks, ensure they are marked correctly.
- For completed projects, consider archiving if no further work is planned.
# End of Prompt.
`;

    setCliPromptText(prompt);
    setCliPromptProjectName(project.name);
    setCliPromptModalOpen(true);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(cliPromptText);
      toast({
        title: "Prompt copied to clipboard!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to copy prompt",
        description: err instanceof Error ? err.message : "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getProjectStatusInfo = (project: ProjectWithMeta) => {
    const totalTasks = project.taskCount ?? 0;
    const completedTasks = project.completedTaskCount ?? 0;
    let colorScheme = "gray";
    let icon: React.ElementType = TimeIcon;
    let fullText = "Pending Start";

    if (project.is_archived) {
      colorScheme = "purple";
      icon = ArchiveIcon;
      fullText = "Archived";
    } else if (project.status === "completed") {
      colorScheme = "green";
      icon = CheckCircleIcon;
      fullText = "Completed";
    } else if (project.status === "in_progress") {
      colorScheme = "blue";
      icon = RepeatClockIcon;
      fullText = "In Progress";
    } else if (totalTasks === 0) {
      colorScheme = "gray";
      icon = CheckCircleIcon;
      fullText = "Idle (No Tasks)";
    }
    return { colorScheme, icon, fullText };
  };

  const ProjectCard = ({ project }: { project: ProjectWithMeta }) => {
    const {
      colorScheme: statusColorScheme,
      icon: StatusIconComponent,
      fullText: statusFullText,
    } = getProjectStatusInfo(project);

    const displayTotalTasks = project.taskCount ?? 0;
    const displayCompletedTasks = project.completedTaskCount ?? 0;
    const displayProgress = project.progress ?? 0;

    const cardBaseStyles: BoxProps = {
      p: 4,
      borderRadius: "lg",
      borderWidth: "DEFAULT",
      borderStyle: "solid",
      boxShadow: "sm",
      transition: "all 0.2s ease-in-out",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    };

    const cardActiveStyles = {
      ...cardBaseStyles,
      bg: "bgSurface",
      borderColor: "borderDecorative",
      _hover: {
        boxShadow: "md",
        borderColor: "borderInteractive",
        transform: "translateY(-0.125rem)",
      },
    };

    const cardArchivedStyles = {
      ...cardBaseStyles,
      bg: "bgDisabled",
      borderColor: "borderDisabled",
      color: "textDisabled",
      _hover: {
        boxShadow: "sm",
        borderColor: "borderDisabled",
        transform: "translateY(0)",
      },
    };

    const currentCardStyles = project.is_archived
      ? cardArchivedStyles
      : cardActiveStyles;

    return (
      <Box
        {...currentCardStyles}
        role="group"
        data-testid={`project-card-${project.id}`}
      >
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
        <VStack
          spacing="3"
          align="stretch"
          flexGrow={1}
          opacity={project.is_archived ? 0.6 : 1}
        >
          <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Heading
              as="h3"
              size="md"
              color={project.is_archived ? "textDisabled" : "textStrong"}
              fontWeight="semibold"
              noOfLines={2}
              title={project.name}
              flexGrow={1}
              mr={2}
            >
              {project.name}
            </Heading>
            <Menu autoSelect={false}>
              <MenuButton
                as={IconButton}
                aria-label="Project options"
                icon={<HamburgerIcon />}
                variant="ghost"
                size="sm"
                color={project.is_archived ? "iconDisabled" : "iconSecondary"}
                _hover={{
                  bg: project.is_archived ? "transparent" : "interactiveNeutralHover",
                  color: project.is_archived ? "iconDisabled" : "iconAccent",
                }}
                isDisabled={project.is_archived && projectToDelete?.id === project.id}
                zIndex="docked"
              />
              <MenuList bg="bgPopover" borderColor="borderOverlay" zIndex="popover">
                <MenuItem
                  icon={<AppIcon icon={Edit3} size="1.1rem" color="currentColor" />}
                  onClick={() => handleEditProject(project)}
                  isDisabled={project.is_archived}
                  color="textSecondary"
                  _hover={{ bg: "interactiveNeutralHover", color: "textPrimary" }}
                >
                  Edit Details
                </MenuItem>
                <MenuItem
                  icon={<AppIcon icon={ChakraCopyIcon} size="1.1rem" color="currentColor" />}
                  onClick={() => handleCopyGetCommand(project.id)}
                  color="textSecondary"
                  _hover={{ bg: "interactiveNeutralHover", color: "textPrimary" }}
                >
                  Copy Get Command
                </MenuItem>
                <MenuItem
                  icon={<AppIcon icon={CopyIcon} size="1.1rem" color="currentColor" />}
                  onClick={() => handleOpenCliPrompt(project)}
                  color="textSecondary"
                  _hover={{ bg: "interactiveNeutralHover", color: "textPrimary" }}
                >
                  View Full CLI Prompt
                </MenuItem>
                {project.is_archived ? (
                  <MenuItem
                    icon={<RepeatClockIcon boxSize={4} />}
                    onClick={() => handleUnarchiveProject(project.id)}
                    color="textPrimary"
                  >
                    Unarchive Project
                  </MenuItem>
                ) : (
                  <MenuItem
                    icon={<AppIcon component={ArchiveIcon} boxSize={4} />}
                    onClick={() => handleArchiveProject(project.id)}
                    color="textPrimary"
                    _hover={{ bg: "bgInteractiveSubtleHover" }}
                  >
                    Archive Project
                  </MenuItem>
                )}
                <MenuItem
                  icon={
                    <AppIcon component={Trash2} boxSize={4} color="textError" />
                  }
                  onClick={() => handleDeleteInitiate(project)}
                  color="textError"
                  _hover={{
                    bg: colorPrimitives.red[50],
                    color: colorPrimitives.red[700],
                  }}
                >
                  Delete Project
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>

          {project.description ? (
            <Text
              fontSize="sm"
              color="textSecondary"
              fontWeight="normal"
              lineHeight="condensed"
              noOfLines={2}
              title={project.description}
            >
              {project.description}
            </Text>
          ) : (
            <Text
              fontSize="sm"
              color="textPlaceholder"
              fontStyle="italic"
              lineHeight="condensed"
              noOfLines={2}
            >
              No description provided.
            </Text>
          )}

          <Flex
            justifyContent="space-between"
            alignItems="center"
            mt="1"
            mb="1"
          >
            <Badge
              px="2.5"
              py="0.5"
              borderRadius="full"
              fontSize="xs"
              textTransform="capitalize"
              display="inline-flex"
              alignItems="center"
              variant="subtle"
              colorScheme={statusColorScheme}
            >
              <AppIcon component={StatusIconComponent} mr="1.5" boxSize={3} />
              {statusFullText}
            </Badge>
            <Text fontSize="sm" color="textSecondary" fontWeight="medium">
              {displayCompletedTasks}/{displayTotalTasks} Tasks
            </Text>
          </Flex>

          {(displayTotalTasks > 0 || project.is_archived) && (
            <Box
              w="full"
              bg={project.is_archived ? "transparent" : "borderDecorative"}
              borderRadius="full"
              h="1.5"
              overflow="hidden"
              mt={1}
            >
              <Box
                bg={
                  project.is_archived
                    ? "transparent"
                    : displayProgress === 100
                      ? colorPrimitives.green[500]
                      : "primary"
                }
                h="full"
                w={`${displayProgress}%`}
                borderRadius="full"
                transition="width 0.3s ease-in-out"
              />
            </Box>
          )}

          <Flex
            justifyContent="space-between"
            alignItems="center"
            mt="auto"
            pt="3"
          >
            <Text fontSize="xs" color="textSecondary">
              Created:{" "}
              {project.created_at
                ? format(new Date(project.created_at), "MMM d, yy")
                : "N/A"}
            </Text>
            <Text fontSize="xs" color="textSecondary">
              Updated:{" "}
              {project.updated_at
                ? formatRelative(new Date(project.updated_at), new Date())
                : "Never"}
            </Text>
          </Flex>
        </VStack>
      </Box>
    );
  };

  if (loading && (!projectsToDisplay || projectsToDisplay.length === 0)) {
    return (
      <Flex justify="center" align="center" p="10" minH="300px">
        <Spinner
          size="xl"
          color="primary"
          thickness="4px"
          speed="0.65s"
          emptyColor="borderDecorative"
        />
        <Text ml="4" fontSize="lg" color="textSecondary">
          Loading projects...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <VStack
        spacing="4"
        p={{ base: "6", md: "10" }}
        bg="statusErrorBg"
        borderRadius="lg"
        borderWidth="DEFAULT"
        borderColor="statusErrorBorder"
        alignItems="center"
        minH="300px"
        justifyContent="center"
      >
        <WarningTwoIcon boxSize="40px" color="textError" />
        <Heading size="md" color="textError" display="flex" alignItems="center">
          <WarningTwoIcon boxSize={5} mr={2} />
          An error occurred while fetching projects.
        </Heading>
        <Text color="textError" textAlign="center">
          {error}
        </Text>
        <Button
          variant="outline"
          leftIcon={<AppIcon name="repeatclock" boxSize={4} />}
          onClick={() => fetchProjects()}
          mt="2"
          borderColor="textError"
          color="textError"
          _hover={{ bg: colorPrimitives.red[50] }}
        >
          Retry
        </Button>
      </VStack>
    );
  }

  if (!projectsToDisplay || projectsToDisplay.length === 0) {
    return (
      <VStack
        spacing="3"
        p={{ base: "6", md: "10" }}
        textAlign="center"
        borderWidth="DEFAULT"
        borderStyle="dashed"
        borderColor="borderDecorative"
        borderRadius="lg"
        bg="bgCanvas"
        minH="300px"
        justifyContent="center"
      >
        <SearchIcon boxSize="32px" color="iconDefault" mb="1" />
        <Heading as="h3" size="md" color="textSecondary" fontWeight="medium" display="flex" alignItems="center">
          <SearchIcon boxSize={5} mr={2} />
          No Projects Found
        </Heading>
        <Text color="textSecondary" fontSize="base" maxW="md">
          {projectFilters.search ||
          (projectFilters.status && projectFilters.status !== "all") ||
          projectFilters.agentId
            ? "No projects match your current filters. Try adjusting them or create a new project."
            : "Get started by creating a new project."}
        </Text>
        <Button
          leftIcon={<AddIcon boxSize={4} />}
          onClick={onCreateModalOpen}
          mt="3"
          bg="bgInteractive"
          color="textInverse"
          fontWeight="medium"
          _hover={{ bg: "bgInteractiveHover" }}
          _active={{ bg: "bgInteractiveActive" }}
          px="6"
          size="lg"
        >
          Create New Project
        </Button>
      </VStack>
    );
  }

  return (
    <Box
      bg="bgCanvas"
      p={{ base: "2", md: "4" }}
      borderRadius={{ base: "none", md: "lg" }}
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb="4"
        px={{ base: "2", md: "0" }}
      >
        <Heading size={{ base: "lg", md: "xl" }} color="textPrimary" display="flex" alignItems="center">
          <AppIcon name="projects" boxSize={6} mr={2} />
          Projects{" "}
          <Text as="span" color="textSecondary" fontWeight="normal">
            ({projectsToDisplay.length})
          </Text>
        </Heading>
        <HStack spacing={{ base: "1", md: "2" }}>
          <Button
            leftIcon={<AddIcon boxSize={4} />}
            onClick={onCreateModalOpen}
            bg="bgInteractive"
            color="textInverse"
            fontWeight="medium"
            borderRadius="md"
            size={{ base: "sm", md: "md" }}
            _hover={{ bg: "bgInteractiveHover" }}
            _active={{ bg: "bgInteractiveActive" }}
          >
            New Project
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid
        columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
        spacing={{ base: "3", md: "4" }}
      >
        {projectsToDisplay.map((p: ProjectWithMeta) =>
          p ? <ProjectCard key={p.id} project={p} /> : null,
        )}
      </SimpleGrid>

      <Modal
        isOpen={cliPromptModalOpen}
        onClose={() => setCliPromptModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        isCentered
      >
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent
          bg="bgSurfaceElevated"
          color="textPrimary"
          borderRadius="lg"
          maxH="80vh"
        >
          <ModalHeader borderBottomWidth="1px" borderColor="borderDecorative" display="flex" alignItems="center">
            <AppIcon name="terminal" boxSize={5} mr={2} />
            CLI Prompt for: {cliPromptProjectName}
          </ModalHeader>
          <ModalCloseButton _focus={{ boxShadow: "outline" }} />
          <ModalBody p={6} overflowY="auto">
            <Textarea
              value={cliPromptText}
              isReadOnly
              rows={20}
              fontFamily="monospace"
              fontSize="sm"
              bg={colorPrimitives.gray[50]}
              color={colorPrimitives.gray[900]}
              borderColor="borderDecorative"
              _dark={{
                bg: colorPrimitives.gray[900],
                color: colorPrimitives.gray[100],
                borderColor: colorPrimitives.gray[700],
              }}
              borderRadius="md"
              p={4}
              whiteSpace="pre-wrap"
            />
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="borderDecorative">
            <Button
              variant="ghost"
              onClick={handleCopyPrompt}
              leftIcon={<CopyIcon boxSize={4} />}
              color="textLink"
              _hover={{ bg: "bgInteractiveSubtleHover" }}
            >
              Copy Prompt
            </Button>
            <Button
              bg="bgInteractive"
              color="textInverse"
              _hover={{ bg: "bgInteractiveHover" }}
              _active={{ bg: "bgInteractiveActive" }}
              ml={3}
              leftIcon={<AppIcon name="close" boxSize={4} />}
              onClick={() => setCliPromptModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(3px)">
          <AlertDialogContent
            bg="bgSurfaceElevated"
            color="textPrimary"
            borderRadius="lg"
          >
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              color="text.primary"
              display="flex"
              alignItems="center"
            >
              <AppIcon name="delete" boxSize={5} mr={2} />
              {projectToDelete?.is_archived
                ? "Delete Archived Project"
                : "Delete Project"}
            </AlertDialogHeader>
            <AlertDialogBody color="text.secondary">
              Are you sure you want to delete the project &quot;
              {projectToDelete?.name}&quot;?
              {projectToDelete?.is_archived
                ? " This action is permanent and cannot be undone."
                : " This will also delete all associated tasks. This action cannot be undone."}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onAlertClose}
                variant="outline"
                borderColor="borderInteractive"
                leftIcon={<AppIcon name="close" boxSize={4} />}
                _hover={{ bg: "bgInteractiveSubtleHover" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                ml={3}
                bg="error"
                color="onError"
                leftIcon={<AppIcon name="delete" boxSize={4} />}
                _hover={{ bg: colorPrimitives.red[600] }}
                _active={{ bg: colorPrimitives.red[700] }}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {isCreateModalOpen && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={onCreateModalClose}
        />
      )}
      {editingProject && isEditModalOpen && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            onEditModalClose();
            setEditingProject(null);
          }}
          project={editingProject}
          onProjectUpdated={handleProjectUpdatedInModal}
          onProjectDeleted={handleProjectDeletedFromModal}
        />
      )}
    </Box>
  );
};

export default ProjectList;
