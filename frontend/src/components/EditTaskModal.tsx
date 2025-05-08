// D:\mcp\task-manager\frontend\src\components\EditTaskModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Checkbox,
    Select,
    useToast,
} from '@chakra-ui/react';
import { Task, TaskUpdateData } from '@/services/api';
import { useTaskStore } from '@/store/taskStore';
import EditModalBase from './common/EditModalBase';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onUpdate: (id: number, data: TaskUpdateData) => Promise<void>;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
    isOpen,
    onClose,
    task,
    onUpdate,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [completed, setCompleted] = useState(false);
    const [projectId, setProjectId] = useState<string>('');
    const [agentName, setAgentName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    // Get projects, agents from store (remove scopes)
    const projects = useTaskStore((state) => state.projects);
    const agents = useTaskStore((state) => state.agents);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setCompleted(task.completed);
            setProjectId(task.project_id?.toString() || '');
            setAgentName(task.agent_name || '');
        } else {
            // Reset form when modal is closed or task is null
            setTitle('');
            setDescription('');
            setCompleted(false);
            setProjectId('');
            setAgentName('');
        }
    }, [task, isOpen]); // Rerun effect when task or isOpen changes

    const handleSave = async () => {
        if (!task) return;
        setIsLoading(true);
        const updateData: TaskUpdateData = {
            title,
            description: description || undefined,
            completed,
            project_id: projectId ? parseInt(projectId, 10) : null, // Send null if empty
            agent_name: agentName || null, // Send null if empty
        };

        try {
            await onUpdate(task.id, updateData);
            toast({
                title: 'Task updated successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            // onClose(); // Store action handles closing on success
        } catch (error: unknown) {
            console.error("Failed to update task:", error);
            const message = error instanceof Error ? error.message : 'Could not update the task.';
            toast({
                title: 'Update failed',
                description: message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Prevent rendering if no task is selected
    if (!task) return null;

    return (
        <EditModalBase<Task>
            isOpen={isOpen}
            onClose={onClose}
            entityName="Task"
            entityData={task}
            entityDisplayField="title"
            onSave={handleSave}
            isLoadingSave={isLoading}
            size="xl" // Keep the larger size for task modal
            hideDeleteButton={true} // No delete button in this specific modal
        >
            {/* Pass all form fields as children */}
            <FormControl isRequired>
                <FormLabel color="text.secondary">Title</FormLabel>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task Title"
                    bg="bg.default"
                    borderColor="border.default"
                    focusBorderColor="brand.primary"
                />
            </FormControl>

            <FormControl>
                <FormLabel color="text.secondary">Description</FormLabel>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task Description"
                    bg="bg.default"
                    borderColor="border.default"
                    focusBorderColor="brand.primary"
                />
            </FormControl>

            <FormControl>
                <FormLabel color="text.secondary">Project</FormLabel>
                <Select 
                    placeholder="-- Select Project --"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    bg="bg.default"
                    borderColor="border.default"
                    focusBorderColor="brand.primary"
                >
                    <option value="">-- Clear Project --</option> {/* Option to clear */}
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
            </FormControl>

            <FormControl>
                <FormLabel color="text.secondary">Agent</FormLabel>
                <Select 
                    placeholder="-- Select Agent --"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    bg="bg.default"
                    borderColor="border.default"
                    focusBorderColor="brand.primary"
                >
                     <option value="">-- Clear Agent --</option> {/* Option to clear */}
                    {agents.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </Select>
            </FormControl>

            <FormControl display="flex" alignItems="center">
                <Checkbox
                    isChecked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                    colorScheme="green" // Or brand color
                    borderColor="border.default"
                    mr={3}
                 >
                    Completed
                </Checkbox>
            </FormControl>
        </EditModalBase>
    );
};

export default EditTaskModal;
