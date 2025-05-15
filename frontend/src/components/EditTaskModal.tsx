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
    const [parentTaskId, setParentTaskId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    // Get projects, agents, and all tasks from store
    const projects = useTaskStore((state) => state.projects);
    const agents = useTaskStore((state) => state.agents);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setCompleted(task.completed);
            setProjectId(task.project_id?.toString() || '');
            setAgentName(task.agent_name || '');
            setParentTaskId(task.parent_task_id?.toString() || '');
        } else {
            // Reset form when modal is closed or task is null
            setTitle('');
            setDescription('');
            setCompleted(false);
            setProjectId('');
            setAgentName('');
            setParentTaskId('');
        }
    }, [task, isOpen]); // Rerun effect when task or isOpen changes

    const handleSave = async () => {
        if (!task) return;
        setIsLoading(true);
        const updateData: TaskUpdateData = {
            title,
            description: description || undefined,
            completed,
            project_id: projectId ? parseInt(projectId, 10) : undefined,
            agent_name: agentName || undefined,
            parent_task_id: parentTaskId ? parseInt(parentTaskId, 10) : null,
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
                <FormLabel>Title</FormLabel>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task Title"
                />
            </FormControl>

            <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task Description"
                />
            </FormControl>

            <FormControl>
                <FormLabel>Project</FormLabel>
                <Select value={projectId} onChange={e => setProjectId(e.target.value)}>
                    <option value="">Select a project</option>
                    {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                </Select>
            </FormControl>

            <FormControl>
                <FormLabel>Agent</FormLabel>
                <Select value={agentName} onChange={e => setAgentName(e.target.value)}>
                    <option value="">Select an agent</option>
                    {agents.map(agent => (
                        <option key={agent.id} value={agent.name}>{agent.name}</option>
                    ))}
                </Select>
            </FormControl>

            <FormControl display="flex" alignItems="center">
                <Checkbox
                    isChecked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                 >
                    Completed
                </Checkbox>
            </FormControl>

            <FormControl>
                <FormLabel>Agent Name</FormLabel>
                <Input value={agentName} isReadOnly />
            </FormControl>

            {parentTaskId && (
                <FormControl>
                    <FormLabel>Parent Task ID</FormLabel>
                    <Input value={parentTaskId} isReadOnly />
                </FormControl>
            )}
        </EditModalBase>
    );
};

export default EditTaskModal;
