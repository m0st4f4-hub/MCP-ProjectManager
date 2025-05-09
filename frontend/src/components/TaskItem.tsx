// D:\mcp\task-manager\frontend\src\components\TaskItem.tsx
'use client';

import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react';
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
    Link
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

    // State for description expansion
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [showReadMore, setShowReadMore] = useState(false);
    const descriptionRef = useRef<HTMLParagraphElement>(null);

    // State for tag expansion
    const [areAllTagsShown, setAreAllTagsShown] = useState(false);
    const TAG_DISPLAY_LIMIT = 2; // Show 2 tags by default + project/agent

    useEffect(() => {
        if (isOpen) {
            fetchProjectsAndAgents();
        }
    }, [isOpen, fetchProjectsAndAgents]);

    // Reset edited task when the task prop changes
    React.useEffect(() => {
        setEditedTask(task);
        // Reset expansion states when task changes
        setIsDescriptionExpanded(false);
        setAreAllTagsShown(false);
    }, [task]);

    // Check if description overflows to show "Read More"
    useEffect(() => {
        if (descriptionRef.current) {
            // Temporarily allow full text to measure
            const currentNoOfLines = descriptionRef.current.style.webkitLineClamp;
            descriptionRef.current.style.webkitLineClamp = 'unset';
            
            const hasOverflow = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
            setShowReadMore(hasOverflow);

            // Restore original clamp if it was set (or rely on noOfLines prop)
             if (currentNoOfLines) {
                descriptionRef.current.style.webkitLineClamp = currentNoOfLines;
            } else {
                 // If noOfLines was controlling, this effect runs after render,
                 // so we might need to re-evaluate based on the prop if it's not expanded.
                 // For simplicity, this check is done once. More robust check might be needed.
                 // For now, if it overflows when 'unset', we show "Read More".
            }
        } else {
            setShowReadMore(false);
        }
    }, [task.description, isDescriptionExpanded]); // Re-check if description or expansion state changes

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

    // Collect all tags for display logic
    const allTags = useMemo(() => {
        const tags = [];
        if (projectName) {
            tags.push({ label: projectName, colorScheme: 'purple', variant: 'outline' as const });
        }
        if (task.agent_name) {
            tags.push({ label: task.agent_name, colorScheme: 'cyan', variant: 'outline' as const });
        }
        // Assuming task.status is a string like "In Progress", "Completed", "Pending"
        // and we map them to colorSchemes
        if (task.completed) {
            tags.push({ label: 'Completed', colorScheme: 'green', variant: 'solid' as const });
        } else if (task.status) { // Example: task.status could be "In Progress", "Pending"
             let statusColorScheme = 'gray';
             if (task.status.toLowerCase() === 'in progress') statusColorScheme = 'orange';
             if (task.status.toLowerCase() === 'pending') statusColorScheme = 'yellow';
             tags.push({ label: task.status, colorScheme: statusColorScheme, variant: 'solid' as const });
        }
        // Add any other generic tags if task.tags is an array of strings
        if (Array.isArray(task.tags)) {
            task.tags.forEach(tagStr => tags.push({ label: tagStr, colorScheme: 'gray', variant: 'solid' as const }));
        }
        return tags;
    }, [task, projectName, projects, agents]); // Ensure dependencies are correct

    const displayedTags = areAllTagsShown ? allTags : allTags.slice(0, TAG_DISPLAY_LIMIT);

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
                                <FormLabel color="gray.100" fontWeight="medium">Title</FormLabel>
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
                                <FormLabel color="gray.100" fontWeight="medium">Description</FormLabel>
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
                                <FormLabel color="gray.100" fontWeight="medium">Project</FormLabel>
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
                                <FormLabel color="gray.100" fontWeight="medium">Agent</FormLabel>
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

                            <FormControl>
                                <FormLabel color="gray.100" fontWeight="medium">Status</FormLabel>
                                <Input
                                    value={editedTask.status || ''}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    placeholder="e.g., In Progress, Pending"
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
                        <VStack align="start" spacing={1} flex={1}>
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
                                <VStack align="start" spacing={1} width="100%">
                                    <Text
                                        ref={descriptionRef}
                                        color={task.completed ? "gray.500" : "gray.300"}
                                        fontSize="sm"
                                        noOfLines={isDescriptionExpanded ? undefined : 2}
                                        textDecoration={task.completed ? "line-through" : "none"}
                                        lineHeight="tall"
                                        sx={{
                                            // Fallback for non-webkit browsers if needed, though noOfLines usually works
                                            display: '-webkit-box',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: isDescriptionExpanded ? 'none' : 2,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {task.description}
                                    </Text>
                                    {showReadMore && task.description.length > 0 && ( // Ensure description exists
                                        <Link 
                                            color="blue.300" 
                                            fontSize="xs" 
                                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                            mt={0} // Adjust margin
                                        >
                                            {isDescriptionExpanded ? "Show Less" : "Read More"}
                                        </Link>
                                    )}
                                </VStack>
                            )}
                            <HStack spacing={2} flexWrap="wrap" mt={task.description ? 2 : 1}>
                                {displayedTags.map((tag, index) => (
                                    <Badge
                                        key={index}
                                        colorScheme={tag.colorScheme as any} // Cast as any for dynamic schemes
                                        variant={tag.variant}
                                        px={2} // Reduced padding for smaller tags
                                        py={0.5}
                                        borderRadius="md" // Slightly less rounded
                                        textTransform="none"
                                        fontSize="xs" // Smaller font for tags
                                        fontWeight="medium"
                                    >
                                        {tag.label}
                                    </Badge>
                                ))}
                                {allTags.length > TAG_DISPLAY_LIMIT && !areAllTagsShown && (
                                    <Button
                                        size="xs"
                                        variant="link"
                                        colorScheme="blue"
                                        onClick={() => setAreAllTagsShown(true)}
                                        ml={1}
                                        fontWeight="medium"
                                    >
                                        +{allTags.length - TAG_DISPLAY_LIMIT} more
                                    </Button>
                                )}
                                 {areAllTagsShown && allTags.length > TAG_DISPLAY_LIMIT && (
                                    <Button
                                        size="xs"
                                        variant="link"
                                        colorScheme="blue"
                                        onClick={() => setAreAllTagsShown(false)}
                                        ml={1}
                                        fontWeight="medium"
                                    >
                                        Show Less
                                    </Button>
                                )}
                            </HStack>
                        </VStack>
                    </HStack>
                    <VStack spacing={3} alignSelf="start">
                        <IconButton
                            aria-label="Edit task"
                            icon={<EditIcon />}
                            onClick={onOpen}
                            variant="ghost"
                            color="gray.400"
                            size="sm"
                            _hover={{ bg: "gray.600", color: "blue.300" }}
                            _focusVisible={{ boxShadow: "outline" }}
                        />
                        <IconButton
                            aria-label="Delete task"
                            icon={<DeleteIcon />}
                            onClick={() => onDelete(task.id)}
                            variant="ghost"
                            color="gray.400"
                            size="sm"
                            _hover={{ bg: "gray.600", color: "red.400" }}
                            _focusVisible={{ boxShadow: "outline" }}
                        />
                    </VStack>
                </HStack>
            </Box>
            {modalContent}
        </>
    );
});

TaskItem.displayName = 'TaskItem';
export default TaskItem;
