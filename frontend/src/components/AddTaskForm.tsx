// D:\mcp\task-manager\frontend\src\components\AddTaskForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    useToast,
    Select,
    Heading
} from '@chakra-ui/react';
import { useTaskStore } from '@/store/taskStore';
import { TaskCreateData } from '@/types';

// Task ID: <taskId_placeholder>
// Agent Role: PresentationLayerSpecialist
// Request ID: <requestId_placeholder>
// Timestamp: <timestamp_placeholder>

const AddTaskForm: React.FC<{ initialParentId?: string | null; onClose?: () => void }> = ({ initialParentId = null, onClose }) => {
    const addTask = useTaskStore(state => state.addTask);
    const projects = useTaskStore(state => state.projects);
    const agents = useTaskStore(state => state.agents);
    const tasks = useTaskStore(state => state.tasks);
    const fetchTasks = useTaskStore(state => state.fetchTasks);
    const fetchProjectsAndAgents = useTaskStore(state => state.fetchProjectsAndAgents);
    const toast = useToast();
    
    const [formData, setFormData] = useState<TaskCreateData>({
        title: '',
        description: null,
        completed: false,
        project_id: null,
        agent_id: null,
        parent_task_id: initialParentId
    });

    useEffect(() => {
        fetchProjectsAndAgents();
        fetchTasks();
    }, [fetchProjectsAndAgents, fetchTasks]);

    useEffect(() => {
        if (initialParentId) {
            setFormData(prev => ({ ...prev, parent_task_id: initialParentId }));
        }
    }, [initialParentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addTask(formData);
            setFormData({
                title: '',
                description: null,
                completed: false,
                project_id: null,
                agent_id: null,
                parent_task_id: initialParentId
            });
            toast({
                title: 'Task added successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            if (onClose) {
                onClose();
            }
        } catch (error) {
            toast({
                title: 'Error adding task',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleChange = (field: keyof TaskCreateData, value: string | number | null | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Box 
            as="form" 
            onSubmit={handleSubmit} 
            bg="bg.surface"
            p={6} 
            rounded="lg" 
            shadow="lg" 
            borderWidth="1px" 
            borderColor="border.base"
        >
            <VStack spacing={4}>
                <Heading size="md" color="text.primary" mb={2} textAlign="center">
                    Trigger New Work Item
                </Heading>

                <FormControl isRequired>
                    <FormLabel color="text.primary">Title</FormLabel>
                    <Input
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Enter task title"
                        bg="bg.input"
                        color="text.primary"
                        borderColor="border.input"
                        _hover={{ borderColor: "border.input_hover" }}
                        _focus={{ borderColor: "border.focus", boxShadow: "outline" }}
                        _placeholder={{ color: "text.placeholder" }}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel color="text.primary">Description</FormLabel>
                    <Textarea
                        value={formData.description || ''}
                        onChange={(e) => handleChange('description', e.target.value || null)}
                        placeholder="Enter task description"
                        bg="bg.input"
                        color="text.primary"
                        borderColor="border.input"
                        _hover={{ borderColor: "border.input_hover" }}
                        _focus={{ borderColor: "border.focus", boxShadow: "outline" }}
                        _placeholder={{ color: "text.placeholder" }}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel color="text.primary">Project</FormLabel>
                    <Select 
                        value={formData.project_id || ''}
                        onChange={(e) => handleChange('project_id', e.target.value || null)}
                        placeholder="Select project"
                        bg="bg.input"
                        color="text.primary"
                        borderColor="border.input"
                        _hover={{ borderColor: "border.input_hover" }}
                        _focus={{ borderColor: "border.focus", boxShadow: "outline" }}
                        _placeholder={{ color: "text.placeholder" }}
                    >
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl>
                    <FormLabel color="text.primary">Agent</FormLabel>
                    <Select 
                        value={formData.agent_id || ''}
                        onChange={(e) => handleChange('agent_id', e.target.value || null)}
                        placeholder="Select agent"
                        bg="bg.input"
                        color="text.primary"
                        borderColor="border.input"
                        _hover={{ borderColor: "border.input_hover" }}
                        _focus={{ borderColor: "border.focus", boxShadow: "outline" }}
                        _placeholder={{ color: "text.placeholder" }}
                    >
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>
                                {agent.name}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl isDisabled={!!initialParentId}>
                    <FormLabel color="text.primary">Parent Task (Optional)</FormLabel>
                    <Select 
                        value={formData.parent_task_id || ''}
                        onChange={(e) => handleChange('parent_task_id', e.target.value || null)}
                        placeholder="Select parent task"
                        bg="bg.input"
                        color="text.primary"
                        borderColor="border.input"
                        _hover={{ borderColor: "border.input_hover" }}
                        _focus={{ borderColor: "border.focus", boxShadow: "outline" }}
                        _placeholder={{ color: "text.placeholder" }}
                    >
                        {tasks.map(task => (
                            <option key={task.id} value={task.id}>
                                {task.title} (ID: {task.id})
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <Button 
                    type="submit" 
                    bg="bg.button.primary"
                    color="text.button.primary"
                    width="full"
                    size="lg"
                    _hover={{ bg: "bg.button.primary.hover" }}
                >
                    Trigger New Work Item
                </Button>
            </VStack>
        </Box>
    );
};

export default AddTaskForm;
