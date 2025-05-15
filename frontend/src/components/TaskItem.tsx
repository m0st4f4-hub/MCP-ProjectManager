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
    Input,
    Textarea,
    useToken,
    Icon as ChakraIcon,
    Badge,
} from '@chakra-ui/react';
import { DeleteIcon, WarningIcon, CalendarIcon, ChevronDownIcon, CopyIcon, ChevronUpIcon, ViewIcon, EditIcon, HamburgerIcon, CheckIcon, CloseIcon, DownloadIcon, RepeatClockIcon } from '@chakra-ui/icons';
import { BsPerson, BsPencil } from 'react-icons/bs';
import { GoProject } from "react-icons/go";
import { motion } from 'framer-motion';
import { Task } from '@/types'; // Removed Subtask as SubtaskType import
import EditTaskModal from './EditTaskModal'; // Ensure this path is correct
import TaskDetailsModal from './modals/TaskDetailsModal'; // Import TaskDetailsModal
import { useProjectStore } from '@/store/projectStore'; // <-- Import project store
// import { useTaskStore } from '@/store/taskStore'; // <-- Import useTaskStore // Remove toggleTaskComplete
import { useTaskStore } from '@/store/taskStore';
import { getDisplayableStatus, StatusID, getAllStatusIds, getStatusAttributes } from '@/lib/statusUtils'; // Added getAllStatusIds and getStatusAttributes

// For MotionFlex
const MotionFlex = motion(Flex);


interface TaskItemProps {
    task: Task;
    compact?: boolean;
    style?: React.CSSProperties;
    onDeleteInitiate: (task: Task) => void;
    // Remove callback props:
    // onToggle: (id: string, completed: boolean) => void;
    // onDelete: (id: string) => void;
    // onEdit: (task: Task) => void; 
}

// Renamed and updated to return token paths
// const getStatusTokenProps = (status: string) => {  // REMOVE THIS FUNCTION
//     switch (status) {
//         case 'Completed':
//             return { label: 'Completed', textColorToken: 'status.completed.text', bgToken: 'status.completed.bg' };
//         case 'In Progress':
//             return { label: 'In Progress', textColorToken: 'status.inProgress.text', bgToken: 'status.inProgress.bg' };
//         case 'Blocked':
//             return { label: 'Blocked', textColorToken: 'status.blocked.text', bgToken: 'status.blocked.bg' };
//         default: // Assuming 'To Do' or other neutral statuses
//             return { label: status || 'Unknown', textColorToken: 'status.todo.text', bgToken: 'status.todo.bg' };
//     }
// };

// Renamed and updated to return token paths
// const getPriorityTokenProps = (priority: string) => { // This function is unused
//    switch (priority) {
//        case 'High':
//            return { icon: WarningIcon, iconColorToken: 'priority.high.icon', label: 'High', textColorToken: 'priority.high.text', bgToken: 'priority.high.bg' };
//        case 'Medium':
//            return { icon: WarningIcon, iconColorToken: 'priority.medium.icon', label: 'Medium', textColorToken: 'priority.medium.text', bgToken: 'priority.medium.bg' };
//        case 'Low':
//            return { icon: WarningIcon, iconColorToken: 'priority.low.icon', label: 'Low', textColorToken: 'priority.low.text', bgToken: 'priority.low.bg' };
//        default:
//            return null;
//    }
// };

