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
} from '@chakra-ui/react';
import { Task, getTaskById } from '@/services/api'; // Assuming getTaskById exists
import { useTaskStore } from '@/store/taskStore'; // To potentially get project/agent names if not in task detail

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
    
    // Placeholder for projects and agents if needed for display
    // const projects = useTaskStore((state) => state.projects);
    // const agents = useTaskStore((state) => state.agents);

    useEffect(() => {
        if (isOpen && taskId !== null) {
            const fetchTaskDetails = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    // TODO: This is a placeholder. The actual API call might be different.
                    // We need to ensure getTaskById or a similar function exists and is correctly typed.
                    // For now, we'll simulate fetching or assume the task object might be passed directly
                    // or fetched using a method similar to other parts of the application.
                    
                    // const fetchedTask = await getTaskById(taskId); // Example API call
                    // setTask(fetchedTask);
                    
                    // SIMULATED: In a real scenario, fetch from API or use a more robust store selector
                    const storeTask = useTaskStore.getState().tasks.find(t => t.id === taskId); // taskId is now string
                    if (storeTask) {
                        setTask(storeTask);
                    } else {
                        // setError('Task details not found in store, attempting fetch...');
                         // Attempt to fetch if not in store - this requires getTaskById to be implemented
                        try {
                            const fetchedTask = await getTaskById(taskId); // Call with string taskId
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
            // Reset state when modal is closed or taskId is null
            setTask(null);
            setIsLoading(false);
            setError(null);
        }
    }, [isOpen, taskId]);

    const getProjectName = (projectId: string | undefined | null) => { // projectId is string
        if (!projectId) return 'N/A';
        const project = useTaskStore.getState().projects.find(p => p.id === projectId);
        return project ? project.name : 'Unknown Project';
    };

    // Agent name is already on task object from the store/API, but if it were just an ID:
    // const getAgentDisplayName = (agentName: string | undefined | null) => {
    //     if (!agentName) return 'Unassigned';
    //     return agentName; // Or lookup in agents list if only ID was available
    // };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {task ? task.title : 'Task Details'}
                    {isLoading && <Spinner size="sm" ml={3} />}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {error && (
                        <Box color="red.500" mb={4}>
                            Error: {error}
                        </Box>
                    )}
                    {isLoading && !task && !error && <Spinner />}
                    {!isLoading && !task && !error && <Text>No task selected or details unavailable.</Text>}
                    
                    {task && (
                        <VStack spacing={4} align="stretch">
                            <Box>
                                <Heading size="sm" mb={1}>Description</Heading>
                                <Text whiteSpace="pre-wrap">{task.description || 'No description provided.'}</Text>
                            </Box>
                            <Divider />
                            <HStack justifyContent="space-between">
                                <Box>
                                    <Heading size="xs" textTransform="uppercase">Status</Heading>
                                    <Tag colorScheme={task.completed ? 'green' : 'yellow'}>
                                        {task.completed ? 'Completed' : 'Pending'}
                                    </Tag>
                                </Box>
                                <Box>
                                    <Heading size="xs" textTransform="uppercase">Project</Heading>
                                    <Text>{getProjectName(task.project_id)}</Text>
                                </Box>
                            </HStack>
                            <HStack justifyContent="space-between">
                                <Box>
                                    <Heading size="xs" textTransform="uppercase">Agent</Heading>
                                    <Text>{task.agent_name || 'Unassigned'}</Text>
                                </Box>
                                 <Box>
                                    <Heading size="xs" textTransform="uppercase">Due Date</Heading>
                                    {/* Due date is not available in the current Task type */}
                                    <Text fontStyle="italic">Not available</Text>
                                </Box>
                            </HStack>
                           
                            <Divider />
                             <Box>
                                <Heading size="sm" mb={2}>Comments</Heading>
                                {/* TODO: Implement Comments Section */}
                                <Text fontStyle="italic">Comments section to be implemented.</Text>
                                {/* This could be a list of comments, and an input to add a new comment */}
                            </Box>
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default TaskDetailsModal; 