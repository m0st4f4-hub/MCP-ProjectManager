import React, { useState, useEffect, useMemo } from 'react';
import {
    Button,
    Checkbox,
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
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { AnimatePresence } from 'framer-motion';
import { Task, Agent } from '@/types';
import { useAgentStore } from '@/store/agentStore';
import { useTaskStore } from '@/store/taskStore';
import EditTaskModal from '../modals/EditTaskModal';
import TaskItem from '../TaskItem';
import TaskDetailsModal from '../modals/TaskDetailsModal';
import { AgentState } from '@/store/agentStore';
import { TaskState } from '@/store/taskStore';
import styles from './ListView.module.css';
import { clsx } from 'clsx';

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
    const agents = useAgentStore((state: AgentState) => state.agents);
    const deleteTaskFromStore = useTaskStore((state: TaskState) => state.deleteTask);
    const editTaskInStore = useTaskStore((state: TaskState) => state.updateTask);
    const selectedTaskIds = useTaskStore((state: TaskState) => state.selectedTaskIds);
    const toggleTaskSelection = useTaskStore((state: TaskState) => state.toggleTaskSelection);
    const selectAllTasks = useTaskStore((state: TaskState) => state.selectAllTasks);
    const deselectAllTasks = useTaskStore((state: TaskState) => state.deselectAllTasks);
    const toast = useToast();
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [assignAgentTask, setAssignAgentTask] = useState<Task | null>(null);
    const [agentLoading, setAgentLoading] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const cancelRef = React.useRef<HTMLButtonElement | null>(null);

    const theadBg = useColorModeValue('var(--chakra-colors-gray-50)', 'var(--chakra-colors-gray-800)');

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
            <div className={styles.loadingContainer}>
                <Spinner size="xl" />
            </div>
        );
    }
    
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

    const handleAssignAgent = (task: Task) => {
        setAssignAgentTask(task);
    };

    const handleAgentSelect = async (agent: Agent) => {
        if (!assignAgentTask) return;
        setAgentLoading(true);
        try {
            await editTaskInStore(assignAgentTask.id, { agent_id: agent.id, agent_name: agent.name });
            toast({ title: `Agent assigned: ${agent.name}`, status: 'success', duration: 2000, isClosable: true });
        } catch (error) {
            toast({ title: 'Failed to assign agent', description: String(error), status: 'error', duration: 3000, isClosable: true });
        } finally {
            setAgentLoading(false);
            setAssignAgentTask(null);
        }
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
            <div className={styles.mobileListContainer}>
                <AnimatePresence initial={false}>
                    {flatTasksForMobile.map(task => (
                        <div 
                            key={task.id} 
                            className={clsx(
                                styles.mobileListItem, 
                                selectedTaskIds.includes(task.id) && styles.mobileListItemSelected
                            )}
                        >
                            <Checkbox 
                                isChecked={selectedTaskIds.includes(task.id)}
                                onChange={() => toggleTaskSelection(task.id)}
                                mr={3}
                                colorScheme="blue"
                                aria-label={`Select task ${task.title}`}
                            />
                            <div className={styles.mobileTaskItemWrapper}>
                                <TaskItem
                                    task={task}
                                    onAssignAgent={handleAssignAgent}
                                    onDeleteInitiate={handleDeleteInitiateInListView}
                                    onClick={() => setSelectedTask(task)}
                                />
                            </div>
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <>
            <div className={styles.listViewContainer}>
                <header 
                    className={styles.desktopListHeader} 
                    style={{ backgroundColor: theadBg }}
                >
                    <div className={styles.headerCellCheckbox}>
                        <Checkbox
                            isChecked={areAllTasksSelected}
                            onChange={handleSelectAllToggle}
                            aria-label="Select all tasks"
                            colorScheme="blue"
                        />
                    </div>
                    <div className={clsx(styles.headerCell, styles.headerCellTitle)}>Title</div>
                    {groupedTasks.type !== 'status' && <div className={clsx(styles.headerCell, styles.headerCellStatus)}>Status</div>}
                    {groupedTasks.type !== 'project' && <div className={clsx(styles.headerCell, styles.headerCellProject)}>Project</div>}
                    {groupedTasks.type !== 'agent' && <div className={clsx(styles.headerCell, styles.headerCellAgent)}>Agent</div>}
                    <div className={clsx(styles.headerCell, styles.headerCellActions)}>Actions</div>
                </header>

                {groupedTasks.groups.map(group => (
                    <React.Fragment key={group.id}>
                        <div
                            className={styles.groupHeader}
                            onClick={() => toggleGroup(group.id)}
                        >
                            <IconButton
                                aria-label={expandedGroups[group.id] ? 'Collapse group' : 'Expand group'}
                                icon={expandedGroups[group.id] ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                size="xs"
                                variant="ghost"
                            />
                            <span className={styles.groupName}>{group.name}</span>
                            <span className={styles.groupTaskCount}>({group.tasks?.length || group.subgroups?.reduce((acc, sg) => acc + sg.tasks.length, 0)})</span>
                        </div>
                        {expandedGroups[group.id] && (
                            group.tasks ? group.tasks.map(task => (
                                <div key={task.id} className={clsx(styles.desktopListItem, selectedTaskIds.includes(task.id) && styles.desktopListItemSelected)}>
                                    <div className={styles.tableCellCheckbox}>
                                        <Checkbox
                                            isChecked={selectedTaskIds.includes(task.id)}
                                            onChange={() => toggleTaskSelection(task.id)}
                                            aria-label={`Select task ${task.title}`}
                                            colorScheme="blue"
                                        />
                                    </div>
                                    <div className={styles.tableCellTaskItem}>
                                        <TaskItem
                                            task={task}
                                            compact
                                            onAssignAgent={handleAssignAgent}
                                            onDeleteInitiate={handleDeleteInitiateInListView}
                                            displayContext="desktop-list"
                                            groupedBy={groupedTasks.type}
                                            onClick={() => setSelectedTask(task)}
                                        />
                                    </div>
                                </div>
                            )) : group.subgroups?.map(subgroup => (
                                <React.Fragment key={subgroup.id}>
                                    <div
                                        className={styles.subgroupHeader}
                                        onClick={() => toggleGroup(`${group.id}-${subgroup.id}`)}
                                    >
                                        <IconButton
                                            aria-label={expandedGroups[`${group.id}-${subgroup.id}`] ? 'Collapse subgroup' : 'Expand subgroup'}
                                            icon={expandedGroups[`${group.id}-${subgroup.id}`] ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                            size="xs"
                                            variant="ghost"
                                            style={{ marginLeft: '20px' }}
                                        />
                                        <span className={styles.subgroupName}>{subgroup.name}</span>
                                        <span className={styles.subgroupTaskCount}>({subgroup.tasks.length})</span>
                                    </div>
                                    {expandedGroups[`${group.id}-${subgroup.id}`] && subgroup.tasks.map(task => (
                                        <div key={task.id} className={clsx(styles.desktopListItem, styles.desktopSubListItem, selectedTaskIds.includes(task.id) && styles.desktopListItemSelected)}>
                                            <div className={styles.tableCellCheckbox} style={{ paddingLeft: '40px' }}>
                                                <Checkbox
                                                    isChecked={selectedTaskIds.includes(task.id)}
                                                    onChange={() => toggleTaskSelection(task.id)}
                                                    aria-label={`Select task ${task.title}`}
                                                    colorScheme="blue"
                                                />
                                            </div>
                                            <div className={styles.tableCellTaskItem}>
                                                <TaskItem
                                                    task={task}
                                                    compact
                                                    onAssignAgent={handleAssignAgent}
                                                    onDeleteInitiate={handleDeleteInitiateInListView}
                                                    displayContext="desktop-list"
                                                    groupedBy={groupedTasks.type}
                                                    onClick={() => setSelectedTask(task)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                    </React.Fragment>
                ))}
            </div>

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
                        await editTaskInStore(id, data);
                        setEditTask(null);
                    }}
                />
            )}
            <Modal isOpen={!!assignAgentTask} onClose={() => setAssignAgentTask(null)} size={isMobile ? "full" : "md"} isCentered={!isMobile}>
                <ModalOverlay />
                <ModalContent bg="bg.modal">
                    <ModalHeader borderBottomWidth="1px" borderColor="border.base">Assign Agent</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {agentLoading ? (
                             <div className={styles.loadingContainer}><Spinner color="icon.primary" /></div>
                        ) : (
                            <List spacing={2}>
                                 {agents.length === 0 && <ListItem>No agents available.</ListItem>}
                                {agents.map(agent => (
                                    <ListItem key={agent.id} onClick={() => handleAgentSelect(agent)} cursor="pointer" _hover={{ bg: "bg.subtle" }} p={2} rounded="md">
                                        {agent.name}
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </ModalBody>
                    <ModalFooter borderTopWidth="1px" borderColor="border.base">
                        <Button variant="ghost" onClick={() => setAssignAgentTask(null)}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <AlertDialog
                isOpen={isAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onAlertClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg="bg.modal">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold" borderBottomWidth="1px" borderColor="border.base">
                            Delete Task
                        </AlertDialogHeader>
                        <AlertDialogBody>
                             Are you sure you want to delete &quot;{taskToDelete?.title}&quot;? This action cannot be undone.
                        </AlertDialogBody>
                        <AlertDialogFooter borderTopWidth="1px" borderColor="border.base">
                            <Button ref={cancelRef} onClick={onAlertClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDeleteConfirmInListView} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

export default React.memo(ListView); 