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
import { Task, getTaskById } from '@/services/api'; // Assuming getTaskById exists
import { useTaskStore } from '@/store/taskStore'; // To potentially get project/agent names if not in task detail
import { getDisplayableStatus, StatusID } from '@/lib/statusUtils'; // Added import
import { DeleteIcon, DownloadIcon, RepeatClockIcon } from '@chakra-ui/icons'; // Added icons

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: string | null; // Changed to string to match API and store id type
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
    const cancelRef = React.useRef();

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

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay backdropFilter="blur(2px)" />
            <ModalContent bg="bg.modal" color="text.primary" borderColor="border.base" borderWidth="1px">
                <ModalHeader borderBottomWidth="1px" borderColor="border.base" color="text.heading">
                    {task ? task.title : 'Task Details'}
                    {isLoading && <Spinner size="sm" ml={3} color="icon.primary" />}
                    {task?.is_archived && (
                        <Badge colorScheme="purple" variant="solid" ml={3} fontSize="0.8em">
                            Archived
                        </Badge>
                    )}
                </ModalHeader>
                <ModalCloseButton color="text.secondary" _hover={{ bg: "interaction.hover"}} />
                <ModalBody py={6}>
                    {error && (
                        <Box color="status.error" mb={4}>
                            Error: {error}
                        </Box>
                    )}
                    {isLoading && !task && !error && <Spinner color="icon.primary" />}
                    {!isLoading && !task && !error && <Text color="text.secondary">No task selected or details unavailable.</Text>}
                    
                    {task && (
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <Heading size="sm" mb={1} color="text.heading">Description</Heading>
                                <Text whiteSpace="pre-wrap" maxWidth="80ch" color="text.secondary">{task.description || 'No description provided.'}</Text>
                            </Box>
                            <Divider borderColor="border.divider" />
                            <HStack justifyContent="space-between">
                                <Box>
                                    <Heading size="xs" textTransform="uppercase" color="text.secondary">Status</Heading>
                                    {(() => {
                                        // Default to 'TO_DO' if task.status is null or undefined
                                        const statusId = (task.status || 'TO_DO') as StatusID;
                                        const { displayName, colorScheme, icon, dynamicValue } = getDisplayableStatus(statusId, task.title);
                                        return (
                                            <Tag
                                                size="md"
                                                borderRadius="md"
                                                colorScheme={colorScheme}
                                                variant="subtle" // Using subtle variant for consistency if desired
                                            >
                                                {icon && <TagLeftIcon as={icon} />}
                                                <Text>{dynamicValue ? `${displayName} (${dynamicValue})` : displayName}</Text>
                                            </Tag>
                                        );
                                    })()}
                                </Box>
                                <Box>
                                    <Heading size="xs" textTransform="uppercase" color="text.secondary">Project</Heading>
                                    <Text color="text.primary">{getProjectName(task.project_id)}</Text>
                                </Box>
                            </HStack>
                            <HStack justifyContent="space-between">
                                <Box>
                                    <Heading size="xs" textTransform="uppercase" color="text.secondary">Agent</Heading>
                                    <Text color="text.primary">{agent ? agent.name : (task?.agent_name || 'Unassigned')}</Text>
                                </Box>
                            </HStack>
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter borderTopWidth="1px" borderColor="border.base">
                    {task && !task.is_archived && (
                        <>
                            <Button leftIcon={<DownloadIcon />} colorScheme="blue" variant="outline" onClick={handleArchive} mr={3}>
                                Archive Task
                            </Button>
                            <Button leftIcon={<DeleteIcon />} colorScheme="red" variant="outline" onClick={handleDeleteInitiate} mr={3}>
                                Delete Task
                            </Button>
                        </>
                    )}
                    {task && task.is_archived && (
                        <>
                            <Button leftIcon={<RepeatClockIcon />} colorScheme="teal" variant="outline" onClick={handleUnarchive} mr={3}>
                                Unarchive Task
                            </Button>
                            <Button leftIcon={<DeleteIcon />} colorScheme="red" onClick={handleDeleteInitiate} mr={3}>
                                Delete Permanently
                            </Button>
                        </>
                    )}
                    <Button variant="ghost" onClick={onClose} color="text.link">Close</Button>
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
                        <AlertDialogContent bg="bg.modal" color="text.primary">
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                {task.is_archived ? 'Delete Archived Task' : 'Delete Task'}
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                {task.is_archived
                                    ? 'Are you sure you want to permanently delete this archived task? This action cannot be undone.'
                                    : 'Are you sure you want to delete this task?'}
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={onAlertClose} variant="ghost">
                                    Cancel
                                </Button>
                                <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
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