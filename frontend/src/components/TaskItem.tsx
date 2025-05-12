// D:\mcp\task-manager\frontend\src\components\TaskItem.tsx
'use client';

import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
    Box,
    Text,
    HStack,
    IconButton,
    Checkbox,
    VStack,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Select,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Collapse
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, HamburgerIcon, AtSignIcon, TagLeftIcon, TimeIcon, ChevronDownIcon, ChevronRightIcon, InfoOutlineIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { Task, Subtask, SubtaskCreateData, SubtaskUpdateData } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import { formatDisplayName } from '@/lib/utils';
import SubtaskList from './subtasks/SubtaskList';
import SubtaskForm from './subtasks/SubtaskForm';
import { updateTask, createSubtask, updateSubtask as apiUpdateSubtask, deleteTask, listSubtasks } from '@/services/api';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string, completed: boolean) => void;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
    isSubtask?: boolean;
}

const ACCENT_COLOR = "#dad2cc";
const COMPLETED_TEXT_COLOR = "gray.400";
const COMPLETED_BORDER_COLOR = "gray.500";
const ACTIVE_BORDER_COLOR = ACCENT_COLOR;

const TaskItem: React.FC<TaskItemProps> = React.memo(({ task, onToggle, onDelete, onEdit, isSubtask = false }) => {
    const { isOpen: isEditTaskModalOpen, onOpen: onOpenEditTaskModal, onClose: onCloseEditTaskModal } = useDisclosure();
    const [editedTask, setEditedTask] = React.useState<Task>(task);
    const [isExpanded, setIsExpanded] = useState(false);

    const [isSubtaskFormOpen, setIsSubtaskFormOpen] = useState(false);
    const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
    const [subtaskFormError, setSubtaskFormError] = useState<string | null>(null);
    const [subtasksData, setSubtasksData] = useState<{subtasks: Subtask[], isLoading: boolean, error: string | null}>({ subtasks: [], isLoading: true, error: null });
    const [subtaskListKey, setSubtaskListKey] = useState(Date.now()); // Added for forcing SubtaskList re-render

    const projects = useTaskStore(state => state.projects);
    const agents = useTaskStore(state => state.agents);
    const fetchProjectsAndAgents = useTaskStore(state => state.fetchProjectsAndAgents);

    useEffect(() => {
        if (isEditTaskModalOpen) {
            fetchProjectsAndAgents();
        }
    }, [isEditTaskModalOpen, fetchProjectsAndAgents]);

    React.useEffect(() => {
        setEditedTask(task);
    }, [task]);

    const fetchAndSetSubtasks = useCallback(async () => {
      if (!task.id) {
        setSubtasksData({ subtasks: [], isLoading: false, error: null });
        return;
      }
      // console.log(`TaskItem (${task.title}): Fetching subtasks, trigger: ${refreshSubtaskTrigger}`);
      setSubtasksData(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const fetchedSubtasks = await listSubtasks(task.id);
        // console.log(`TaskItem (${task.title}): Fetched subtasks:`, fetchedSubtasks);
        setSubtasksData({ subtasks: fetchedSubtasks || [], isLoading: false, error: null });
      } catch (err) {
        console.error(`TaskItem (${task.title}): Failed to fetch subtasks:`, err);
        setSubtasksData({ subtasks: [], isLoading: false, error: 'Failed to load subtasks for item.' });
      }
    }, [task.id]); // refreshSubtaskTrigger is implicitly handled by being in parent useEffect's dep array

    useEffect(() => {
      fetchAndSetSubtasks();
    }, [task.id, fetchAndSetSubtasks]);

    const handleSubmitEditTask = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onEdit(editedTask);
        onCloseEditTaskModal();
    }, [editedTask, onEdit, onCloseEditTaskModal]);

    const handleInputChange = useCallback((field: keyof Task, value: string | number | boolean | null) => {
        if (field === 'project_id' || field === 'agent_id' || field === 'parent_task_id') {
            setEditedTask(prev => ({ ...prev, [field]: value ? String(value) : null }));
        } else {
            setEditedTask(prev => ({ ...prev, [field]: value }));
        }
    }, []);

    const projectName = useMemo(() => {
        if (!task.project_id) return null;
        const project = projects.find(p => p.id === task.project_id);
        return project ? formatDisplayName(project.name) : `Project ID: ${task.project_id}`;
    }, [task.project_id, projects]);

    const agentNameDisplay = useMemo(() => {
        if (!task.agent_id) return null;
        const agent = agents.find(a => a.id === task.agent_id);
        return agent ? formatDisplayName(agent.name) : `Agent ID: ${task.agent_id}`;
    }, [task.agent_id, agents]);

    const handleOpenAddSubtaskForm = useCallback(() => {
        setIsExpanded(true);
        setEditingSubtask(null);
        setIsSubtaskFormOpen(true);
        setSubtaskFormError(null);
        console.log('Add Subtask clicked');
    }, []);

    const handleOpenEditSubtaskForm = useCallback((subtaskToEdit: Subtask) => {
        setEditingSubtask(subtaskToEdit);
        setIsSubtaskFormOpen(true);
        setSubtaskFormError(null);
    }, []);

    const handleCloseSubtaskForm = useCallback(() => {
        setIsSubtaskFormOpen(false);
        setEditingSubtask(null);
        setSubtaskFormError(null);
        // It might be beneficial to trigger a refresh here too,
        // in case the form was opened for edit but nothing changed,
        // or if a creation was cancelled after some optimistic UI elsewhere.
        // However, the main refresh trigger is after successful submit.
    }, []);

    const handleSubtaskFormSubmit = useCallback(async (data: SubtaskCreateData | SubtaskUpdateData, subtaskId?: string) => {
        console.log('TaskItem: handleSubtaskFormSubmit called', data, subtaskId);
        setSubtaskFormError(null);
        try {
            if (subtaskId && editingSubtask) { // Edit mode
                await apiUpdateSubtask(subtaskId, data as SubtaskUpdateData, task.id);
            } else { // Create mode
                console.log('Calling createSubtask with', task.id, data);
                const result = await createSubtask(task.id, data as SubtaskCreateData);
                console.log('createSubtask result', result);
            }
            await fetchAndSetSubtasks();
            setSubtaskListKey(Date.now()); // Update key to force re-render of SubtaskList
            handleCloseSubtaskForm();
            // Optionally, call onEdit for the parent task if subtask changes affect it
            // onEdit(task); // This might cause a full re-render, consider if needed
        } catch (error) {
            console.error("Failed to save subtask:", error);
            setSubtaskFormError("Failed to save subtask. Please try again.");
            await fetchAndSetSubtasks(); // Refresh data even on error
        }
    }, [task.id, editingSubtask, handleCloseSubtaskForm, fetchAndSetSubtasks]);
    

    const modalContent = useMemo(() => (
        <Modal isOpen={isEditTaskModalOpen} onClose={onCloseEditTaskModal} size="xl">
            <ModalOverlay backdropFilter="blur(2px)" />
            <ModalContent bg="gray.800" color="white" borderColor="gray.700" borderWidth="1px">
                <ModalHeader borderBottomWidth="1px" borderColor="gray.700">Edit Task</ModalHeader>
                <ModalCloseButton color="gray.300" _hover={{ bg: "gray.700", color: "white" }} />
                <ModalBody pb={6}>
                    <form onSubmit={handleSubmitEditTask}>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel color="gray.100">Title</FormLabel>
                                <Input
                                    value={editedTask.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Task title"
                                    bg="gray.700"
                                    color="white"
                                    borderColor="gray.600"
                                    _hover={{ borderColor: "gray.500" }}
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                    _placeholder={{ color: "gray.400" }}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel color="gray.100">Description</FormLabel>
                                <Textarea
                                    value={editedTask.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value || null)}
                                    placeholder="Task description"
                                    bg="gray.700"
                                    color="white"
                                    borderColor="gray.600"
                                    _hover={{ borderColor: "gray.500" }}
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                    _placeholder={{ color: "gray.400" }}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel color="gray.100">Project</FormLabel>
                                <Select
                                    value={editedTask.project_id || ''}
                                    onChange={(e) => handleInputChange('project_id', e.target.value || null)}
                                    placeholder="Select project"
                                    bg="gray.700"
                                    color="white"
                                    borderColor="gray.600"
                                    _hover={{ borderColor: "gray.500" }}
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                >
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {formatDisplayName(project.name)}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel color="gray.100">Agent</FormLabel>
                                <Select
                                    value={editedTask.agent_id || ''}
                                    onChange={(e) => handleInputChange('agent_id', e.target.value || null)}
                                    placeholder="Select agent"
                                    bg="gray.700"
                                    color="white"
                                    borderColor="gray.600"
                                    _hover={{ borderColor: "gray.500" }}
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                >
                                    {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>
                                        {formatDisplayName(agent.name)}
                                    </option>
                                ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel color="gray.100">Parent Task ID (Optional)</FormLabel>
                                <Input
                                    value={editedTask.parent_task_id || ''}
                                    onChange={(e) => handleInputChange('parent_task_id', e.target.value || null)}
                                    placeholder="Enter parent task ID if this is a subtask"
                                    bg="gray.700"
                                    color="white"
                                    borderColor="gray.600"
                                    _hover={{ borderColor: "gray.500" }}
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                    _placeholder={{ color: "gray.400" }}
                                />
                            </FormControl>

                            <HStack spacing={4} width="100%" justify="flex-end" pt={4}>
                                <Button 
                                    onClick={onCloseEditTaskModal}
                                    variant="outline"
                                    borderColor="gray.600"
                                    color="gray.100"
                                    _hover={{ bg: "gray.700" }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    colorScheme="blue" 
                                    type="submit"
                                    _hover={{ bg: "blue.500" }}
                                    _active={{ bg: "blue.600" }}
                                >
                                    Save Changes
                                </Button>
                            </HStack>
                        </VStack>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    ), [isEditTaskModalOpen, onCloseEditTaskModal, editedTask, handleSubmitEditTask, projects, agents, handleInputChange]);

    const hasSubtasks = useMemo(() => task.subtasks && task.subtasks.length > 0, [task.subtasks]);

    const TaskStatusIcon = useMemo(() => {
        if (task.completed) return <CheckCircleIcon color="green.400" />;
        if (task.status === 'IN_PROGRESS') return <TimeIcon color="yellow.400" />;
        if (task.status === 'PENDING' || task.status === 'TODO') return <InfoOutlineIcon color="blue.400" />;
        if (task.status === 'BLOCKED') return <WarningIcon color="orange.400" />;
        return <InfoOutlineIcon color="blue.400" />;
    }, [task.completed, task.status]);

    return (
            <Box
            borderWidth="1px"
            borderRadius="lg"
                p={4}
            mb={isSubtask ? 2 : 4} // Smaller margin for subtasks
            borderColor={task.completed ? COMPLETED_BORDER_COLOR : ACTIVE_BORDER_COLOR}
            bg={task.completed ? "gray.750" : "gray.800"} // Slightly different bg for completed
            opacity={task.completed ? 0.7 : 1}
            w={isSubtask ? "calc(100% - 20px)" : "100%"} // Indent subtasks
            ml={isSubtask ? "20px" : "0"} // Indent subtasks
            boxShadow={task.completed ? "none" : "sm"}
            transition="all 0.2s ease-in-out"
        >
            <HStack justifyContent="space-between" alignItems="center">
                <HStack spacing={2} alignItems="center" flexGrow={1} minWidth={0}>
                            <Checkbox
                                isChecked={task.completed}
                        onChange={(e) => onToggle(task.id, e.target.checked)}
                        colorScheme="green"
                        size="lg"
                        borderColor={task.completed ? "green.600" : "gray.500"}
                    />
                    <VStack alignItems="start" spacing={0} flexGrow={1} minWidth={0}>
                            <Text
                            fontWeight="bold" 
                            fontSize="lg" 
                            noOfLines={2} 
                            title={task.title}
                                textDecoration={task.completed ? 'line-through' : 'none'}
                            color={task.completed ? COMPLETED_TEXT_COLOR : 'gray.100'}
                        >
                            {task.title}
                        </Text>
                        {task.description && (
                            <Text 
                                fontSize="xs" 
                                color={task.completed ? "gray.500" : "gray.400"} 
                                noOfLines={1} 
                                title={task.description}
                            >
                                {task.description}
                            </Text>
                        )}
                    </VStack>
                        </HStack>
                <HStack spacing={1}>
                    {!isSubtask && (
                         <IconButton
                            aria-label={isExpanded ? "Collapse subtasks" : "Expand subtasks"}
                            icon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsExpanded(!isExpanded)}
                            color="gray.400"
                            _hover={{ bg: "gray.700" }}
                        />
                    )}
                    <Menu>
                            <MenuButton
                                as={IconButton}
                            aria-label='Options'
                                icon={<HamburgerIcon />}
                            variant='ghost'
                                size="sm"
                                color="gray.400"
                            _hover={{ bg: "gray.700" }}
                            />
                            <MenuList bg="gray.700" borderColor="gray.600">
                            <MenuItem icon={<EditIcon />} onClick={onOpenEditTaskModal} bg="gray.700" _hover={{ bg: "gray.600" }} color="gray.200">Edit Task</MenuItem>
                            <MenuItem icon={<DeleteIcon />} onClick={() => onDelete(task.id)} bg="gray.700" _hover={{ bg: "gray.600" }} color="red.400">Delete Task</MenuItem>
                            </MenuList>
                        </Menu>
                </HStack>
                    </HStack>

            {(projectName || agentNameDisplay) && (
                 <HStack mt={2} spacing={4} alignItems="center">
                    {projectName && (
                        <HStack spacing={1} title={`Project: ${projectName}`}>
                            <TagLeftIcon as={InfoOutlineIcon} color="blue.300" boxSize="0.8em"/>
                            <Text fontSize="2xs" color="blue.300" noOfLines={1}>{projectName}</Text>
                        </HStack>
                    )}
                    {agentNameDisplay && (
                        <HStack spacing={1} title={`Agent: ${agentNameDisplay}`}>
                            <AtSignIcon color="purple.300" boxSize="0.8em"/>
                            <Text fontSize="2xs" color="purple.300" noOfLines={1}>{agentNameDisplay}</Text>
                            </HStack>
                        )}
                            </HStack>
                        )}

            {task.due_date && (
                <HStack mt={1} spacing={1} title={`Due: ${new Date(task.due_date).toLocaleDateString()}`}>
                    <TimeIcon color="orange.300" boxSize="0.8em" />
                    <Text fontSize="2xs" color="orange.300">Due: {new Date(task.due_date).toLocaleDateString()}</Text>
                            </HStack>
                        )}

            {task.status && (
                <HStack mt={1} spacing={1} title={`Status: ${task.status}`}>
                    {task.status.toLowerCase().includes("completed") || task.status.toLowerCase().includes("done") ? 
                        <CheckCircleIcon color="green.400" boxSize="0.8em" /> :
                        <WarningIcon color="yellow.400" boxSize="0.8em" />
                    }
                    <Text fontSize="2xs" color="gray.300">{task.status}</Text>
                        </HStack>
            )}

            {modalContent}

            {(
                <SubtaskForm
                    isOpen={isSubtaskFormOpen}
                    parentTaskId={task.id}
                    subtask={editingSubtask}
                    onSubmit={handleSubtaskFormSubmit}
                    onClose={handleCloseSubtaskForm}
                    errorMessage={subtaskFormError}
                />
            )}

            {!isSubtask && (
                <Collapse in={isExpanded} animateOpacity>
                    <Box mt={isExpanded ? 4 : 0} pl={0} borderLeftWidth={0} borderColor="gray.700">
                        <SubtaskList
                            key={subtaskListKey}
                            parentTaskId={task.id}
                            passedSubtasks={subtasksData.subtasks}
                            isLoading={subtasksData.isLoading}
                            error={subtasksData.error}
                            onAddSubtaskRequest={handleOpenAddSubtaskForm}
                            onEditSubtaskRequest={handleOpenEditSubtaskForm}
                            onRequestRefresh={fetchAndSetSubtasks}
                        />
                    </Box>
                </Collapse>
            )}
        </Box>
    );
});

TaskItem.displayName = 'TaskItem';
export default TaskItem;
