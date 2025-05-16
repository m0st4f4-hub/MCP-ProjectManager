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
    Select
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Task } from '@/types';
import { useTaskStore } from '@/store/taskStore';

interface TaskItemProps {
    task: Task;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
    onEdit: (task: Task) => void;
}

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
        return projects.find(p => p.id === task.project_id)?.name || `Project ${task.project_id}`;
    }, [task.project_id, projects]);

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
                                            {project.name}
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
                                            {agent.name}
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
    ), [isOpen, onClose, editedTask, handleSubmit, projects, agents]);

    return (
        <>
            <Box
                p={5}
                bg="gray.700"
                rounded="lg"
                shadow="lg"
                borderWidth="1px"
                borderColor={task.completed ? "green.500" : "gray.600"}
                _hover={{ 
                    shadow: "xl", 
                    borderColor: "blue.400",
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
                    bg: task.completed ? "green.400" : "blue.400",
                    opacity: 0.7
                }}
            >
                <HStack spacing={4} justify="space-between" align="start">
                    <HStack spacing={4} flex={1}>
                <Checkbox
                    isChecked={task.completed}
                            onChange={() => onToggle(task.id)}
                    colorScheme="green"
                    size="lg"
                            borderColor="gray.500"
                />
                        <VStack align="start" spacing={3} flex={1}>
                <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                textDecoration={task.completed ? "line-through" : "none"}
                                color={task.completed ? "gray.400" : "white"}
                                letterSpacing="tight"
                >
                    {task.title}
                </Text>
                            {task.description && (
                                <Text
                                    color={task.completed ? "gray.500" : "gray.300"}
                                    fontSize="sm"
                                    noOfLines={2}
                                    textDecoration={task.completed ? "line-through" : "none"}
                                    lineHeight="tall"
                                >
                                    {task.description}
                                </Text>
                            )}
                            <HStack spacing={2} flexWrap="wrap">
                                {projectName && (
                                    <Badge 
                                        colorScheme="purple" 
                                        px={3} 
                                        py={1} 
                                        borderRadius="full"
                                        textTransform="none"
                                        fontWeight="medium"
                                        variant="solid"
                                    >
                                        {projectName}
                                    </Badge>
                                )}
                                {task.agent_name && (
                                    <Badge 
                                        colorScheme="blue" 
                                        px={3} 
                                        py={1} 
                                        borderRadius="full"
                                        textTransform="none"
                                        fontWeight="medium"
                                        variant="solid"
                                    >
                                        {task.agent_name}
                                    </Badge>
                                )}
                                <Badge 
                                    colorScheme={task.completed ? "green" : "yellow"} 
                                    px={3} 
                                    py={1} 
                                    borderRadius="full"
                                    textTransform="none"
                                    fontWeight="medium"
                                    variant="solid"
                                >
                                    {task.completed ? "Completed" : "In Progress"}
                                </Badge>
                </HStack>
            </VStack>
                    </HStack>
                    <HStack spacing={2}>
                    <IconButton
                            icon={<EditIcon />}
                        aria-label="Edit task"
                            variant="ghost"
                            colorScheme="blue"
                        size="sm"
                            onClick={onOpen}
                            color="gray.100"
                            _hover={{ bg: 'blue.500', color: 'white' }}
                        />
                    <IconButton
                            icon={<DeleteIcon />}
                        aria-label="Delete task"
                            variant="ghost"
                            colorScheme="red"
                        size="sm"
                            onClick={() => onDelete(task.id)}
                            color="gray.100"
                            _hover={{ bg: 'red.500', color: 'white' }}
                    />
                    </HStack>
            </HStack>
            </Box>
            {modalContent}
        </>
    );
});

TaskItem.displayName = 'TaskItem';
export default TaskItem;
