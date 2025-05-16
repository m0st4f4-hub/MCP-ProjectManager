'use client';

import React, { useEffect, useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Text,
    VStack,
    HStack,
    Tag,
    Spinner,
    Box,
    Heading,
    Divider,
    TagLeftIcon,
    useToast,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    useDisclosure,
    Badge,
} from '@chakra-ui/react';
import { Task } from '@/types'; // Corrected import for Task
import { getTaskById } from '@/services/api'; // Assuming getTaskById exists
import { useTaskStore } from '@/store/taskStore'; // To potentially get project/agent names if not in task detail
import { getDisplayableStatus, StatusID } from '@/lib/statusUtils'; // Added import
import { DeleteIcon, DownloadIcon, RepeatClockIcon } from '@chakra-ui/icons'; // Added icons
import styles from './TaskDetailsModal.module.css';
import { clsx } from 'clsx';

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: string | null; // Changed number back to string
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
    isOpen,
    onClose,
    taskId,
}) => {
    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Move Zustand hooks to top level
    const projects = useTaskStore(state => state.projects);
    const tasks = useTaskStore(state => state.tasks);
    const agents = useTaskStore(state => state.agents);
    const archiveTaskStore = useTaskStore(state => state.archiveTask);
    const unarchiveTaskStore = useTaskStore(state => state.unarchiveTask);
    const deleteTaskStore = useTaskStore(state => state.deleteTask);
    const toast = useToast();

    const { 
        isOpen: isAlertOpen, 
        onOpen: onAlertOpen, 
        onClose: onAlertClose 
    } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (isOpen && taskId !== null) {
            const fetchTaskDetails = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    // Use tasks from top-level hook
                    const storeTask = tasks.find(t => t.id === taskId);
                    if (storeTask) {
                        setTask(storeTask);
                    } else {
                        try {
                            const fetchedTask = await getTaskById(taskId);
                            setTask(fetchedTask);
                        } catch (fetchError) {
                            console.error('Failed to fetch task by ID:', fetchError);
                            setError('Failed to load task details.');
                            setTask(null);
                        }
                    }
                } catch (e) {
                    console.error('Failed to load task details:', e);
                    const message = e instanceof Error ? e.message : 'Could not load task details.';
                    setError(message);
                    setTask(null);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTaskDetails();
        } else {
            setTask(null);
            setIsLoading(false);
            setError(null);
        }
    }, [isOpen, taskId, tasks]);

    const handleArchive = async () => {
        if (!task) return;
        try {
            await archiveTaskStore(task.id);
            toast({ title: 'Task archived', status: 'success', duration: 2000, isClosable: true });
            onClose(); // Close modal after action
        } catch (err) {
            toast({ title: 'Error archiving task', description: err instanceof Error ? err.message : String(err), status: 'error', duration: 3000, isClosable: true });
        }
    };

    const handleUnarchive = async () => {
        if (!task) return;
        try {
            await unarchiveTaskStore(task.id);
            toast({ title: 'Task unarchived', status: 'success', duration: 2000, isClosable: true });
            onClose(); // Close modal after action
        } catch (err) {
            toast({ title: 'Error unarchiving task', description: err instanceof Error ? err.message : String(err), status: 'error', duration: 3000, isClosable: true });
        }
    };

    const handleDeleteInitiate = () => {
        onAlertOpen();
    };

    const handleDeleteConfirm = async () => {
        if (!task) return;
        try {
            await deleteTaskStore(task.id);
            toast({ title: task.is_archived ? 'Archived task permanently deleted' : 'Task deleted', status: 'success', duration: 2000, isClosable: true });
            onAlertClose();
            onClose(); // Close main modal after delete
        } catch (err) {
            toast({ title: 'Error deleting task', description: err instanceof Error ? err.message : String(err), status: 'error', duration: 3000, isClosable: true });
        }
    };

    // Use projects from top-level hook
    const getProjectName = (projectId: string | undefined | null) => {
        if (!projectId) return 'N/A';
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : 'Unknown Project';
    };

    // Agent name is already on task object from the store/API, but if it were just an ID:
    // const getAgentDisplayName = (agentName: string | undefined | null) => {
    //     if (!agentName) return 'Unassigned';
    //     return agentName; // Or lookup in agents list if only ID was available
    // };

    const agent = agents.find(a => a.id === task?.agent_id);

    const getStatusTagClassName = (colorScheme?: string) => {
        switch (colorScheme) {
            case 'blue': return styles.statusTagBlue;
            case 'green': return styles.statusTagGreen;
            case 'yellow': return styles.statusTagYellow;
            case 'red': return styles.statusTagRed;
            case 'orange': return styles.statusTagOrange;
            case 'gray': return styles.statusTagGray;
            default: return styles.statusTagGray; // Default fallback
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay backdropFilter="blur(2px)" />
            <ModalContent className={styles.modalContent}>
                <ModalHeader className={styles.modalHeader}>
                    {task ? task.title : 'Task Details'}
                    {isLoading && <Spinner size="sm" className={styles.headerSpinner} />}
                    {task?.is_archived && (
                        <Badge colorScheme="purple" className={styles.archivedBadge}>Archived</Badge>
                    )}
                </ModalHeader>
                <ModalCloseButton className={styles.modalCloseButton} />
                <ModalBody className={styles.modalBody}>
                    {error && (
                        <Box className={styles.errorText}>
                            Error: {error}
                        </Box>
                    )}
                    {isLoading && !task && !error && <Spinner className={styles.bodySpinner} />}
                    {!isLoading && !task && !error && <Text className={styles.noTaskText}>No task selected or details unavailable.</Text>}
                    
                    {task && (
                        <VStack className={styles.detailsVStack}>
                            <Box>
                                <Heading size="sm" className={styles.sectionHeading}>Description</Heading>
                                <Text className={styles.descriptionText}>{task.description || 'No description provided.'}</Text>
                            </Box>
                            <Divider className={styles.divider} />
                            <HStack className={styles.detailsHStack}>
                                <Box>
                                    <Heading size="xs" className={styles.subSectionHeading}>Status</Heading>
                                    <Box className={styles.statusTagContainer}>
                                        {(() => {
                                            const statusId = (task.status || 'TO_DO') as StatusID;
                                            const statusInfo = getDisplayableStatus(statusId, task.title);
                                            if (!statusInfo) {
                                                return <Tag className={clsx(styles.statusTag, styles.statusTagGray)}>Unknown Status</Tag>;
                                            }
                                            const { displayName, colorScheme, icon, dynamicValue } = statusInfo;
                                            return (
                                                <Tag className={clsx(styles.statusTag, getStatusTagClassName(colorScheme))}>
                                                    {icon && typeof icon !== 'string' && <TagLeftIcon as={icon} />}
                                                    <Text>{dynamicValue ? `${displayName} (${dynamicValue})` : displayName}</Text>
                                                </Tag>
                                            );
                                        })()}
                                    </Box>
                                </Box>
                                <Box>
                                    <Heading size="xs" className={styles.subSectionHeading}>Project</Heading>
                                    <Text className={styles.detailText}>{getProjectName(task.project_id)}</Text>
                                </Box>
                            </HStack>
                            <HStack className={styles.detailsHStack}>
                                <Box>
                                    <Heading size="xs" className={styles.subSectionHeading}>Agent</Heading>
                                    <Text className={styles.detailText}>{agent ? agent.name : (task?.agent_name || 'Unassigned')}</Text>
                                </Box>
                            </HStack>
                            <Divider className={styles.divider} />
                            <Box>
                                <Heading size="xs" className={styles.subSectionHeading}>Timestamps</Heading>
                                <Text className={styles.detailText}>Created: {new Date(task.created_at).toLocaleString()}</Text>
                                <Text className={styles.detailText}>Updated: {task.updated_at ? new Date(task.updated_at).toLocaleString() : 'N/A'}</Text>
                            </Box>
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter className={styles.modalFooter}>
                    {task && !task.is_archived && (
                        <>
                            <Button 
                                leftIcon={<DownloadIcon />} 
                                onClick={handleArchive} 
                                className={clsx(styles.footerButton, styles.footerButtonOutline, styles.buttonBlueOutline)}
                            >
                                Archive Task
                            </Button>
                            <Button 
                                leftIcon={<DeleteIcon />} 
                                onClick={handleDeleteInitiate} 
                                className={clsx(styles.footerButton, styles.footerButtonOutline, styles.buttonRedOutline)}
                            >
                                Delete Task
                            </Button>
                        </>
                    )}
                    {task && task.is_archived && (
                        <>
                            <Button 
                                leftIcon={<RepeatClockIcon />} 
                                onClick={handleUnarchive} 
                                className={clsx(styles.footerButton, styles.footerButtonOutline, styles.buttonTealOutline)}
                            >
                                Unarchive Task
                            </Button>
                            <Button 
                                leftIcon={<DeleteIcon />} 
                                onClick={handleDeleteInitiate} 
                                className={clsx(styles.footerButton, styles.buttonRed)} // Solid red button
                            >
                                Delete Permanently
                            </Button>
                        </>
                    )}
                    <Button onClick={onClose} className={clsx(styles.footerButton, styles.footerButtonGhost, styles.buttonGrayGhost)} >Close</Button>
                </ModalFooter>
            </ModalContent>
            {task && (
                <AlertDialog
                    isOpen={isAlertOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={onAlertClose}
                    isCentered
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent className={styles.modalContent}>
                            <AlertDialogHeader className={styles.modalHeader}>
                                Delete Task
                            </AlertDialogHeader>
                            <AlertDialogBody className={styles.modalBody}>
                                Are you sure you want to permanently delete task &quot;{task.title}&quot;? 
                                This action cannot be undone.
                            </AlertDialogBody>
                            <AlertDialogFooter className={styles.modalFooter}>
                                <Button ref={cancelRef} onClick={onAlertClose} className={clsx(styles.footerButton, styles.footerButtonGhost, styles.buttonGrayGhost)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleDeleteConfirm} className={clsx(styles.footerButton, styles.buttonRed)} ml={3}>
                                    Delete
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            )}
        </Modal>
    );
};

export default TaskDetailsModal; 