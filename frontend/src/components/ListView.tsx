import React, { useState, useEffect, useMemo } from 'react';
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
    IconButton,
    useToast,
    List,
    ListItem,
    ModalFooter,
    useColorModeValue,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    useDisclosure,
    Text,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { useProjectStore } from '@/store/projectStore';
import { useAgentStore } from '@/store/agentStore';
import { useTaskStore } from '@/store/taskStore';
import EditTaskModal from './EditTaskModal';
import TaskItem from './TaskItem';
import TaskDetailsModal from './modals/TaskDetailsModal';

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
    const agents = useAgentStore((state) => state.agents);
    const deleteTaskFromStore = useTaskStore((state) => state.deleteTask);
    const editTaskInStore = useTaskStore((state) => state.editTask);
    const selectedTaskIds = useTaskStore((state) => state.selectedTaskIds);
    const toggleTaskSelection = useTaskStore((state) => state.toggleTaskSelection);
    const selectAllTasks = useTaskStore((state) => state.selectAllTasks);
    const deselectAllTasks = useTaskStore((state) => state.deselectAllTasks);
    const toast = useToast();
    const [editTask, setEditTask] = useState(null);
    const [assignAgentTask, setAssignAgentTask] = useState(null);
    const [agentLoading, setAgentLoading] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const cancelRef = React.useRef<HTMLButtonElement | null>(null);

    // Call useColorModeValue outside the loop
    const theadBg = useColorModeValue('gray.50', 'gray.800');

    const allTasksFlat = useMemo(() => {
        return groupedTasks.groups.flatMap(group => {
            if (group.tasks) return group.tasks;
            if (group.subgroups) return group.subgroups.flatMap(sub => sub.tasks);
            return [];
        });
    }, [groupedTasks]);

    const allVisibleTaskIds = useMemo(() => allTasksFlat.map(t => t.id), [allTasksFlat]);

    const handleSelectAllToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            selectAllTasks(allVisibleTaskIds);
        } else {
            deselectAllTasks();
        }
    };

    const areAllTasksSelected = useMemo(() => {
        if (allVisibleTaskIds.length === 0) return false;
        return allVisibleTaskIds.every(id => selectedTaskIds.includes(id));
    }, [selectedTaskIds, allVisibleTaskIds]);

    useEffect(() => {
        const initialExpansionState: Record<string, boolean> = {};
        groupedTasks.groups.forEach(group => {
            initialExpansionState[group.id] = true;
            if (group.subgroups) {
                group.subgroups.forEach(subgroup => {
                    initialExpansionState[`${group.id}-${subgroup.id}`] = true;
                });
            }
        });
        setExpandedGroups(initialExpansionState);
    }, [groupedTasks]);

    if (isLoading) {
        return (
            <Flex justify="center" align="center" minH="200px">
                <Spinner size="xl" />
            </Flex>
        );
    }
    
    const handleCopyPrompt = (task: Task) => {
        let agentName = task.agent_name;
        if ((!agentName || agentName === '—') && task.agent_id) {
            const agent = agents.find(a => a.id === task.agent_id);
            agentName = agent ? agent.name : undefined;
        }
        let prompt;
        if (!agentName || agentName === '—') {
            prompt = `No agent is currently assigned to this task. Please assign an agent, then execute the following:\n\n- **Task ID:** ${task.id}\n- **Task Name:** ${task.title}\n- **Project ID:** ${task.project_id}\n\nThis is an existing task in the project. Do not create a new one. Once assigned, the agent should work on this task, update its status as they progress, and mark it as finished when done.`;
            navigator.clipboard.writeText(prompt).then(() => {
                toast({ title: 'Prompt copied to clipboard! (No agent assigned)', status: 'info', duration: 2000, isClosable: true });
            }, () => {
                toast({ title: 'Failed to copy prompt.', status: 'error', duration: 2000, isClosable: true });
            });
            return;
        }
        prompt = `@${agentName}, please execute the assigned task:\n\n- **Task ID:** ${task.id}\n- **Task Name:** ${task.title}\n- **Project ID:** ${task.project_id}\n\nThis is an existing task in the project. Do not create a new one. Work on this task, update its status as you progress, and mark it as finished when done.`;
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
    const handleDeleteInitiateInListView = (task: Task) => {
        setTaskToDelete(task);
        onAlertOpen();
    };

    const handleDeleteConfirmInListView = async () => {
        if (!taskToDelete) return;
        try {
            await deleteTaskFromStore(taskToDelete.id);
            toast({ 
                title: taskToDelete.is_archived ? 'Archived task permanently deleted' : 'Task deleted', 
                status: 'success', 
                duration: 2000, 
                isClosable: true 
            });
        } catch (error) {
            toast({
                title: 'Error deleting task',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
        setTaskToDelete(null);
        onAlertClose();
    };

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    if (isMobile) {
        const flatTasksForMobile = groupedTasks.groups.reduce((acc: Task[], group) => {
            if (group.tasks) {
                acc.push(...group.tasks);
            } else if (group.subgroups) {
                group.subgroups.forEach(sub => acc.push(...sub.tasks));
            }
            return acc;
        }, [] as Task[]);

        return (
            <Box>
                <AnimatePresence initial={false}>
                    {flatTasksForMobile.map(task => (
                        <Flex key={task.id} alignItems="center" p={2} borderBottomWidth="1px" borderColor="border.base" bg={selectedTaskIds.includes(task.id) ? "brand.50" : "transparent"}>
                            <Checkbox 
                                isChecked={selectedTaskIds.includes(task.id)}
                                onChange={() => {
                                    console.log(`Mobile checkbox clicked for task ID: ${task.id}, current selected IDs:`, selectedTaskIds);
                                    toggleTaskSelection(task.id);
                                }}
                                mr={3}
                                colorScheme="blue"
                                aria-label={`Select task ${task.title}`}
                            />
                            <Box flex={1}>
                                <TaskItem
                                    task={task}
                                    onEdit={() => setEditTask(task as any)}
                                    onCopyPrompt={() => handleCopyPrompt(task)}
                                    onAssignAgent={() => handleAssignAgent(task as any)}
                                    onSelect={() => setSelectedTask(task as any)}
                                    isMobile={isMobile}
                                    onDeleteInitiate={handleDeleteInitiateInListView}
                                />
                            </Box>
                        </Flex>
                    ))}
                </AnimatePresence>
                {selectedTask && (
                    <TaskDetailsModal
                        isOpen={!!selectedTask}
                        onClose={() => setSelectedTask(null)}
                        taskId={selectedTask.id}
                    />
                )}
                {editTask && (
                    <EditTaskModal
                        isOpen={!!editTask}
                        onClose={() => setEditTask(null)}
                        task={editTask as Task}
                        onUpdate={async (id, data) => {
                            await editTaskInStore(id.toString(), data);
                            setEditTask(null);
                        }}
                        isMobile={isMobile}
                    />
                )}
                <Modal isOpen={!!assignAgentTask} onClose={() => setAssignAgentTask(null)} size={isMobile ? "full" : "md"} isCentered={!isMobile}>
                    <ModalOverlay />
                    <ModalContent bg="bg.modal">
                        <ModalHeader borderBottomWidth="1px" borderColor="border.base">Assign Agent</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {agentLoading ? (
                                <Spinner color="icon.primary" />
                            ) : (
                                <List spacing={2}>
                                    {agents.length === 0 && <ListItem>No agents available.</ListItem>}
                                    {agents.map(agent => (
                                        <ListItem key={agent.id}>
                                            <Button 
                                                w="100%" 
                                                onClick={() => handleAgentSelect(agent)} 
                                                variant="ghost" 
                                                justifyContent="flex-start"
                                                _hover={{bg: "interaction.hover"}}
                                            >
                                                {agent.name}
                                            </Button>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={() => setAssignAgentTask(null)} variant="outline">
                                Cancel
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                {taskToDelete && (
                    <AlertDialog
                        isOpen={isAlertOpen}
                        leastDestructiveRef={cancelRef}
                        onClose={onAlertClose}
                        isCentered
                    >
                        <AlertDialogOverlay>
                            <AlertDialogContent bg="bg.card" color="text.primary" borderWidth="1px" borderColor="border.secondary">
                                <AlertDialogHeader fontSize="lg" fontWeight="bold" borderBottomWidth="1px" borderColor="border.secondary">
                                    Delete Task
                                </AlertDialogHeader>

                                <AlertDialogBody py={6}>
                                    {taskToDelete.is_archived 
                                        ? "Are you sure you want to permanently delete this archived task? This action cannot be undone."
                                        : "Are you sure you want to delete this task?"
                                    }
                                </AlertDialogBody>

                                <AlertDialogFooter borderTopWidth="1px" borderColor="border.secondary">
                                    <Button ref={cancelRef} onClick={onAlertClose} variant="ghost" color="text.link" _hover={{ bg: "bg.hover.subtle" }}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        colorScheme="red" 
                                        onClick={handleDeleteConfirmInListView} 
                                        ml={3}
                                        bg="button.danger.default"
                                        color="button.danger.text"
                                        _hover={{ bg: "button.danger.hover" }}
                                    >
                                        Delete
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialogOverlay>
                    </AlertDialog>
                )}
            </Box>
        );
    }

    return (
        <Box>
            {groupedTasks.groups.map((group) => {
                const isGroupExpanded = expandedGroups[group.id] ?? true;
                const groupHeaderStyle: React.CSSProperties = {
                    p: 3,
                    borderRadius: "md",
                    cursor: "pointer",
                    mb: 2,
                    borderWidth: "1px",
                    borderColor: "border.subtle",
                    bg: "bg.subtle"
                };
                const groupTitleColor: string = "text.primary";

                if (groupedTasks.type === 'status' && group.status) {
                    // const colors = statusColors[group.status as TaskStatus] || { bg: 'gray.50', color: 'gray.700', borderColor: 'gray.300' }; // REMOVED
                    // Example of how it *could* be styled if needed, using group.status (which is StatusID)
                    // const { colorScheme } = statusUtils.getDisplayableStatus(group.status as statusUtils.StatusID);
                    // groupHeaderStyle = {
                    //     ...groupHeaderStyle,
                    //     bg: `${colorScheme}.50`, // Example, actual token might differ
                    //     borderLeftWidth: "4px",
                    //     borderLeftColor: `${colorScheme}.500`,
                    //     borderColor: `${colorScheme}.200`,
                    // };
                    // groupTitleColor = `${colorScheme}.800`;
                    // For now, default style is applied, specific status styling for group header removed
                }

                return (
                    <Box key={group.id} mb={group.subgroups ? 0 : 4}>
                        <Flex
                            alignItems="center"
                            {...groupHeaderStyle}
                            onClick={() => toggleGroup(group.id)}
                        >
                            <Text fontWeight="semibold" fontSize="md" color={groupTitleColor} flex="1">
                                {group.name}
                            </Text>
                            <IconButton
                                aria-label={isGroupExpanded ? "Collapse group" : "Expand group"}
                                icon={isGroupExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                variant="outline"
                                color="text.secondary"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); toggleGroup(group.id); }}
                            />
                        </Flex>

                        {isGroupExpanded && (
                            <Box pl={groupedTasks.type !== 'status' && group.subgroups ? 0 : 4} mt={2}>
                                <Flex 
                                    alignItems="center" 
                                    py={2} 
                                    px={1.5}
                                    borderBottomWidth="1px" 
                                    borderColor="border.divider" 
                                    mb={2} 
                                    bg={theadBg}
                                    boxShadow="sm"
                                    position="sticky" top={0} zIndex="docked"
                                >
                                    <Checkbox 
                                        isChecked={areAllTasksSelected}
                                        onChange={handleSelectAllToggle}
                                        isDisabled={allVisibleTaskIds.length === 0}
                                        colorScheme="blue"
                                        mr={3}
                                        w="20px"
                                        ml={1}
                                        aria-label="Select all tasks in current view"
                                    />
                                    <Text fontWeight="semibold" fontSize="sm" color="text.secondary" flex={1} mr={2}>
                                        Title / Details
                                    </Text>
                                    {groupedTasks.type !== 'status' && (
                                        <Text fontWeight="semibold" fontSize="sm" color="text.secondary" w="100px" textAlign="center">
                                            Status
                                        </Text>
                                    )}
                                    <Box w="180px" />
                                </Flex>

                                {group.tasks && group.tasks.length > 0 && (
                                    <List spacing={3}>
                                        <AnimatePresence initial={false}>
                                            {group.tasks.map(task => (
                                                <ListItem key={task.id} bg={selectedTaskIds.includes(task.id) ? "brand.50" : "transparent"} borderRadius="md">
                                                    <Flex alignItems="center" p={1.5}>
                                                        <Checkbox 
                                                            isChecked={selectedTaskIds.includes(task.id)}
                                                            onChange={() => {
                                                                console.log(`Desktop (group tasks) checkbox clicked for task ID: ${task.id}, current selected IDs:`, selectedTaskIds);
                                                                toggleTaskSelection(task.id);
                                                            }}
                                                            mr={3}
                                                            colorScheme="blue"
                                                            aria-label={`Select task ${task.title}`}
                                                        />
                                                        <Box flex={1}>
                                                            <TaskItem
                                                                task={task}
                                                                onEdit={() => setEditTask(task as any)}
                                                                onCopyPrompt={() => handleCopyPrompt(task)}
                                                                onAssignAgent={() => handleAssignAgent(task as any)}
                                                                onSelect={() => setSelectedTask(task as any)}
                                                                isMobile={isMobile}
                                                                onDeleteInitiate={handleDeleteInitiateInListView}
                                                            />
                                                        </Box>
                                                    </Flex>
                                                </ListItem>
                                            ))}
                                        </AnimatePresence>
                                    </List>
                                )}
                                {group.subgroups && group.subgroups.map(subgroup => {
                                    const isSubGroupExpanded = expandedGroups[`${group.id}-${subgroup.id}`] ?? true;
                                    const subGroupHeaderStyle: React.CSSProperties = {
                                        py: 2,
                                        px: 3,
                                        borderRadius: "sm",
                                        cursor: "pointer",
                                    };
                                    const subGroupTitleColor: string = "text.secondary";

                                    // Removed styling based on statusColors for subgroups as well
                                    // if (subgroup.status === 'Completed' && statusColors.Completed) { // REMOVED
                                    // }
                                    // else if (subgroup.status === 'active') { // REMOVED
                                    // }
                                    
                                    return (
                                        <Box key={subgroup.id} mt={2} pl={2} borderLeftWidth="2px" borderColor="border.divider">
                                            <Flex
                                                alignItems="center"
                                                {...subGroupHeaderStyle}
                                                onClick={() => toggleGroup(`${group.id}-${subgroup.id}`)}
                                            >
                                                <Text fontWeight="medium" fontSize="sm" color={subGroupTitleColor} flex="1">
                                                    {subgroup.name}
                                                </Text>
                                                <IconButton
                                                    aria-label={isSubGroupExpanded ? "Collapse subgroup" : "Expand subgroup"}
                                                    icon={isSubGroupExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                                    variant="outline"
                                                    color="text.secondary"
                                                    size="xs"
                                                    onClick={(e) => { e.stopPropagation(); toggleGroup(`${group.id}-${subgroup.id}`); }}
                                                />
                                            </Flex>
                                                    {isSubGroupExpanded && subgroup.tasks.length > 0 && (
                                                        <Box pl={4} pt={1} pb={2}>
                                                            <List spacing={3}>
                                                                <AnimatePresence initial={false}>
                                                                    {subgroup.tasks.map(task => (
                                                                        <ListItem key={task.id} bg={selectedTaskIds.includes(task.id) ? "brand.50" : "transparent"} borderRadius="md">
                                                                            <Flex alignItems="center" p={1.5}>
                                                                                <Checkbox 
                                                                                    isChecked={selectedTaskIds.includes(task.id)}
                                                                                    onChange={() => {
                                                                                        console.log(`Desktop (subgroup tasks) checkbox clicked for task ID: ${task.id}, current selected IDs:`, selectedTaskIds);
                                                                                        toggleTaskSelection(task.id);
                                                                                    }}
                                                                                    mr={3}
                                                                                    colorScheme="blue"
                                                                                    aria-label={`Select task ${task.title}`}
                                                                                />
                                                                                <Box flex={1}>
                                                                                    <TaskItem
                                                                                        task={task}
                                                                                        onEdit={() => setEditTask(task as any)}
                                                                                        onCopyPrompt={() => handleCopyPrompt(task)}
                                                                                        onAssignAgent={() => handleAssignAgent(task as any)}
                                                                                        onSelect={() => setSelectedTask(task as any)}
                                                                                        isMobile={isMobile}
                                                                                        onDeleteInitiate={handleDeleteInitiateInListView}
                                                                                    />
                                                                                </Box>
                                                                            </Flex>
                                                                        </ListItem>
                                                                    ))}
                                                                </AnimatePresence>
                                                            </List>
                                                        </Box>
                                                    )}
                                                    {isSubGroupExpanded && subgroup.tasks.length === 0 && (
                                                        <Text fontSize="sm" color="text.subtle" pl={4} py={2}>No tasks in this subgroup.</Text>
                                                    )}
                                        </Box>
                                    );
                                })}
                                {group.tasks && group.tasks.length === 0 && !group.subgroups && (
                                    <Text fontSize="sm" color="text.subtle" py={2}>No tasks in this group.</Text>
                                )}
                                 {group.subgroups && group.subgroups.every(sg => sg.tasks.length ===0) && !group.tasks && (
                                     <Text fontSize="sm" color="text.subtle" py={2}>No tasks in any subgroup.</Text>
                                 )}
                            </Box>
                        )}
                    </Box>
                );
            })}
            {selectedTask && (
                <TaskDetailsModal
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    taskId={selectedTask.id}
                />
            )}
            {editTask && (
                <EditTaskModal
                    isOpen={!!editTask}
                    onClose={() => setEditTask(null)}
                    task={editTask as Task}
                    onUpdate={async (id, data) => {
                        await editTaskInStore(id.toString(), data);
                        setEditTask(null);
                    }}
                    isMobile={isMobile}
                />
            )}
            <Modal isOpen={!!assignAgentTask} onClose={() => setAssignAgentTask(null)} size={isMobile ? "full" : "md"} isCentered={!isMobile}>
                <ModalOverlay />
                <ModalContent bg="bg.modal">
                    <ModalHeader borderBottomWidth="1px" borderColor="border.base">Assign Agent</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {agentLoading ? (
                            <Spinner color="icon.primary" />
                        ) : (
                            <List spacing={2}>
                                {agents.length === 0 && <ListItem>No agents available.</ListItem>}
                                {agents.map(agent => (
                                    <ListItem key={agent.id}>
                                        <Button 
                                            w="100%" 
                                            onClick={() => handleAgentSelect(agent)} 
                                            variant="ghost" 
                                            justifyContent="flex-start"
                                            _hover={{bg: "interaction.hover"}}
                                        >
                                            {agent.name}
                                        </Button>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => setAssignAgentTask(null)} variant="outline">
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ListView; 