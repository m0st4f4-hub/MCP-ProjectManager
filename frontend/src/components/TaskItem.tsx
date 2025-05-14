// D:\mcp\task-manager\frontend\src\components\TaskItem.tsx
'use client';

import React, { useCallback, useState, memo } from 'react';
import {
    Box,
    Checkbox,
    Text,
    IconButton,
    HStack,
    VStack,
    useDisclosure,
    Tag,
    TagLabel,
    TagLeftIcon,
    Flex,
    Icon,
    Avatar,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Tooltip,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    List,
    ListItem,
    Spinner,
    Collapse,
} from '@chakra-ui/react';
import { DeleteIcon, WarningIcon, CalendarIcon, ChevronDownIcon, CopyIcon, ChevronUpIcon, ViewIcon } from '@chakra-ui/icons';
import { BsPerson, BsPencil } from 'react-icons/bs';
import { GoProject } from "react-icons/go";
import { motion } from 'framer-motion';
import { Task } from '@/types'; // Removed Subtask as SubtaskType import
import EditTaskModal from './EditTaskModal'; // Ensure this path is correct
import TaskDetailsModal from './modals/TaskDetailsModal'; // Import TaskDetailsModal
import { useProjectStore } from '@/store/projectStore'; // <-- Import project store
import { useTaskStore } from '@/store/taskStore'; // <-- Import useTaskStore
// import SubtaskList from './SubtaskList'; // If you have a SubtaskList component
// import AddSubtaskForm from './AddSubtaskForm'; // If you have this form

// For MotionFlex
const MotionFlex = motion(Flex);


interface TaskItemProps {
    task: Task;
    compact?: boolean;
    style?: React.CSSProperties;
    // Remove callback props:
    // onToggle: (id: string, completed: boolean) => void;
    // onDelete: (id: string) => void;
    // onEdit: (task: Task) => void; 
}

// Renamed and updated to return token paths
const getStatusTokenProps = (status: string) => {
    switch (status) {
        case 'Completed':
            return { label: 'Completed', textColorToken: 'status.completed.text', bgToken: 'status.completed.bg' };
        case 'In Progress':
            return { label: 'In Progress', textColorToken: 'status.inProgress.text', bgToken: 'status.inProgress.bg' };
        case 'Blocked':
            return { label: 'Blocked', textColorToken: 'status.blocked.text', bgToken: 'status.blocked.bg' };
        default: // Assuming 'To Do' or other neutral statuses
            return { label: status || 'Unknown', textColorToken: 'status.todo.text', bgToken: 'status.todo.bg' };
    }
};

// Renamed and updated to return token paths
const getPriorityTokenProps = (priority: string) => {
    switch (priority) {
        case 'High':
            return { icon: WarningIcon, iconColorToken: 'priority.high.icon', label: 'High', textColorToken: 'priority.high.text', bgToken: 'priority.high.bg' };
        case 'Medium':
            return { icon: WarningIcon, iconColorToken: 'priority.medium.icon', label: 'Medium', textColorToken: 'priority.medium.text', bgToken: 'priority.medium.bg' };
        case 'Low':
            return { icon: WarningIcon, iconColorToken: 'priority.low.icon', label: 'Low', textColorToken: 'priority.low.text', bgToken: 'priority.low.bg' };
        default:
            return null;
    }
};