const TaskItem: React.FC<TaskItemProps> = memo(({
    task,
    compact = false,
    style,
    onDeleteInitiate,
    // onToggle, // Removed
    // onDelete, // Removed
    // onEdit, // Removed
}) => {
    const { isOpen: isEditTaskModalOpen, onOpen: onOpenEditTaskModal, onClose: onCloseEditTaskModal } = useDisclosure();
    const { isOpen: isDetailsModalOpen, onOpen: onOpenDetailsModal, onClose: onCloseDetailsModal } = useDisclosure(); // For TaskDetailsModal
    const projects = useProjectStore((state) => state.projects);
    const projectName = projects.find(p => p.id === task.project_id)?.name;

    // Get actions from taskStore
    // const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete); // Remove this line
    const deleteTaskStore = useTaskStore((state) => state.deleteTask);
    const editTaskInStore = useTaskStore((state) => state.updateTask); // updateTask is the correct name now
    const archiveTask = useTaskStore((state) => state.archiveTask);
    const unarchiveTask = useTaskStore((state) => state.unarchiveTask);

    const agents = useTaskStore((state) => state.agents || []); // Use correct store for agents
    const [isAgentModalOpen, setAgentModalOpen] = useState(false);
    const [agentLoading, setAgentLoading] = useState(false);
    const toast = useToast();
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || '');
    const [showStatusOptions, setShowStatusOptions] = useState(false);

    // Theme tokens
    const taskBg = useToken('colors', [task.completed ? 'task.item.completed.bg' : 'task.item.bg'])[0];
    const borderColorPrimary = useToken('colors', ['border.primary'])[0];
    const borderAccent = useToken('colors', ['border.accent'])[0];
    // const cardHoverBg = useColorModeValue('taskItem.default.hover.bg', 'taskItem.default.hover.bg'); // This line will be removed by the edit

    // Get status display properties from the utility
    const currentStatus = (task.status || 'TO_DO') as StatusID;
    const statusInfo = getDisplayableStatus(currentStatus, task.title); // Pass task.title as a fallback/example for dynamicValue if needed by some statuses

    const statusDisplayName = statusInfo?.displayName ?? 'Unknown';
    const statusColorScheme = statusInfo?.colorScheme ?? 'gray';
    const statusIcon = statusInfo?.icon;
    const statusDynamicValue = statusInfo?.dynamicValue;

    // Accent bar color by status - using the main color of the scheme
    const statusAccent = useToken('colors', [`${statusColorScheme}.500`, 'gray.500'])[0]; // Fallback to gray

    const handleToggleCompletion = useCallback(async () => { // Make async
        const newStatus = !task.completed ? 'Completed' : 'To Do';
        try {
            await editTaskInStore(task.id, { status: newStatus });
            // Optionally, show a toast or handle UI feedback
        } catch (error) {
            console.error("Failed to toggle task completion:", error);
            // Optionally, show an error toast
        }
    }, [task.id, task.completed, editTaskInStore]);

    // const handleDeleteClick = useCallback(() => { // This function is unused
    //     deleteTaskStore(task.id); // Changed from removeTask to deleteTask
    // }, [task.id, deleteTaskStore]);

    const textColorSecondary = task.completed ? 'text.disabled' : 'text.secondary';

    const handleAssignAgent = useCallback(() => {
        setAgentModalOpen(true);
    }, []);
    const handleAgentSelect = async (agent: { id: string; name: string }) => {
        setAgentLoading(true);
        await editTaskInStore(task.id, { agent_id: agent.id, agent_name: agent.name });
        setAgentLoading(false);
        setAgentModalOpen(false);
        toast({ title: `Agent assigned: ${agent.name}`, status: 'success', duration: 2000, isClosable: true });
    };
    const handleStatusChange = async (status: StatusID) => {
        await editTaskInStore(task.id, { status });
        toast({ title: `Status set to ${status}`, status: 'info', duration: 1500, isClosable: true });
    };

    const handleCopyPrompt = () => {
        // Always resolve agent_name from agent_id if missing or fallback
        let agentName = task.agent_name;
        if ((!agentName || agentName === '—') && task.agent_id) {
            const agents = useTaskStore.getState().agents || [];
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

    const startEditingTitle = () => {
        setEditTitle(task.title);
        setIsEditingTitle(true);
        if (task.status !== 'In Progress') {
            editTaskInStore(task.id, { status: 'In Progress' });
        }
    };
    const startEditingDescription = () => {
        setEditDescription(task.description || '');
        setIsEditingDescription(true);
        if (task.status !== 'In Progress') {
            editTaskInStore(task.id, { status: 'In Progress' });
        }
    };
    const saveTitle = async () => {
        if (editTitle !== task.title) {
            await editTaskInStore(task.id, { title: editTitle });
        }
        setIsEditingTitle(false);
    };
    const saveDescription = async () => {
        if (editDescription !== (task.description || '')) {
            await editTaskInStore(task.id, { description: editDescription });
        }
        setIsEditingDescription(false);
    };
    const cancelTitle = () => {
        setEditTitle(task.title);
        setIsEditingTitle(false);
    };
    const cancelDescription = () => {
        setEditDescription(task.description || '');
        setIsEditingDescription(false);
    };

    // Define available statuses for the dropdown menu
    const availableStatuses = React.useMemo(() => {
        return getAllStatusIds().filter(id => {
            const attrs = getStatusAttributes(id);
            // Include statuses that are not terminal, or if it's the current task's status (even if terminal, to show it as selected)
            return (attrs && !attrs.isTerminal) || id === currentStatus;
        });
    }, [currentStatus]);

    const handleArchiveTask = async (taskId: string) => {
        try {
            await archiveTask(taskId);
            toast({
                title: 'Task archived',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error archiving task',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleUnarchiveTask = async (taskId: string) => {
        try {
            await unarchiveTask(taskId);
            toast({
                title: 'Task unarchived',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error unarchiving task',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <>
            <Box position="relative" role="group" style={style}>
                <MotionFlex
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, transition: { duration: 0.3 } }}
                    transition={{ type: "spring", stiffness: 260, damping: 25 }}
                    align="center"
                    p={compact ? 2 : 4}
                    bg={taskBg}
                    borderRadius="lg"
                    boxShadow={compact ? 'xs' : 'md'}
                    mb={compact ? 2 : 3}
                    borderWidth="1px"
                    borderColor={borderColorPrimary}
                    borderLeftWidth="4px"
                    borderLeftColor={task.completed ? 'status.success' : (statusAccent || borderAccent)}
                    width="100%"
                    gap={compact ? 2 : 4}
                    minH={compact ? '48px' : 'auto'}
                    _hover={{
                        borderColor: task.completed ? borderColorPrimary : borderAccent,
                        bg: 'taskItem.default.hover.bg', // Use token string directly
                        boxShadow: compact ? "sm" : "lg",
                        transform: "translateY(-2px)"
                    }}
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
                                {isEditingTitle ? (
                                    <HStack w="100%">
                                        <Input 
                                            value={editTitle} 
                                            onChange={(e) => setEditTitle(e.target.value)} 
                                            size="sm" 
                                            autoFocus
                                            onBlur={saveTitle} 
                                            onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && saveTitle()} 
                                            bg="bg.input"
                                            borderColor="border.input"
                                            _hover={{ borderColor: 'border.input.hover' }}
                                            _focus={{ borderColor: 'border.focus', boxShadow: 'outline' }}
                                        />
                                        <IconButton icon={<CheckIcon />} aria-label="Save title" onClick={saveTitle} size="sm" />
                                        <IconButton icon={<CloseIcon />} aria-label="Cancel edit title" onClick={cancelTitle} size="sm" />
                                    </HStack>
                                ) : (
                                    <Box
                                        as="span"
                                        position="relative"
                                        _hover={{ cursor: 'pointer', borderBottom: '1px dashed', borderColor: 'brand.400', color: 'brand.500' }}
                                        onClick={startEditingTitle}
                                        tabIndex={0}
                                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') startEditingTitle(); }}
                                        aria-label="Edit title"
                                        display="inline-flex"
                                        alignItems="center"
                                    >
                                        {task.title || <Text as="span" color="text.muted">Click to edit title</Text>}
                                        <Icon as={EditIcon} boxSize={3} ml={2} color="brand.400" opacity={0.7} />
                                    </Box>
                                )}
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
                                {isEditingDescription ? (
                                    <VStack w="100%" align="stretch">
                                        <Textarea 
                                            value={editDescription} 
                                            onChange={(e) => setEditDescription(e.target.value)} 
                                            size="sm" 
                                            autoFocus 
                                            onBlur={saveDescription}
                                            minH="80px"
                                            bg="bg.input"
                                            borderColor="border.input"
                                            _hover={{ borderColor: 'border.input.hover' }}
                                            _focus={{ borderColor: 'border.focus', boxShadow: 'outline' }}
                                        />
                                        <HStack justify="flex-end">
                                            <Button 
                                                onClick={saveDescription} 
                                                size="xs" 
                                                bg="bg.button.primary"
                                                color="text.button.primary"
                                                _hover={{bg: "bg.button.primary.hover"}}
                                            >
                                                Save
                                            </Button>
                                            <Button onClick={cancelDescription} size="xs" variant="ghost">Cancel</Button>
                                        </HStack>
                                    </VStack>
                                ) : (
                                    <Box
                                        as="span"
                                        position="relative"
                                        _hover={{ cursor: 'pointer', borderBottom: '1px dashed', borderColor: 'brand.400', color: 'brand.500' }}
                                        onClick={startEditingDescription}
                                        tabIndex={0}
                                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') startEditingDescription(); }}
                                        aria-label="Edit description"
                                        display="inline-flex"
                                        alignItems="center"
                                    >
                                        {task.description ? (
                                            <Text color="text.secondary">{task.description}</Text>
                                        ) : (
                                            <Text as="span" color="text.muted">Click to add description</Text>
                                        )}
                                        <Icon as={EditIcon} boxSize={3} ml={2} color="brand.400" opacity={0.7} />
                                    </Box>
                                )}
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
                            <HStack spacing={2} wrap="wrap">
                                {/* Status Tag */}
                                <Tag size="sm" variant="subtle" colorScheme={statusColorScheme} cursor="pointer" onClick={() => setShowStatusOptions(!showStatusOptions)} title={statusDisplayName}>
                                    {statusIcon && typeof statusIcon !== 'string' && <TagLeftIcon boxSize="12px" as={statusIcon} />}
                                    <TagLabel>{statusDynamicValue ? `${statusDisplayName}: ${statusDynamicValue}` : statusDisplayName}</TagLabel>
                                    <Icon as={showStatusOptions ? ChevronUpIcon : ChevronDownIcon} ml={1} />
                                    {task.is_archived && (
                                        <Badge colorScheme="purple" variant="solid" ml={1} size="xs" px={1.5} py={0.5} borderRadius="sm">
                                            Archived
                                        </Badge>
                                    )}
                                </Tag>
                            </HStack>
                        )}
                    </VStack>

                    {/* Actions Menu - kept similar for both modes but styled for compact */}
                    <Menu placement="bottom-end">
                        <MenuButton
                            as={IconButton}
                            icon={<HamburgerIcon />}
                            size={compact ? "xs" : "sm"}
                            variant="ghost"
                            aria-label="Task actions"
                            color={textColorSecondary}
                        />
                        <MenuList
                            shadow="md"
                            border="1px"
                            borderColor="border.secondary"
                            borderRadius="md"
                        >
                            <MenuItem icon={<BsPencil />} onClick={onOpenEditTaskModal}>Edit Task</MenuItem>
                            <MenuItem icon={<ViewIcon />} onClick={onOpenDetailsModal}>View Details</MenuItem>
                            <MenuItem icon={<BsPerson />} onClick={handleAssignAgent}>Assign Agent</MenuItem>
                            <MenuItem onClick={() => setShowStatusOptions((v) => !v)}>
                                <Flex justifyContent="space-between" w="100%" align="center">
                                    <span>Set Status</span>
                                    <Icon as={ChevronDownIcon} transform={showStatusOptions ? 'rotate(180deg)' : undefined} />
                                </Flex>
                            </MenuItem>
                            {showStatusOptions && (
                                <Box px={3} py={2}>
                                    {availableStatuses.map((s_id) => {
                                        const sStatusInfo = getDisplayableStatus(s_id);
                                        const sDisplayName = sStatusInfo?.displayName ?? 'Unknown';
                                        const sIcon = sStatusInfo?.icon;
                                        return (
                                            <MenuItem 
                                                key={s_id} 
                                                onClick={() => { handleStatusChange(s_id); setShowStatusOptions(false); }} 
                                                icon={currentStatus === s_id ? <CheckIcon color={`${statusColorScheme}.500`} /> : (sIcon ? <ChakraIcon as={sIcon} /> : undefined)}
                                            >
                                                {sDisplayName}
                                            </MenuItem>
                                        );
                                    })}
                                    <Box mt={2}>
                                        {(() => {
                                            const currentActualStatusInfo = getDisplayableStatus((task.status || 'TO_DO') as StatusID);
                                            const currentStatusDisplayName = currentActualStatusInfo?.displayName ?? 'Unknown';
                                            const currentStatusColorScheme = currentActualStatusInfo?.colorScheme ?? 'gray';
                                            return (
                                                <Tag size="sm" variant="subtle" colorScheme={currentStatusColorScheme}>
                                                    <TagLabel>Current: {currentStatusDisplayName}</TagLabel>
                                                </Tag>
                                            );
                                        })()}
                                    </Box>
                                </Box>
                            )}
                            <MenuItem icon={<CopyIcon />} onClick={handleCopyPrompt}>Copy CLI Prompt</MenuItem>
                            {!task.is_archived ? (
                                <MenuItem icon={<DownloadIcon />} onClick={() => handleArchiveTask(task.id)}>
                                    Archive Task
                                </MenuItem>
                            ) : (
                                <MenuItem icon={<RepeatClockIcon />} onClick={() => handleUnarchiveTask(task.id)}>
                                    Unarchive Task
                                </MenuItem>
                            )}
                            <MenuItem icon={<DeleteIcon />} color="actions.danger.text" onClick={() => onDeleteInitiate(task)}>Delete Task</MenuItem>
                        </MenuList>
                    </Menu>

                    {/* Conditionally render completion checkbox for non-compact view */}
                    {!compact && (
                        <Checkbox
                            isChecked={task.completed}
                            onChange={handleToggleCompletion}
                            aria-label="Complete task"
                            size={compact ? "sm" : "md"}
                            mr={compact ? 2 : 3}
                            sx={{
                                '& .chakra-checkbox__control': {
                                    borderColor: 'border.checkbox',
                                    _checked: {
                                        bg: 'bg.checkbox.checked',
                                        borderColor: 'border.checkbox.checked',
                                        color: 'icon.inverted', // For the checkmark itself
                                    }
                                }
                            }}
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

