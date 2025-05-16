'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
    Progress,
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
} from '@chakra-ui/react';
import { DeleteIcon, HamburgerIcon, CopyIcon, DownloadIcon, RepeatClockIcon, AddIcon, SearchIcon, CheckCircleIcon, WarningTwoIcon, TimeIcon, EditIcon, TriangleDownIcon, ExternalLinkIcon, SunIcon } from '@chakra-ui/icons';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { Project, ProjectWithTasks, TaskWithMeta } from '@/types';
import { formatDisplayName } from '@/lib/utils';
import styles from './ProjectList.module.css';
import clsx from 'clsx';
import { setCurrentProject } from '@/store/projectSlice';
import { Eye, Edit3, Trash2, PlusCircle } from 'lucide-react';
import ConfirmationModal from './modals/ConfirmationModal';
import { format, formatRelative } from 'date-fns';
import CreateProjectModal from './dashboard/CreateProjectModal';
import EditProjectModal from './modals/EditProjectModal';
import { NotificationContext } from '@/contexts/NotificationContext';
import Notification from './common/Notification';

const ProjectList: React.FC = () => {
    const projects = useProjectStore(state => state.projects);
    const loading = useProjectStore(state => state.loading);
    const error = useProjectStore(state => state.error);
    const fetchProjects = useProjectStore(state => state.fetchProjects);
    const removeProject = useProjectStore(state => state.removeProject);
    const archiveProject = useProjectStore(state => state.archiveProject);
    const unarchiveProject = useProjectStore(state => state.unarchiveProject);
    const projectFilters = useProjectStore(state => state.filters);
    const tasks = useTaskStore(state => state.tasks);
    const toast = useToast();
    const [cliPromptModalOpen, setCliPromptModalOpen] = useState(false);
    const [cliPromptText, setCliPromptText] = useState('');
    const [cliPromptProjectName, setCliPromptProjectName] = useState('');
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const cancelRef = React.useRef<HTMLButtonElement | null>(null);

    const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
    const [editingProject, setEditingProject] = useState<ProjectWithTasks | null>(null);

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
                title: projectToDelete.is_archived ? 'Archived project permanently deleted' : 'Project deleted',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error deleting project',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
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
                title: 'Project archived',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error archiving project',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleUnarchiveProject = async (projectId: string) => {
        try {
            await unarchiveProject(projectId);
            toast({
                title: 'Project unarchived',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error unarchiving project',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleEditProject = (project: ProjectWithTasks) => {
        setEditingProject(project);
        onEditModalOpen();
    };

    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        return projects.filter(project => {
            if (!project) return false;
            const totalTasks = project.task_count ?? 0;
            const completedTasks = project.completed_task_count ?? 0;

            if (projectFilters.search) {
                const searchTermLower = projectFilters.search.toLowerCase();
                const nameMatch = project.name?.toLowerCase().includes(searchTermLower);
                const descriptionMatch = project.description?.toLowerCase().includes(searchTermLower);
                if (!nameMatch && !descriptionMatch) return false;
            }

            if (projectFilters.agentId && tasks) {
                const agentTasksInProject = tasks.filter(task =>
                    task.project_id === project.id && task.agent_id === projectFilters.agentId
                );
                if (agentTasksInProject.length === 0) return false;
            }
            
            if (projectFilters.status && projectFilters.status !== 'all') {
                if (project.is_archived && projectFilters.status !== 'archived') return false;
                if (!project.is_archived && projectFilters.status === 'archived') return false;

                if (projectFilters.status === 'active') {
                    if (project.is_archived || (totalTasks > 0 && completedTasks === totalTasks) || totalTasks === 0) return false;
                }
                if (projectFilters.status === 'completed') {
                    if (project.is_archived || !(totalTasks > 0 && completedTasks === totalTasks)) return false;
                }
                if (projectFilters.status === 'pending') {
                    if (project.is_archived || totalTasks > 0) return false;
                }

            } else if (projectFilters.status === 'all' && project.is_archived) {
                return false;
            }

            if (projectFilters.projectId && project.id !== projectFilters.projectId) {
                return false;
            }

            return true;
        });
    }, [projects, projectFilters, tasks]);

    const handleOpenCliPrompt = (project: ProjectWithTasks) => {
        const projectTasks: TaskWithMeta[] = (project.tasks || [])
            .map(task => ({
                ...task,
                completed: task.status === 'COMPLETED',
            }));
        const totalTasksInProject = projectTasks.length;
        const completedTasksInProject = projectTasks.filter(task => task.completed).length;
        const isInProgress = totalTasksInProject > 0 && completedTasksInProject < totalTasksInProject;
        const isCompleted = totalTasksInProject > 0 && completedTasksInProject === totalTasksInProject;
        const projectStatus = project.is_archived ? 'Archived' : (isCompleted ? 'Completed' : (isInProgress ? 'In Progress' : (totalTasksInProject > 0 ? 'Pending Start' : 'Idle (No Tasks)')));

        let prompt = `# MCP Project Review & Action Prompt
# Target Agent: @ProjectManager.mdc (or an appropriate coordinating agent)
# Goal: Review status, manage unassigned/pending tasks, and ensure progression for project '${project.name}'.

## Project Context
Project Name: ${project.name}
Project ID: ${project.id}
Description: ${project.description || 'No description provided.'}
Status: ${projectStatus}
Total Tasks: ${totalTasksInProject}
Completed Tasks: ${completedTasksInProject}
Pending Tasks: ${totalTasksInProject - completedTasksInProject}
Created At: ${project.created_at ? formatRelative(new Date(project.created_at), new Date()) : 'N/A'}
Last Activity: ${project.updated_at ? formatRelative(new Date(project.updated_at), new Date()) : 'N/A'}

---
## Tasks Overview & Suggested Actions
`;

        if (projectTasks.length === 0) {
            prompt += '\nNo tasks currently associated with this project.\n';
            prompt += "\nSuggested Action: Consider defining initial tasks using mcp_project-manager_create_task."
            prompt += `\nExample: mcp_project-manager_create_task(project_id='${project.id}', title='New Initial Task', description='Define sub-goals and assign agents.')`;
        } else {
            projectTasks.forEach((task, idx) => {
                const agentDisplay = task.agent_name ? `@${task.agent_name}` : (task.agent_id ? `AgentID: ${task.agent_id}` : 'UNASSIGNED');
                const taskStatus = task.completed ? 'Completed' : (task.status || 'To Do');
                prompt += `\n### Task ${idx + 1}: ${task.title} (ID: ${task.id})\n  Status: ${taskStatus}\n  Assigned Agent: ${agentDisplay}\n  Description: ${task.description || 'No description.'}\n`;
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
## General MCP Commands for Project Management:
- List all tasks for this project: mcp_project-manager_get_tasks(project_id='${project.id}')
- Get specific task details: mcp_project-manager_get_task_by_id(task_id='TASK_ID_HERE')
- Update a task (e.g., assign agent, change status): mcp_project-manager_update_task_by_id(task_id='TASK_ID_HERE', ...)
- Create a new task for this project: mcp_project-manager_create_task(project_id='${project.id}', title='...', ...)

# Note: Replace TARGET_AGENT_NAME and TASK_ID_HERE with actual values.
# This prompt is intended for review and to guide manual MCP command execution or further agent tasking.
`;
        setCliPromptText(prompt);
        setCliPromptProjectName(project.name);
        setCliPromptModalOpen(true);
    };

    const handleCopyPrompt = async () => {
        if (cliPromptText) {
            try {
                await navigator.clipboard.writeText(cliPromptText);
                toast({ title: 'Prompt copied to clipboard!', status: 'success', duration: 2000, isClosable: true });
            } catch {
                toast({ title: 'Failed to copy prompt.', status: 'error', duration: 2000, isClosable: true });
            }
        }
    };

    const getProjectStatusInfo = (project: ProjectWithTasks) => {
        if (project.is_archived) return { label: 'Archived', colorScheme: 'gray', icon: <ArchiveIcon /> };
        if (project.task_count === 0) return { label: 'Pending', colorScheme: 'blue', icon: <TimeIcon /> };
        if (project.completed_task_count === project.task_count) return { label: 'Completed', colorScheme: 'green', icon: <CheckCircleIcon /> };
        return { label: 'In Progress', colorScheme: 'yellow', icon: <RepeatClockIcon /> };
    };

    if (loading && !projects.length) {
        return (
            <div className={styles.loadingContainer}>
                <Spinner size="xl" />
                <p>Loading Projects...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <WarningTwoIcon className={styles.errorIcon} />
                <p className={styles.errorText}>Error loading projects: {error}</p>
                <button onClick={() => fetchProjects()} className={styles.retryButton}>
                    Try Again
                </button>
            </div>
        );
    }
    
    const ProjectCard = ({ project }: { project: ProjectWithTasks }) => {
        const totalTasks = project.task_count ?? 0;
        const completedTasks = project.completed_task_count ?? 0;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        const statusInfo = getProjectStatusInfo(project);

        return (
            <li className={clsx(styles.projectCard, project.is_archived && styles.archivedCard)}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{project.name}</h3>
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<HamburgerIcon />}
                            variant="ghost"
                            size="sm"
                        />
                        <MenuList>
                            <MenuItem icon={<EditIcon />} onClick={() => handleEditProject(project)}>
                                Edit Project
                            </MenuItem>
                            <MenuItem icon={<DownloadIcon />} onClick={() => handleOpenCliPrompt(project)}>
                                View CLI Prompt
                            </MenuItem>
                            {!project.is_archived ? (
                                <MenuItem icon={<SunIcon />} onClick={() => handleArchiveProject(project.id)}>
                                    Archive Project
                                </MenuItem>
                            ) : (
                                <MenuItem icon={<RepeatClockIcon />} onClick={() => handleUnarchiveProject(project.id)}>
                                    Unarchive Project
                                </MenuItem>
                            )}
                            <MenuItem icon={<DeleteIcon />} onClick={() => handleDeleteInitiate(project)} color="red.500">
                                Delete Project
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </div>

                {project.description && <p className={styles.cardDescription}>{project.description}</p>}
                
                <div className={styles.cardStatusSection}>
                     <span className={clsx(styles.statusTag, styles[`statusTag${statusInfo.label.replace(/\s+/g, '').replace(/\s+/g, '')}`])}>
                        {statusInfo.icon}
                        {statusInfo.label}
                    </span>
                    <span className={styles.cardTasksCount}>
                        {completedTasks}/{totalTasks} tasks
                    </span>
                </div>

                <Progress value={progress} size="sm" className={styles.cardProgressBar} colorScheme={statusInfo.colorScheme} />
                
                <div className={styles.cardFooter}>
                    <p className={styles.cardDate}>
                        Created: {project.created_at ? formatRelative(new Date(project.created_at), new Date()) : 'N/A'}
                    </p>
                    {project.updated_at && project.updated_at !== project.created_at && (
                         <p className={clsx(styles.cardDate, styles.cardDateUpdated)}>
                            Updated: {formatRelative(new Date(project.updated_at), new Date())}
                        </p>
                    )}
                </div>
                 {project.is_archived && <div className={styles.archivedOverlay}>Archived</div>}
            </li>
        );
    };

    return (
        <div className={styles.projectListContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Projects ({filteredProjects.length})</h2>
            </div>

            {filteredProjects.length === 0 && !loading && (
                <div className={styles.emptyStateContainer}>
                    <SearchIcon className={styles.emptyStateIcon} />
                    <p className={styles.emptyStateText}>No projects found.</p>
                    <p className={styles.emptyStateSubText}>
                        {projectFilters.search || projectFilters.status !== 'all' || projectFilters.agentId ? 
                         "Try adjusting your filters or create a new project using the sidebar button." : "Create a new project using the sidebar button to get started."}
                    </p>
                </div>
            )}

            <ul className={styles.projectGrid}>
                {filteredProjects.map(project => (
                    project && <ProjectCard key={project.id} project={project as ProjectWithTasks} />
                ))}
            </ul>

            <Modal isOpen={cliPromptModalOpen} onClose={() => setCliPromptModalOpen(false)} size="xl">
                <ModalOverlay />
                <ModalContent bg="bg.modal" color="text.primary">
                    <ModalHeader>CLI Prompt for {cliPromptProjectName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Textarea
                            value={cliPromptText}
                            isReadOnly
                            rows={15}
                            fontFamily="monospace"
                            fontSize="sm"
                            bg="bg.textarea"
                            borderColor="border.input"
                            _hover={{ borderColor: "border.inputHover" }}
                            className={styles.cliPromptTextarea}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" onClick={handleCopyPrompt} leftIcon={<CopyIcon />}>
                            Copy Prompt
                        </Button>
                        <Button colorScheme="blue" ml={3} onClick={() => setCliPromptModalOpen(false)}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <AlertDialog
                isOpen={isAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onAlertClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg="bg.modal" color="text.primary">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Project
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete project '{projectToDelete?.name}'?
                            {projectToDelete?.is_archived ? " This is an archived project." : " This action cannot be undone."}
                            {(projectToDelete?.task_count ?? 0) > 0 && ` It has ${projectToDelete?.task_count} associated task(s).`}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onAlertClose} variant="outline">
                                Cancel
                            </Button>
                            <Button 
                                colorScheme="red" 
                                onClick={handleDeleteConfirm} 
                                ml={3}
                                bg="button.danger.default"
                                _hover={{bg: "button.danger.hover"}}
                                _active={{bg: "button.danger.active"}}
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
                    projectData={editingProject}
                 />
            )}
        </div>
    );
};

export default ProjectList; 