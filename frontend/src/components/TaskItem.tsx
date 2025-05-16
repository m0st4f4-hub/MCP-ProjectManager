// D:\mcp\task-manager\frontend\src\components\TaskItem.tsx
'use client';

import React, { useCallback, useState, memo, useMemo } from 'react';
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
} from '@chakra-ui/react';
import { DeleteIcon, ChevronDownIcon, CopyIcon, ChevronUpIcon, ViewIcon, EditIcon, HamburgerIcon, CheckIcon, CloseIcon, DownloadIcon, RepeatClockIcon } from '@chakra-ui/icons';
import { GoProject } from "react-icons/go";
import { BsPerson } from 'react-icons/bs';
import EditTaskModal from './modals/EditTaskModal';
import TaskDetailsModal from './modals/TaskDetailsModal';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { getDisplayableStatus, StatusID, getAllStatusIds, getStatusAttributes } from '@/lib/statusUtils';
import { Task } from '@/types';
import styles from './TaskItem.module.css';
import { clsx } from 'clsx';

interface TaskItemProps {
    task: Task;
    compact?: boolean;
    style?: React.CSSProperties;
    onDeleteInitiate: (task: Task) => void;
    onAssignAgent?: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = memo(({
    task,
    compact = false,
    style,
    onDeleteInitiate,
    onAssignAgent,
}) => {
    const { isOpen: isEditTaskModalOpen, onOpen: onOpenEditTaskModal, onClose: onCloseEditTaskModal } = useDisclosure();
    const { isOpen: isDetailsModalOpen, onOpen: onOpenDetailsModal, onClose: onCloseDetailsModal } = useDisclosure();
    const projects = useProjectStore((state) => state.projects);
    const projectName = projects.find(p => p.id === task.project_id)?.name;

    const editTaskInStore = useTaskStore((state) => state.updateTask);
    const archiveTaskInStore = useTaskStore((state) => state.archiveTask);
    const unarchiveTaskInStore = useTaskStore((state) => state.unarchiveTask);
    const storeAgents = useTaskStore((state) => state.agents || []);

    const [isAgentModalOpen, setAgentModalOpen] = useState(false);
    const [agentLoading, setAgentLoading] = useState(false);
    const toast = useToast();
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || '');

    const currentStatusId = (task.status || 'TO_DO') as StatusID;
    const statusInfo = getDisplayableStatus(currentStatusId, task.title);

    const statusDisplayName = statusInfo?.displayName ?? 'Unknown Status';
    const StatusIconComponent = statusInfo?.icon;

    const getStatusAccentClassName = (status: StatusID) => {
        switch (status) {
            case 'TO_DO': return styles.accentToDo;
            case 'IN_PROGRESS': return styles.accentInProgress;
            case 'BLOCKED': return styles.accentBlocked;
            case 'PENDING_VERIFICATION': return styles.accentPending;
            case 'COMPLETED': return styles.accentCompleted;
            default: return styles.accentDefault;
        }
    };

    const getStatusTagClassName = (status: StatusID) => {
        switch (status) {
            case 'TO_DO': return styles.statusTagToDo;
            case 'IN_PROGRESS': return styles.statusTagInProgress;
            case 'BLOCKED': return styles.statusTagBlocked;
            case 'PENDING_VERIFICATION': return styles.statusTagPending;
            case 'COMPLETED': return styles.statusTagCompleted;
            default: return styles.statusTagDefault;
        }
    };

    const handleToggleCompletion = useCallback(async () => {
        const newStatus = (task.status !== 'COMPLETED') ? 'COMPLETED' : 'TO_DO';
        try {
            await editTaskInStore(task.id, { status: newStatus });
        } catch {
            toast({ title: 'Error updating status', status: 'error', duration: 3000, isClosable: true });
        }
    }, [task.id, task.status, editTaskInStore, toast]);

    const handleAssignAgent = useCallback(() => {
        if (onAssignAgent) onAssignAgent(task);
        else setAgentModalOpen(true);
    }, [onAssignAgent, task]);

    const handleAgentSelect = async (agent: { id: string; name: string }) => {
        setAgentLoading(true);
        try {
            await editTaskInStore(task.id, { agent_id: agent.id, agent_name: agent.name });
            toast({ title: `Agent assigned: ${agent.name}`, status: 'success', duration: 2000, isClosable: true });
        } catch {
            toast({ title: 'Error assigning agent', status: 'error', duration: 3000, isClosable: true });
        } finally {
            setAgentLoading(false);
            setAgentModalOpen(false);
        }
    };

    const handleStatusChange = async (newStatus: StatusID) => {
        try {
            await editTaskInStore(task.id, { status: newStatus });
            toast({ title: `Status set to ${getDisplayableStatus(newStatus)?.displayName || newStatus}`, status: 'info', duration: 1500, isClosable: true });
        } catch {
            toast({ title: 'Error updating status', status: 'error', duration: 3000, isClosable: true });
        }
    };

    const handleCopyPrompt = () => {
        let agentName = task.agent_name;
        if ((!agentName || agentName === '—') && task.agent_id) {
            const agent = storeAgents.find(a => a.id === task.agent_id);
            agentName = agent ? agent.name : undefined;
        }
        let promptText;
        if (!agentName || agentName === '—') {
            promptText = `No agent is currently assigned to this task. Please assign an agent, then execute the following:\n\n- **Task ID:** ${task.id}\n- **Task Name:** ${task.title}\n- **Project ID:** ${task.project_id}\n\nThis is an existing task in the project. Do not create a new one. Once assigned, the agent should work on this task, update its status as they progress, and mark it as finished when done.`;
        } else {
            promptText = `@${agentName}, please execute the assigned task:\n\n- **Task ID:** ${task.id}\n- **Task Name:** ${task.title}\n- **Project ID:** ${task.project_id}\n\nThis is an existing task in the project. Do not create a new one. Work on this task, update its status as you progress, and mark it as finished when done.`;
        }
        navigator.clipboard.writeText(promptText).then(() => {
            toast({ title: 'Prompt copied to clipboard!', status: 'success', duration: 2000, isClosable: true });
        }, () => {
            toast({ title: 'Failed to copy prompt.', status: 'error', duration: 2000, isClosable: true });
        });
    };

    const startEditingTitle = () => {
        setEditTitle(task.title);
        setIsEditingTitle(true);
        if (task.status !== 'IN_PROGRESS') {
            editTaskInStore(task.id, { status: 'IN_PROGRESS' });
        }
    };
    const startEditingDescription = () => {
        setEditDescription(task.description || '');
        setIsEditingDescription(true);
        if (task.status !== 'IN_PROGRESS') {
            editTaskInStore(task.id, { status: 'IN_PROGRESS' });
        }
    };
    const saveTitle = async () => {
        if (editTitle.trim() !== task.title) {
            await editTaskInStore(task.id, { title: editTitle.trim() });
        }
        setIsEditingTitle(false);
    };
    const saveDescription = async () => {
        if (editDescription.trim() !== (task.description || '')) {
            await editTaskInStore(task.id, { description: editDescription.trim() });
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

    const availableStatuses = useMemo(() => {
        return getAllStatusIds().filter(id => {
            const attrs = getStatusAttributes(id);
            return (attrs && !attrs.isTerminal) || id === currentStatusId;
        });
    }, [currentStatusId]);

    const handleArchiveTask = async () => {
        try {
            await archiveTaskInStore(task.id);
            toast({ title: 'Task archived', status: 'success', duration: 3000, isClosable: true });
        } catch { toast({ title: 'Error archiving task', status: 'error', duration: 3000, isClosable: true }); }
    };
    const handleUnarchiveTask = async () => {
        try {
            await unarchiveTaskInStore(task.id);
            toast({ title: 'Task unarchived', status: 'success', duration: 3000, isClosable: true });
        } catch { toast({ title: 'Error unarchiving task', status: 'error', duration: 3000, isClosable: true }); }
    };

    const taskContainerClasses = clsx(
        styles.taskItemContainer,
        task.status === 'COMPLETED' && styles.taskItemContainerCompleted,
        compact && styles.taskItemContainerCompact,
        getStatusAccentClassName(currentStatusId)
    );

    const taskTitleClasses = clsx(
        styles.taskTitle,
        isEditingTitle && styles.taskTitleEditable,
        compact && styles.taskTitleCompact,
        task.status === 'COMPLETED' && styles.taskTitleCompleted
    );

    const descriptionTextClasses = clsx(
        styles.descriptionText,
        compact && styles.descriptionTextCompact,
        task.status === 'COMPLETED' && styles.descriptionTextCompleted
    );

    return (
        <Box className={taskContainerClasses} style={style} >
            <HStack className={styles.taskContentHStack}>
                <Box className={styles.taskCheckboxContainer}>
                    <Checkbox 
                        isChecked={task.status === 'COMPLETED'} 
                        onChange={handleToggleCompletion} 
                        size="lg"
                        colorScheme={statusInfo?.colorScheme || 'gray'}
                        aria-label={`Mark task ${task.title} as ${task.status === 'COMPLETED' ? 'incomplete' : 'complete'}`}
                    />
                </Box>

                <VStack className={clsx(styles.taskInfoVStack, compact && styles.taskInfoVStackCompact)}>
                    <Box className={styles.titleContainer}>
                        {isEditingTitle ? (
                            <Input 
                                value={editTitle} 
                                onChange={(e) => setEditTitle(e.target.value)} 
                                onBlur={saveTitle} 
                                autoFocus 
                                className={clsx(styles.titleInput, compact && styles.titleInputCompact)}
                                placeholder="Task title"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveTitle();
                                    if (e.key === 'Escape') cancelTitle();
                                }}
                            />
                        ) : (
                            <Text onClick={startEditingTitle} className={taskTitleClasses} noOfLines={2}>
                                {task.title}
                            </Text>
                        )}
                        {isEditingTitle && (
                            <HStack className={styles.inlineEditActions}>
                                <IconButton 
                                    aria-label="Save title" 
                                    icon={<CheckIcon />} 
                                    onClick={saveTitle} 
                                    size="xs" 
                                    className={clsx(styles.inlineEditButton, styles.inlineEditButtonSave)}
                                />
                                <IconButton 
                                    aria-label="Cancel edit title" 
                                    icon={<CloseIcon />} 
                                    onClick={cancelTitle} 
                                    size="xs" 
                                    className={clsx(styles.inlineEditButton, styles.inlineEditButtonCancel)}
                                />
                            </HStack>
                        )}
                    </Box>
                    
                    { (task.description || isEditingDescription) && (
                         isEditingDescription ? (
                            <Textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                onBlur={saveDescription}
                                autoFocus
                                className={clsx(styles.descriptionTextarea, compact && styles.descriptionTextareaCompact)}
                                placeholder="Task description"
                                minRows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.ctrlKey) saveDescription();
                                    if (e.key === 'Escape') cancelDescription();
                                }}
                            />
                        ) : (
                            <Text onClick={startEditingDescription} className={descriptionTextClasses} noOfLines={compact ? 1 : 2}>
                                {task.description}
                            </Text>
                        )
                    )}
                     {isEditingDescription && (
                        <HStack className={styles.inlineEditActions} justifyContent="flex-end" w="full">
                            <IconButton 
                                aria-label="Save description" 
                                icon={<CheckIcon />} 
                                onClick={saveDescription} 
                                size="xs" 
                                className={clsx(styles.inlineEditButton, styles.inlineEditButtonSave)}
                            />
                            <IconButton 
                                aria-label="Cancel edit description" 
                                icon={<CloseIcon />} 
                                onClick={cancelDescription} 
                                size="xs" 
                                className={clsx(styles.inlineEditButton, styles.inlineEditButtonCancel)}
                            />
                        </HStack>
                    )}

                    <HStack className={clsx(styles.tagsContainer, compact && styles.tagsContainerCompact)}>
                        <Tag className={clsx(styles.taskTag, getStatusTagClassName(currentStatusId))} size="sm">
                            {StatusIconComponent && <TagLeftIcon as={StatusIconComponent} />}
                            <TagLabel>{statusDisplayName}</TagLabel>
                        </Tag>
                        {projectName && (
                            <Tooltip label={`Project: ${projectName}`}>
                                <Tag className={clsx(styles.taskTag, styles.projectTag)} size="sm">
                                    <TagLeftIcon as={GoProject} />
                                    <TagLabel>{projectName}</TagLabel>
                                </Tag>
                            </Tooltip>
                        )}
                        {task.agent_name && task.agent_name !== '—' && (
                             <Tooltip label={`Agent: ${task.agent_name}`}>
                                <Tag className={clsx(styles.taskTag, styles.agentTag)} size="sm">
                                    <Avatar name={task.agent_name} className={styles.agentAvatar} size="xs" />
                                    <TagLabel>{task.agent_name}</TagLabel>
                                </Tag>
                            </Tooltip>
                        )}
                    </HStack>
                </VStack>

                <Flex className={styles.controlsFlex}>
                    <IconButton
                        aria-label={detailsOpen ? 'Collapse details' : 'Expand details'}
                        icon={detailsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        onClick={() => setDetailsOpen(!detailsOpen)}
                        size="sm"
                        className={styles.expandButton}
                    />
                    <Menu placement="bottom-end">
                        <MenuButton 
                            as={IconButton} 
                            aria-label="Task options" 
                            icon={<HamburgerIcon />} 
                            size="sm"
                            className={styles.menuButton}
                        />
                        <MenuList className={styles.menuList}>
                            <MenuItem icon={<EditIcon />} onClick={onOpenEditTaskModal} className={styles.menuItem}>Edit Task</MenuItem>
                            <MenuItem icon={<ViewIcon />} onClick={onOpenDetailsModal} className={styles.menuItem}>View Details</MenuItem>
                            <MenuItem icon={<BsPerson />} onClick={handleAssignAgent} className={styles.menuItem}>Assign Agent</MenuItem>
                            <Menu>
                                <MenuButton as={Button} variant="ghost" size="sm" width="full" textAlign="left" fontWeight="normal" className={styles.menuItem}>
                                    <HStack><Icon as={RepeatClockIcon} mr={1}/><span>Change Status</span></HStack>
                                </MenuButton>
                                <MenuList className={styles.menuList}>
                                    {availableStatuses.map(statusId => {
                                        const sInfo = getDisplayableStatus(statusId);
                                        return (
                                            <MenuItem 
                                                key={statusId} 
                                                onClick={() => handleStatusChange(statusId)} 
                                                icon={sInfo?.icon ? <Icon as={sInfo.icon} /> : undefined}
                                                className={styles.menuItem}
                                            >
                                                {sInfo?.displayName || statusId}
                                            </MenuItem>
                                        );
                                    })}
                                </MenuList>
                            </Menu>
                            <MenuItem icon={<CopyIcon />} onClick={handleCopyPrompt} className={styles.menuItem}>Copy CLI Prompt</MenuItem>
                            {task.is_archived ? (
                                <MenuItem icon={<DownloadIcon transform='rotate(180deg)' />} onClick={handleUnarchiveTask} className={styles.menuItem}>Unarchive Task</MenuItem>
                            ) : (
                                <MenuItem icon={<DownloadIcon />} onClick={handleArchiveTask} className={styles.menuItem}>Archive Task</MenuItem>
                            )}
                            <MenuItem icon={<DeleteIcon />} onClick={() => onDeleteInitiate(task)} className={clsx(styles.menuItem, styles.menuItemDestructive)}>Delete Task</MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            </HStack>
            
            <Collapse in={detailsOpen} animateOpacity>
                <Box className={styles.detailsCollapseContent}>
                    <VStack align="start" spacing={1} className={styles.detailsGrid}>
                        <Text className={styles.detailsLabel}>ID:</Text>
                        <Text className={styles.detailsValue}>{task.id}</Text>
                        
                        <Text className={styles.detailsLabel}>Created:</Text>
                        <Text className={styles.detailsValue}>{new Date(task.created_at).toLocaleString()}</Text>
                        
                        <Text className={styles.detailsLabel}>Updated:</Text>
                        <Text className={styles.detailsValue}>{new Date(task.updated_at).toLocaleString()}</Text>
                        
                        {task.project_id && (
                            <><Text className={styles.detailsLabel}>Project ID:</Text>
                            <Text className={styles.detailsValue}>{task.project_id}</Text></>
                        )}
                        {task.agent_id && (
                            <><Text className={styles.detailsLabel}>Agent ID:</Text>
                            <Text className={styles.detailsValue}>{task.agent_id}</Text></>
                        )}
                         {task.dependencies && task.dependencies.length > 0 && (
                            <><Text className={styles.detailsLabel}>Depends on:</Text>
                            <Text className={styles.detailsValue}>{task.dependencies.join(', ')}</Text></>
                        )}
                        {task.story_points && (
                            <><Text className={styles.detailsLabel}>Story Points:</Text>
                            <Text className={styles.detailsValue}>{task.story_points}</Text></>
                        )}
                    </VStack>
                </Box>
            </Collapse>

            <EditTaskModal isOpen={isEditTaskModalOpen} onClose={onCloseEditTaskModal} task={task} />
            <TaskDetailsModal isOpen={isDetailsModalOpen} onClose={onCloseDetailsModal} task={task} />

            <Modal isOpen={isAgentModalOpen} onClose={() => setAgentModalOpen(false)} isCentered>
                <ModalOverlay />
                <ModalContent className={styles.modalContent}>
                    <ModalHeader className={styles.modalHeader}>Assign Agent to: {task.title}</ModalHeader>
                    <ModalCloseButton className={styles.modalCloseButton}/>
                    <ModalBody className={styles.modalBody}>
                        {agentLoading && <Spinner />}
                        {!agentLoading && (
                            <List spacing={3} className={styles.agentModalList}>
                                {storeAgents.map(agent => (
                                    <ListItem 
                                        key={agent.id} 
                                        onClick={() => handleAgentSelect(agent)} 
                                        className={clsx(styles.agentModalListItem, task.agent_id === agent.id && styles.agentModalListItemSelected)}
                                    >
                                        {agent.name}
                                    </ListItem>
                                ))}
                                {storeAgents.length === 0 && <Text>No agents available.</Text>}
                            </List>
                        )}
                    </ModalBody>
                    <ModalFooter className={styles.modalFooter}>
                        <Button onClick={() => setAgentModalOpen(false)} className={styles.actionButton}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem;

