'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    useToast,
    Heading,
    FormErrorMessage
} from '@chakra-ui/react';
import { ProjectCreateData } from '@/types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectCreateSchema } from '@/types/project';
import styles from './AddProjectForm.module.css';

interface AddProjectFormProps {
    onSubmit: (data: ProjectCreateData) => Promise<void>;
    onClose: () => void;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({ onSubmit, onClose }) => {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProjectCreateData>({
        resolver: zodResolver(projectCreateSchema),
    });

    const handleFormSubmit: SubmitHandler<ProjectCreateData> = async (data) => {
        setIsLoading(true);
        try {
            await onSubmit(data);
            onClose(); // Close modal on success
        } catch (error) {
            toast({
                title: 'Error adding project',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            as="form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className={styles.addProjectFormContainer}
        >
            <VStack className={styles.formVStack}>
                <Heading className={styles.formHeading}>
                    Define New Initiative
                </Heading>

                <FormControl isInvalid={!!errors.name}>
                    <FormLabel htmlFor="name" className={styles.formLabel}>Name</FormLabel>
                    <Input
                        id="name"
                        {...register('name')}
                        placeholder="Enter project name"
                        className={styles.formInput}
                    />
                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.description}>
                    <FormLabel htmlFor="description" className={styles.formLabel}>Description</FormLabel>
                    <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Enter project description"
                        className={styles.formTextarea}
                    />
                    <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                </FormControl>

                <Button
                    type="submit"
                    className={styles.submitButton}
                    isLoading={isLoading}
                >
                    Define New Initiative
                </Button>
            </VStack>
        </Box>
    );
};

export default AddProjectForm; 