const TaskItem: React.FC<TaskItemProps> = memo(({
    task,
    compact = false,
    style,
    // onToggle, // Removed
    // onDelete, // Removed
    // onEdit, // Removed
}) => {
    const { isOpen: isEditTaskModalOpen, onOpen: onOpenEditTaskModal, onClose: onCloseEditTaskModal } = useDisclosure();
    const { isOpen: isDetailsModalOpen, onOpen: onOpenDetailsModal, onClose: onCloseDetailsModal } = useDisclosure(); // For TaskDetailsModal
    const projects = useProjectStore((state) => state.projects);
    const projectName = projects.find(p => p.id === task.project_id)?.name;

    // Get actions from taskStore
    const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete);
    const removeTask = useTaskStore((state) => state.removeTask);
    const editTaskInStore = useTaskStore((state) => state.editTask); // Renamed to avoid conflict with prop

    const agents = useTaskStore((state) => state.agents || []); // Use correct store for agents
    const [isAgentModalOpen, setAgentModalOpen] = useState(false);
    const [agentLoading, setAgentLoading] = useState(false);
    const toast = useToast();
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleToggleCompletion = useCallback(() => {
        toggleTaskComplete(task.id, !task.completed); // Call store action
    }, [task.id, task.completed, toggleTaskComplete]);

    const handleDeleteClick = useCallback(() => {
        removeTask(task.id); // Call store action
    }, [task.id, removeTask]);

    const taskBg = task.completed ? 'task.item.completed.bg' : 'task.item.bg';
    const textColorPrimary = task.completed ? 'text.disabled' : 'text.primary';
    const textColorSecondary = task.completed ? 'text.disabled' : 'text.secondary';
    const textDecoration = task.completed ? 'line-through' : 'none';

    const handleAssignAgent = useCallback(() => {
        setAgentModalOpen(true);
    }, []);
    const handleAgentSelect = async (agent) => {
        setAgentLoading(true);
        await editTaskInStore(task.id, { agent_id: agent.id, agent_name: agent.name });
        setAgentLoading(false);
        setAgentModalOpen(false);
        toast({ title: `Agent assigned: ${agent.name}`, status: 'success', duration: 2000, isClosable: true });
    };
    const handleStatusChange = async (status) => {
        await editTaskInStore(task.id, { status });
        toast({ title: `Status set to ${status}`, status: 'info', duration: 1500, isClosable: true });
    };
    const handlePriorityChange = async (priority) => {
        await editTaskInStore(task.id, { priority });
        toast({ title: `Priority set to ${priority}`, status: 'info', duration: 1500, isClosable: true });
    };

    const handleCopyPrompt = () => {
        let prompt;
        if (!task.agent_name) {
            prompt = `No agent is currently assigned to this task. Please assign an agent, then execute the following:

- **Task ID:** ${task.id}
- **Task Name:** ${task.title}
- **Project ID:** ${task.project_id}

This is an existing task in the project. Do not create a new one. Once assigned, the agent should work on this task, update its status as they progress, and mark it as finished when done.`;
            navigator.clipboard.writeText(prompt).then(() => {
                toast({ title: 'Prompt copied to clipboard! (No agent assigned)', status: 'info', duration: 2000, isClosable: true });
            }, () => {
                toast({ title: 'Failed to copy prompt.', status: 'error', duration: 2000, isClosable: true });
            });
            return;
        }
        prompt = `@${task.agent_name}, please execute the assigned task:

- **Task ID:** ${task.id}
- **Task Name:** ${task.title}
- **Project ID:** ${task.project_id}

This is an existing task in the project. Do not create a new one. Work on this task, update its status as you progress, and mark it as finished when done.`;
        navigator.clipboard.writeText(prompt).then(() => {
            toast({ title: 'Prompt copied to clipboard!', status: 'success', duration: 2000, isClosable: true });
        }, () => {
            toast({ title: 'Failed to copy prompt.', status: 'error', duration: 2000, isClosable: true });
        });
    };

    return (
        <>
            <Box position="relative" role="group" style={style}>
                <MotionFlex
                    align="center"
                    p={compact ? 2 : 4}
                    bg={taskBg}
                    borderRadius="lg"
                    boxShadow={compact ? 'xs' : 'sm'}
                    mb={compact ? 2 : 3}
                    borderWidth="1px"
                    borderColor="border.secondary"
                    borderLeftWidth="4px"
                    borderLeftColor={task.completed ? 'status.success' : 'border.accent'}
                    width="100%"
                    gap={compact ? 2 : 4}
                    minH={compact ? '48px' : 'auto'}
                    _hover={{ boxShadow: 'md', bg: compact ? 'taskItem.compact.hover.bg' : 'taskItem.default.hover.bg', transition: 'box-shadow 0.2s, background 0.2s' }}
                    transition="box-shadow 0.2s, background 0.2s"
                >
                    {/* Agent Avatar */}
                    <Avatar
                        name={task.agent_name || 'Unassigned'}
                        size={compact ? 'xs' : 'sm'}
                        cursor="pointer"
                        onClick={handleAssignAgent}
                        title={task.agent_name ? `Agent: ${task.agent_name}` : "Assign Agent"}
                    />

                    <VStack align="start" spacing={compact ? 0.5 : 1} flex="1" minW="0"> {/* Added minW="0" for flex truncation */}
                        <HStack w="100%" justifyContent="space-between">
                            <Tooltip label={task.title} placement="top-start" isDisabled={!compact}>
                                <Text
                                    fontWeight="medium"
                                    fontSize={compact ? 'sm' : 'md'}
                                    color={textColorPrimary}
                                    textDecoration={textDecoration}
                                    noOfLines={compact ? 1 : 2} // Truncate title in compact mode
                                    cursor="pointer"
                                    onClick={onOpenDetailsModal}
                                >
                                    {task.title}
                                </Text>
                            </Tooltip>
                            {!compact && (
                                <IconButton
                                    aria-label="Toggle details"
                                    icon={detailsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => setDetailsOpen(!detailsOpen)}
                                />
                            )}
                        </HStack>

                        {!compact && task.description && (
                            <Collapse in={detailsOpen} animateOpacity>
                                <Text fontSize="sm" color={textColorSecondary} noOfLines={3}>
                                {task.description}
                            </Text>
                            </Collapse>
                        )}
                        
                        {compact && projectName && (
                             <HStack spacing={1} align="center">
                                <Icon as={GoProject} color={textColorSecondary} boxSize="3" />
                                <Text fontSize="xs" color={textColorSecondary} noOfLines={1}>
                                    {projectName}
                                </Text>
                            </HStack>
                        )}


                        {!compact && (
                            <HStack spacing={3} wrap="wrap" mt={1}>
                                {projectName && (
                                    <Tag size="sm" variant="subtle" bg="tag.project.bg" color="tag.project.text">
                                        <TagLeftIcon boxSize="12px" as={GoProject} />
                                        <TagLabel>{projectName}</TagLabel>
                                    </Tag>
                                )}
                                {task.status && (() => {
                                    const statusTokens = getStatusTokenProps(task.status);
                                    return (
                                        <Tag size="sm" variant="subtle" bg={statusTokens.bgToken} color={statusTokens.textColorToken}>
                                            <TagLabel>{statusTokens.label}</TagLabel>
                                        </Tag>
                                    );
                                })()}
                                {task.priority && (() => {
                                    const priorityTokens = getPriorityTokenProps(task.priority);
                                    return priorityTokens ? (
                                        <Tag size="sm" variant="subtle" bg={priorityTokens.bgToken} color={priorityTokens.textColorToken}>
                                            <TagLeftIcon boxSize="12px" as={priorityTokens.icon} color={priorityTokens.iconColorToken} />
                                            <TagLabel>{priorityTokens.label}</TagLabel>
                                        </Tag>
                                    ) : null;
                                })()}
                                {task.due_date && (
                                    <Tag size="sm" variant="subtle" bg="tag.dueDate.bg" color="tag.dueDate.text">
                                        <TagLeftIcon boxSize="12px" as={CalendarIcon} />
                                        <TagLabel>{new Date(task.due_date).toLocaleDateString()}</TagLabel>
                                    </Tag>
                                )}
                            </HStack>
                        )}
                    </VStack>

                    {/* Actions Menu - kept similar for both modes but styled for compact */}
                    <Menu placement="bottom-end">
                        <MenuButton
                            as={IconButton}
                            icon={<ChevronDownIcon />}
                            size={compact ? "xs" : "sm"}
                            variant="ghost"
                            aria-label="Task actions"
                            color={textColorSecondary}
                        />
                        <MenuList>
                            <MenuItem icon={<BsPencil />} onClick={onOpenEditTaskModal}>Edit Task</MenuItem>
                            <MenuItem icon={<ViewIcon />} onClick={onOpenDetailsModal}>View Details</MenuItem>
                            <MenuItem icon={<BsPerson />} onClick={handleAssignAgent}>Assign Agent</MenuItem>
                            <Menu>
                                <MenuButton as={MenuItem}>
                                    <Flex justifyContent="space-between" w="100%">
                                        <span>Set Status</span>
                                        <Icon as={ChevronDownIcon} />
                                    </Flex>
                                </MenuButton>
                                <MenuList>
                                    {['To Do', 'In Progress', 'Blocked', 'Completed'].map(s => (
                                        <MenuItem key={s} onClick={() => handleStatusChange(s)}>{s}</MenuItem>
                                    ))}
                                </MenuList>
                            </Menu>
                            <Menu>
                                <MenuButton as={MenuItem}>
                                    <Flex justifyContent="space-between" w="100%">
                                        <span>Set Priority</span>
                                        <Icon as={ChevronDownIcon} />
                                    </Flex>
                                </MenuButton>
                                <MenuList>
                                    {['Low', 'Medium', 'High'].map(p => (
                                        <MenuItem key={p} onClick={() => handlePriorityChange(p)}>{p}</MenuItem>
                                    ))}
                                </MenuList>
                            </Menu>
                            <MenuItem icon={<CopyIcon />} onClick={handleCopyPrompt}>Copy CLI Prompt</MenuItem>
                            <MenuItem icon={<DeleteIcon />} color="actions.danger.text" onClick={handleDeleteClick}>Delete Task</MenuItem>
                        </MenuList>
                    </Menu>

                    {/* Conditionally render completion checkbox for non-compact view */}
                    {!compact && (
                        <Checkbox
                            isChecked={task.completed}
                            onChange={handleToggleCompletion}
                            colorScheme="brand"
                            size="lg"
                            aria-label="Complete task"
                        />
                    )}

                </MotionFlex>
                <Collapse in={detailsOpen} animateOpacity>
                    <Box
                        id={`task-details-${task.id}`}
                        bg="bg.surface"
                        borderRadius="md"
                        p={6}
                        mt={-2}
                        mb={3}
                        borderWidth="1px"
                        borderColor="border.primary"
                        boxShadow="md"
                        aria-live="polite"
                        _dark={{
                            bg: 'bg.surface',
                            borderColor: 'border.primary',
                            color: 'text.primary',
                        }}
                        _light={{
                            bg: 'bg.surface',
                            borderColor: 'border.primary',
                            color: 'text.primary',
                        }}
                    >
                        <Text fontWeight="bold" mb={2} color="text.heading">Description</Text>
                        <Text color="text.body">{task.description || 'No description provided.'}</Text>
                    </Box>
                </Collapse>
            </Box>

            {isEditTaskModalOpen && (
                <EditTaskModal
                    isOpen={isEditTaskModalOpen}
                    onClose={onCloseEditTaskModal}
                    task={task}
                    onUpdate={async (id, data) => { // id here is string from schema
                        await editTaskInStore(id.toString(), data); 
                    }}
                />
            )}

            {isDetailsModalOpen && (
                <TaskDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={onCloseDetailsModal}
                    taskId={task?.id ?? null} // Pass task.id (which is string)
                />
            )}

            {/* Agent Assignment Modal */}
            <Modal isOpen={isAgentModalOpen} onClose={() => setAgentModalOpen(false)} size="md" isCentered>
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
                        <Button onClick={() => setAgentModalOpen(false)}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem;

// Helper to get all descendant IDs (if you have nested subtasks and want to delete them all)
// This would be more relevant if subtasks were managed within TaskItem directly or if
// TaskStore needed this logic for deep optimistic deletes based on parent task ID.
// For now, assuming subtasks are handled elsewhere or not deeply nested for deletion via TaskItem.
// const getAllDescendantIds = (taskId: string, tasks: Task[]): string[] => {
//     const descendants: string[] = [];
//     const task = tasks.find(t => t.id === taskId);
//     if (task && task.subtasks) {
//         task.subtasks.forEach(sub => {
//             descendants.push(sub.id);
//             // If subtasks can also have subtasks, recurse:
//             // descendants.push(...getAllDescendantIds(sub.id, tasks)); // This requires subtasks to be in the main tasks array or a different structure
//         });
//     }
//     return descendants;
// };

