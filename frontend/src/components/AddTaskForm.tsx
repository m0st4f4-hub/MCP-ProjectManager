// D:\mcp\task-manager\frontend\src\components\AddTaskForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { TaskCreateData } from '@/services/api';
import { useTaskStore } from '@/store/taskStore';
import {
    Box,
    Input,
    Button,
    Textarea,
    FormControl,
    FormLabel,
    VStack,
    Select,
    useToast,
} from '@chakra-ui/react';
import { useShallow } from 'zustand/react/shallow';

interface AddTaskFormProps {
    onTaskAdded?: () => void; // Optional callback for when a task is successfully added
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState<string>('');
    const [agentName, setAgentName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Get projects, agents, scopes from store for dropdowns
    const { projects, agents, addTask, fetchProjects, fetchAgents } = useTaskStore(
        useShallow(state => ({
            projects: state.projects,
            agents: state.agents,
            addTask: state.addTask,
            fetchProjects: state.fetchProjects,
            fetchAgents: state.fetchAgents,
        }))
    );
    const toast = useToast();

    useEffect(() => {
        if (projects.length === 0) {
            fetchProjects();
        }
        if (agents.length === 0) {
            fetchAgents();
        }
    }, [projects.length, agents.length, fetchProjects, fetchAgents]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
             toast({ title: "Title is required", status: "warning", duration: 3000, isClosable: true });
             return;
        }
        setIsLoading(true);
        const taskData: TaskCreateData = {
            title,
            description: description || undefined,
            project_id: projectId ? parseInt(projectId, 10) : undefined,
            agent_name: agentName || undefined,
        };
        try {
            await addTask(taskData);
            setTitle('');
            setDescription('');
            setProjectId('');
            setAgentName('');
            toast({ title: "Task added successfully!", status: "success", duration: 3000, isClosable: true });
            if (onTaskAdded) {
                onTaskAdded(); // Call the callback if provided
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred';
             toast({ title: "Failed to add task", description: message, status: "error", duration: 5000, isClosable: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit} width="100%">
            <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter task title" 
                        focusBorderColor="brand.primary"
                        bg="bg.surface"
                    />
                </FormControl>
                <FormControl>
                    <FormLabel>Description (Optional)</FormLabel>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter task description" 
                        focusBorderColor="brand.primary"
                        bg="bg.surface"
                    />
                </FormControl>
                 <FormControl>
                    <FormLabel>Project (Optional)</FormLabel>
                    <Select 
                        placeholder="- Select Project -" 
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        focusBorderColor="brand.primary"
                        bg="bg.surface"
                    >
                        {projects.map(project => (
                            <option key={project.id} value={project.id.toString()}>
                                {project.name}
                            </option>
                        ))}
                    </Select>
                </FormControl>
                <FormControl>
                    <FormLabel>Agent (Optional)</FormLabel>
                    <Select 
                        placeholder="- Select Agent -" 
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        focusBorderColor="brand.primary"
                        bg="bg.surface"
                    >
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.name}>
                                {agent.name}
                            </option>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isLoading}
                    loadingText="Adding..."
                    width="full"
                >
                    Add Task
                </Button>
            </VStack>
        </Box>
    );
};

export default AddTaskForm;
