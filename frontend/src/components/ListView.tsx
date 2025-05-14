import React, { useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    IconButton,
    HStack,
    Tooltip,
    useToast,
    List,
    ListItem,
    ModalFooter,
} from '@chakra-ui/react';
import { DeleteIcon, CopyIcon } from '@chakra-ui/icons';
import { BsPencil, BsPerson } from 'react-icons/bs';
import { Task } from '@/types';
import { useProjectStore } from '@/store/projectStore';
import { useAgentStore } from '@/store/agentStore';
import { useTaskStore } from '@/store/taskStore';
import EditTaskModal from './EditTaskModal';

type GroupByType = 'status' | 'project' | 'agent' | 'parent';

interface TaskGroup {
    id: string;
    name: string;
    tasks?: Task[];
    subgroups?: TaskSubgroup[];
    status?: string;
}

interface TaskSubgroup {
    id: string;
    name: string;
    tasks: Task[];
    status?: string;
}

interface GroupedTasks {
    type: GroupByType;
    groups: TaskGroup[];
}

interface ListViewProps {
    groupedTasks: GroupedTasks;
    isLoading: boolean;
    isMobile: boolean;
}

const ListView: React.FC<ListViewProps> = ({
    groupedTasks,
    isLoading,
    isMobile,
}) => {
    const projects = useProjectStore((state) => state.projects);
    const agents = useAgentStore((state) => state.agents);
    const removeTask = useTaskStore((state) => state.removeTask);
    const editTaskInStore = useTaskStore((state) => state.editTask);
    const toast = useToast();
    const [editTask, setEditTask] = useState(null);
    const [assignAgentTask, setAssignAgentTask] = useState(null);
    const [agentLoading, setAgentLoading] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null); // For mobile modal

    if (isLoading) {
        return (
            <Flex justify="center" align="center" minH="200px">
                <Spinner size="xl" />
            </Flex>
        );
    }
    
    const allTasks = groupedTasks.groups.flatMap(group => group.tasks ? group.tasks : []).map(task => {
        const project = projects.find(p => p.id === task.project_id);
        const agent = agents.find(a => a.id === task.agent_id);
        return {
            ...task,
            project_name: project ? project.name : '—',
            agent_name: agent ? agent.name : '—',
        };
    });

    const groupedByStatus = allTasks.reduce((acc, task) => {
        const status = task.status || 'To Do';
        if (!acc[status]) acc[status] = [];
        acc[status].push(task);
        return acc;
    }, {});

    const handleCopyPrompt = (task) => {
        let prompt;
        if (!task.agent_name || task.agent_name === '—') {
            prompt = `No agent is currently assigned to this task. Please assign an agent, then execute the following:\n\n- **Task ID:** ${task.id}\n- **Task Name:** ${task.title}\n- **Project ID:** ${task.project_id}\n\nThis is an existing task in the project. Do not create a new one. Once assigned, the agent should work on this task, update its status as they progress, and mark it as finished when done.`;
            navigator.clipboard.writeText(prompt).then(() => {
                toast({ title: 'Prompt copied to clipboard! (No agent assigned)', status: 'info', duration: 2000, isClosable: true });
            }, () => {
                toast({ title: 'Failed to copy prompt.', status: 'error', duration: 2000, isClosable: true });
            });
            return;
        }
        prompt = `@${task.agent_name}, please execute the assigned task:\n\n- **Task ID:** ${task.id}\n- **Task Name:** ${task.title}\n- **Project ID:** ${task.project_id}\n\nThis is an existing task in the project. Do not create a new one. Work on this task, update its status as you progress, and mark it as finished when done.`;
        navigator.clipboard.writeText(prompt).then(() => {
            toast({ title: 'Prompt copied to clipboard!', status: 'success', duration: 2000, isClosable: true });
        }, () => {
            toast({ title: 'Failed to copy prompt.', status: 'error', duration: 2000, isClosable: true });
        });
    };

    const handleAssignAgent = (task) => {
        setAssignAgentTask(task);
    };
    const handleAgentSelect = async (agent) => {
        if (!assignAgentTask) return;
        setAgentLoading(true);
        await editTaskInStore(assignAgentTask.id, { agent_id: agent.id, agent_name: agent.name });
        setAgentLoading(false);
        setAssignAgentTask(null);
        toast({ title: `Agent assigned: ${agent.name}`, status: 'success', duration: 2000, isClosable: true });
    };
    const handleDelete = async (task) => {
        await removeTask(task.id);
        toast({ title: 'Task deleted', status: 'success', duration: 2000, isClosable: true });
    };

    if (isMobile) {
        // Mobile: render as cards, open modal for details
        return (
            <Box>
                {allTasks.map(task => (
                    <Box key={task.id} mb={4} p={4} borderRadius="md" boxShadow="sm" bg="bg.surface" borderWidth="1px" borderColor="border.base" onClick={() => setSelectedTask(task)} cursor="pointer">
                        <Flex align="center" justify="space-between">
                            <Checkbox isChecked={task.completed} colorScheme="brand" mr={2} />
                            <Box flex="1">
                                <Text fontWeight="bold" color="text.primary">{task.title}</Text>
                                <Text fontSize="sm" color="text.secondary">{task.project_name}</Text>
                                <Text fontSize="sm" color="text.secondary">{task.agent_name}</Text>
                            </Box>
                            <HStack spacing={1}>
                                <Tooltip label="Edit Task"><IconButton
                                    aria-label="Edit Task"
                                    icon={<BsPencil />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="brand"
                                    onClick={e => { e.stopPropagation(); setEditTask(task); }}
                                /></Tooltip>
                                <Tooltip label="Delete Task"><IconButton
                                    aria-label="Delete Task"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={e => { e.stopPropagation(); handleDelete(task); }}
                                /></Tooltip>
                                <Tooltip label="Copy CLI Prompt"><IconButton
                                    aria-label="Copy CLI Prompt"
                                    icon={<CopyIcon />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="brand"
                                    onClick={e => { e.stopPropagation(); handleCopyPrompt(task); }}
                                /></Tooltip>
                                <Tooltip label="Assign Agent"><IconButton
                                    aria-label="Assign Agent"
                                    icon={<BsPerson />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="brand"
                                    onClick={e => { e.stopPropagation(); handleAssignAgent(task); }}
                                /></Tooltip>
                            </HStack>
                        </Flex>
                    </Box>
                ))}
                {/* Task Details Modal for mobile */}
                <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} size="md" isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Task Details</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {selectedTask && (
                                <Box>
                                    <Text fontWeight="bold" mb={2} color="text.heading">{selectedTask.title}</Text>
                                    <Text color="text.secondary" mb={2}>{selectedTask.description || 'No description provided.'}</Text>
                                    <Text fontSize="sm" color="text.secondary">Project: {selectedTask.project_name}</Text>
                                    <Text fontSize="sm" color="text.secondary">Agent: {selectedTask.agent_name}</Text>
                                </Box>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={() => setSelectedTask(null)}>Close</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                {/* Edit Task Modal and Assign Agent Modal remain unchanged */}
                {editTask && (
                    <EditTaskModal
                        isOpen={!!editTask}
                        onClose={() => setEditTask(null)}
                        task={editTask}
                        onUpdate={async (id, data) => {
                            await editTaskInStore(id.toString(), data);
                            setEditTask(null);
                        }}
                    />
                )}
                <Modal isOpen={!!assignAgentTask} onClose={() => setAssignAgentTask(null)} size="md" isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Assign Agent</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {agentLoading ? (
                                <Spinner />
                            ) : (
                                <List spacing={2}>
                                    {agents.length === 0 && <ListItem>No agents available.</ListItem>}
                                    {agents.map(agent => (
                                        <ListItem key={agent.id}>
                                            <Button w="100%" onClick={() => handleAgentSelect(agent)}>{agent.name}</Button>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={() => setAssignAgentTask(null)}>Cancel</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        );
    }

    // Desktop: grouped table view (unchanged)
    return (
        <Box>
            {Object.entries(groupedByStatus).map(([status, tasks]) => (
                <Box key={status} mb={8}>
                    <Box fontWeight="bold" fontSize="lg" mb={2} color="text.heading">{status}</Box>
                    <Table variant="simple" bg="bg.surface" borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor="border.base">
                        <Thead>
                            <Tr>
                                <Th color="text.secondary" fontWeight="semibold">Done</Th>
                                <Th color="text.secondary" fontWeight="semibold">Title</Th>
                                <Th color="text.secondary" fontWeight="semibold">Project</Th>
                                <Th color="text.secondary" fontWeight="semibold">Agent</Th>
                                <Th color="text.secondary" fontWeight="semibold">Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {tasks.map((task) => (
                                <Tr key={task.id} _hover={{ bg: 'interaction.hover' }}>
                                    <Td><Checkbox isChecked={task.completed} colorScheme="brand" /></Td>
                                    <Td><Text color="text.primary">{task.title}</Text></Td>
                                    <Td><Text color="text.secondary">{task.project_name}</Text></Td>
                                    <Td><Text color="text.secondary">{task.agent_name}</Text></Td>
                                    <Td>
                                        <HStack spacing={1}>
                                            <Tooltip label="Edit Task"><IconButton
                                                aria-label="Edit Task"
                                                icon={<BsPencil />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="brand"
                                                onClick={() => setEditTask(task)}
                                            /></Tooltip>
                                            <Tooltip label="Delete Task"><IconButton
                                                aria-label="Delete Task"
                                                icon={<DeleteIcon />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => handleDelete(task)}
                                            /></Tooltip>
                                            <Tooltip label="Copy CLI Prompt"><IconButton
                                                aria-label="Copy CLI Prompt"
                                                icon={<CopyIcon />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="brand"
                                                onClick={() => handleCopyPrompt(task)}
                                            /></Tooltip>
                                            <Tooltip label="Assign Agent"><IconButton
                                                aria-label="Assign Agent"
                                                icon={<BsPerson />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="brand"
                                                onClick={() => handleAssignAgent(task)}
                                            /></Tooltip>
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            ))}
            {/* Edit Task Modal and Assign Agent Modal remain unchanged */}
            {editTask && (
                <EditTaskModal
                    isOpen={!!editTask}
                    onClose={() => setEditTask(null)}
                    task={editTask}
                    onUpdate={async (id, data) => {
                        await editTaskInStore(id.toString(), data);
                        setEditTask(null);
                    }}
                />
            )}
            <Modal isOpen={!!assignAgentTask} onClose={() => setAssignAgentTask(null)} size="md" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Assign Agent</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {agentLoading ? (
                            <Spinner />
                        ) : (
                            <List spacing={2}>
                                {agents.length === 0 && <ListItem>No agents available.</ListItem>}
                                {agents.map(agent => (
                                    <ListItem key={agent.id}>
                                        <Button w="100%" onClick={() => handleAgentSelect(agent)}>{agent.name}</Button>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => setAssignAgentTask(null)}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ListView; 