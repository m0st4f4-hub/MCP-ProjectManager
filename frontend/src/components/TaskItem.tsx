// D:\mcp\task-manager\frontend\src\components\TaskItem.tsx
'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import {
    Box,
    Text,
    HStack,
    IconButton,
    Checkbox,
    Badge,
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
    MenuItem
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, HamburgerIcon, AtSignIcon, TagLeftIcon, TimeIcon } from '@chakra-ui/icons';
import { Task } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import { formatDisplayName } from '@/lib/utils';

interface TaskItemProps {
    task: Task;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
    onEdit: (task: Task) => void;
}

const ACCENT_COLOR = "#dad2cc"; // Define the single accent color
const COMPLETED_TEXT_COLOR = "gray.400"; // For completed item text
const COMPLETED_BORDER_COLOR = "gray.500"; // Softer border for completed
const ACTIVE_BORDER_COLOR = ACCENT_COLOR; // Accent border for emphasis if desired, or stick to gray.600 and use top bar for accent

const TaskItem: React.FC<TaskItemProps> = React.memo(({ task, onToggle, onDelete, onEdit }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editedTask, setEditedTask] = React.useState<Task>(task);
    const projects = useTaskStore(state => state.projects);
    const agents = useTaskStore(state => state.agents);
    const fetchProjectsAndAgents = useTaskStore(state => state.fetchProjectsAndAgents);

    useEffect(() => {
        if (isOpen) {
            fetchProjectsAndAgents();
        }
    }, [isOpen, fetchProjectsAndAgents]);

    // Reset edited task when the task prop changes
    React.useEffect(() => {
        setEditedTask(task);
    }, [task]);

    // Memoize handlers
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onEdit(editedTask);
        onClose();
    }, [editedTask, onEdit, onClose]);

    const handleInputChange = (field: keyof Task, value: string | number | boolean | null) => {
        setEditedTask(prev => ({
            ...prev,
            [field]: field === 'project_id' ? (value ? Number(value) : null) : value
        }));
    };

    // Get project and agent names for display
    const projectName = useMemo(() => {
        if (!task.project_id) return null;
        const project = projects.find(p => p.id === task.project_id);
        return project ? formatDisplayName(project.name) : `Project ${task.project_id}`;
    }, [task.project_id, projects]);

    const agentNameDisplay = useMemo(() => {
        if (!task.agent_name) return null;
        // Assuming agent_name from task is the raw name. 
        // If agents list contains formatted names, adjust logic.
        return formatDisplayName(task.agent_name);
    }, [task.agent_name]);

    // Memoize modal content to prevent unnecessary re-renders
    const modalContent = useMemo(() => (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay backdropFilter="blur(2px)" />
            <ModalContent bg="gray.800" color="white" borderColor="gray.700" borderWidth="1px">
                <ModalHeader borderBottomWidth="1px" borderColor="gray.700">Edit Task</ModalHeader>
                <ModalCloseButton color="gray.300" _hover={{ bg: "gray.700", color: "white" }} />
                <ModalBody pb={6}>
                    <form onSubmit={handleSubmit}>
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
                                    onChange={(e) => handleInputChange('project_id', e.target.value ? Number(e.target.value) : null)}
                                    placeholder="Select project"
                                    bg="gray.700"
                                    color="white"
                                    borderColor="gray.600"
                                    _hover={{ borderColor: "gray.500" }}
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                    _placeholder={{ color: "gray.400" }}
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
                                    value={editedTask.agent_name || ''}
                                    onChange={(e) => handleInputChange('agent_name', e.target.value || null)}
                                    placeholder="Select agent"
                                    bg="gray.700"
                                    color="white"
                                    borderColor="gray.600"
                                    _hover={{ borderColor: "gray.500" }}
                                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                                    _placeholder={{ color: "gray.400" }}
                                >
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.name}>
                                            {formatDisplayName(agent.name)}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <HStack spacing={4} width="100%" justify="flex-end" pt={4}>
                                <Button 
                                    onClick={onClose}
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
    ), [isOpen, onClose, editedTask, handleSubmit, projects, agents, handleInputChange]);

    return (
        <>
            <Box
                p={5}
                bg="gray.700"
                rounded="lg"
                shadow="lg"
                borderWidth="1px"
                borderColor={task.completed ? COMPLETED_BORDER_COLOR : "gray.600"} // Use softer border for completed
                _hover={{ 
                    shadow: "xl", 
                    borderColor: task.completed ? COMPLETED_BORDER_COLOR : ACTIVE_BORDER_COLOR, // Accent on hover for active
                    transform: "translateY(-1px)",
                }}
                transition="all 0.2s ease-in-out"
                position="relative"
                overflow="hidden"
                _before={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    bg: task.completed ? "transparent" : ACCENT_COLOR, // Accent top bar only for active tasks
                    opacity: 0.9 // Slightly more opaque if it's the main indicator
                }}
            >
                <HStack spacing={4} justify="space-between" align="start">
                    <HStack spacing={4} flex={1} align="start">
                        <Checkbox
                            isChecked={task.completed}
                            onChange={() => onToggle(task.id)}
                            colorScheme="gray" // Neutral color scheme for checkbox
                            size="lg"
                            borderColor="gray.500"
                            mt={1}
                            sx={{
                                '& .chakra-checkbox__control[data-checked]': {
                                    bg: ACCENT_COLOR,
                                    borderColor: ACCENT_COLOR,
                                    color: 'gray.800' // Checkmark color
                                },
                                '& .chakra-checkbox__control': {
                                    bg: 'gray.600'
                                }
                            }}
                        />
                        <VStack align="start" spacing={1} flex={1}>
                            <Text
                                fontWeight="bold"
                                fontSize="lg"
                                color={task.completed ? COMPLETED_TEXT_COLOR : "whiteAlpha.900"}
                                textDecoration={task.completed ? 'line-through' : 'none'}
                                sx={{
                                    textTransform: 'capitalize', // Simple way to approximate Title Case for first words
                                    // For true Title Case, a utility function applied to task.title would be better
                                }}
                            >
                                {formatDisplayName(task.title)} {/* Using formatDisplayName for title consistency */}
                            </Text>
                            <Text fontSize="xs" color={task.completed ? COMPLETED_TEXT_COLOR : "gray.400"}>
                                Status: {task.completed ? 'Completed' : 'Active'}
                            </Text>

                            {task.description && (
                                <Text fontSize="sm" color={task.completed ? COMPLETED_TEXT_COLOR : "gray.300"} noOfLines={2}>
                                    {task.description}
                                </Text>
                            )}

                            <VStack align="start" spacing={1} mt={2} pt={2} borderTopWidth="1px" borderColor="gray.600" w="full">
                                <Text fontSize="xs" fontWeight="medium" color="gray.400">Details:</Text>
                                {projectName && (
                                    <HStack spacing={1.5}>
                                        <TagLeftIcon boxSize="14px" color={ACCENT_COLOR} />
                                        <Text fontSize="xs" color={task.completed ? COMPLETED_TEXT_COLOR : "gray.200"}>
                                            {projectName}
                                        </Text>
                                    </HStack>
                                )}
                                {agentNameDisplay && (
                                    <HStack spacing={1.5}>
                                        <AtSignIcon boxSize="14px" color={ACCENT_COLOR} />
                                        <Text fontSize="xs" color={task.completed ? COMPLETED_TEXT_COLOR : "gray.200"}>
                                            {agentNameDisplay}
                                        </Text>
                                    </HStack>
                                )}
                                <HStack spacing={1.5}>
                                    <TimeIcon color={task.completed ? COMPLETED_TEXT_COLOR : ACCENT_COLOR} boxSize="14px" />
                                    <Text fontSize="xs" color="gray.200">{new Date(task.created_at).toLocaleDateString()}</Text>
                                </HStack>
                            </VStack>
                        </VStack>
                    </HStack>

                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={<HamburgerIcon />}
                            variant="ghost"
                            size="sm"
                            color={task.completed ? "gray.500" : "gray.300"}
                            _hover={{ bg: "gray.600" }}
                            position="absolute"
                            top="8px"
                            right="8px"
                        />
                        <MenuList bg="gray.700" borderColor="gray.600">
                            <MenuItem 
                                icon={<EditIcon />} 
                                onClick={onOpen} 
                                bg="gray.700" 
                                color="gray.100"
                                _hover={{ bg: "gray.600" }}
                            >
                                Edit
                            </MenuItem>
                            <MenuItem 
                                icon={<DeleteIcon />} 
                                onClick={() => onDelete(task.id)} 
                                bg="gray.700" 
                                color="red.300"
                                _hover={{ bg: "red.600", color: "white" }}
                            >
                                Delete
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </Box>
            {modalContent}
        </>
    );
});

TaskItem.displayName = 'TaskItem';
export default TaskItem;
