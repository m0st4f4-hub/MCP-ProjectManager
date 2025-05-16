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
import { Task, TaskUpdateData, TaskStatus } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import EditModalBase from '../common/EditModalBase';
import styles from './EditTaskModal.module.css';
import { clsx } from 'clsx';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onUpdate: (id: string, data: TaskUpdateData) => Promise<void>;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
    isOpen,
    onClose,
    task,
    onUpdate,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState<string>('');
    const [agentName, setAgentName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    // Get projects, agents, and all tasks from store
    const projects = useTaskStore((state) => state.projects);
    const agents = useTaskStore((state) => state.agents);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setProjectId(task.project_id?.toString() || '');
            setAgentName(task.agent_name || '');
        } else {
            // Reset form when modal is closed or task is null
            setTitle('');
            setDescription('');
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
            project_id: projectId ? projectId : undefined,
            agent_name: agentName || undefined,
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
            <FormControl isRequired className={styles.formControl}>
                <FormLabel className={styles.formLabel}>Title</FormLabel>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task Title"
                    className={styles.formInput}
                />
            </FormControl>

            <FormControl className={styles.formControl}>
                <FormLabel className={styles.formLabel}>Description</FormLabel>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task Description"
                    className={styles.formTextarea}
                />
            </FormControl>

            <FormControl className={styles.formControl}>
                <FormLabel className={styles.formLabel}>Project</FormLabel>
                <Select 
                    value={projectId} 
                    onChange={e => setProjectId(e.target.value)}
                    className={styles.formSelect}
                >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                </Select>
            </FormControl>

            <FormControl className={styles.formControl}>
                <FormLabel className={styles.formLabel}>Agent</FormLabel>
                <Select 
                    value={agentName} // Agent select should bind to agent_id or agent_name depending on how it's handled.
                                        // Assuming agent_name is used here for simplicity, but agent_id is more robust.
                    onChange={e => setAgentName(e.target.value)} 
                    className={styles.formSelect}
                >
                    <option value="">Select an agent</option>
                    {agents.map(agent => (
                        <option key={agent.id} value={agent.name}>{agent.name}</option>
                    ))}
                </Select>
            </FormControl>

            <FormControl className={clsx(styles.formControl, styles.checkboxControlContainer)}>
                <Checkbox
                    isChecked={task ? task.status === TaskStatus.COMPLETED : false}
                    onChange={(e) => {
                        if (!task) return;
                        const newStatus = e.target.checked ? TaskStatus.COMPLETED : TaskStatus.TODO;
                        onUpdate(task.id, { status: newStatus });
                    }}
                    colorScheme="brand" // Keep colorScheme for Chakra's Checkbox theming
                 >
                    Completed
                </Checkbox>
                {/* <FormLabel htmlFor="completed-checkbox" className={styles.checkboxLabel}>Completed</FormLabel> */}
            </FormControl>

            <FormControl className={styles.formControl}>
                <FormLabel className={styles.formLabel}>Agent Name (Current)</FormLabel>
                <Input 
                    value={agentName} 
                    isReadOnly 
                    className={clsx(styles.formInput, styles.readOnlyInput)} 
                />
            </FormControl>
        </EditModalBase>
    );
};

export default EditTaskModal;
