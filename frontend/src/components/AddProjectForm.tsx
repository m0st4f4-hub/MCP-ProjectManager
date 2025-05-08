'use client';

import React, { useState } from 'react';
import { ProjectCreateData } from '@/services/api';
import { useTaskStore } from '@/store/taskStore';
import {
    Input,
    Textarea,
    FormControl,
    FormLabel,
    useToast,
} from '@chakra-ui/react';
import AddFormBase from './common/AddFormBase';

interface AddProjectFormProps {
    // Prop to receive the store action
    addProject: (projectData: ProjectCreateData) => Promise<void>;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({ addProject }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const isLoading = useTaskStore((state) => state.loadingCreateProject);
    const toast = useToast();

    const handleSubmit = async (_e: React.FormEvent) => {
        if (!name.trim()) {
             toast({ title: "Project name is required", status: "warning", duration: 3000, isClosable: true });
             return;
        }
        
        const projectData: ProjectCreateData = {
            name: name.trim(),
            description: description.trim() || undefined,
        };

        try {
            await addProject(projectData); // Call the action passed via props
            setName('');
            setDescription('');
            toast({ title: "Project added successfully", status: "success", duration: 3000, isClosable: true });
        } catch (error: unknown) {
            console.error("Failed to add project:", error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast({ title: "Failed to add project", description: message, status: "error", duration: 5000, isClosable: true });
        }
    };

    return (
        <AddFormBase
            formTitle="Add New Project"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitButtonText="Add Project"
            submitButtonColorScheme="green"
        >
            <FormControl isRequired>
                <FormLabel color="text.secondary">Project Name</FormLabel>
                <Input
                    placeholder="Enter project name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    bg="bg.default"
                    borderColor="border.default"
                    focusBorderColor="brand.primary"
                    isDisabled={isLoading}
                />
            </FormControl>

            <FormControl>
                <FormLabel color="text.secondary">Description (Optional)</FormLabel>
                <Textarea
                    placeholder="Enter project description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    bg="bg.default"
                    borderColor="border.default"
                    focusBorderColor="brand.primary"
                    isDisabled={isLoading}
                />
            </FormControl>
        </AddFormBase>
    );
};

export default AddProjectForm; 