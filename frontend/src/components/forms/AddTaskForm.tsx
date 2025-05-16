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
import { TaskCreateData, TaskStatus } from '@/types';
import styles from './AddTaskForm.module.css'; // Import CSS module

// Task ID: <taskId_placeholder>
// Agent Role: PresentationLayerSpecialist
// Request ID: <requestId_placeholder>
// Timestamp: <timestamp_placeholder>

const AddTaskForm: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
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
        project_id: null,
        agent_id: null,
        status: TaskStatus.PENDING
    });

    useEffect(() => {
        fetchProjectsAndAgents();
        fetchTasks().then(() => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`AddTaskForm: Fetched ${tasks.length} tasks.`);
            }
        });
    }, [fetchProjectsAndAgents, fetchTasks, tasks]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addTask(formData);
            setFormData({
                title: '',
                description: null,
                project_id: null,
                agent_id: null,
                status: TaskStatus.PENDING
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
            className={styles.addTaskFormContainer} // Applied container styles
        >
            <VStack spacing={4} className={styles.formVStack}> {/* Kept spacing prop, added class for potential future use */}
                <Heading size="md" className={styles.formHeading}> {/* Applied heading styles, kept size prop */}
                    Trigger New Work Item
                </Heading>

                <FormControl isRequired>
                    <FormLabel className={styles.formLabel}>Title</FormLabel> {/* Applied label style */}
                    <Input
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Enter task title"
                        className={styles.formInput} // Applied input styles
                        // Removed: bg, color, borderColor, _hover, _focus, _placeholder
                    />
                </FormControl>

                <FormControl>
                    <FormLabel className={styles.formLabel}>Description</FormLabel> {/* Applied label style */}
                    <Textarea
                        value={formData.description || ''}
                        onChange={(e) => handleChange('description', e.target.value || null)}
                        placeholder="Enter task description"
                        className={styles.formTextarea} // Applied textarea styles (shares with input)
                        // Removed: bg, color, borderColor, _hover, _focus, _placeholder
                    />
                </FormControl>

                <FormControl>
                    <FormLabel className={styles.formLabel}>Project</FormLabel> {/* Applied label style */}
                    <Select 
                        value={formData.project_id || ''}
                        onChange={(e) => handleChange('project_id', e.target.value || null)}
                        placeholder="Select project"
                        className={styles.formSelect} // Applied select styles (shares with input)
                        // Removed: bg, color, borderColor, _hover, _focus, _placeholder
                    >
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl>
                    <FormLabel className={styles.formLabel}>Agent</FormLabel> {/* Applied label style */}
                    <Select 
                        value={formData.agent_id || ''}
                        onChange={(e) => handleChange('agent_id', e.target.value || null)}
                        placeholder="Select agent"
                        className={styles.formSelect} // Applied select styles (shares with input)
                        // Removed: bg, color, borderColor, _hover, _focus, _placeholder
                    >
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>
                                {agent.name}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                <Button 
                    type="submit" 
                    className={styles.submitButton} // Applied button styles
                    // Removed: bg, color, width, size, _hover
                >
                    Trigger New Work Item
                </Button>
            </VStack>
        </Box>
    );
};

export default AddTaskForm;
