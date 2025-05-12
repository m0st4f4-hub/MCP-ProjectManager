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
import { useProjectStore } from '@/store/projectStore';
import { ProjectCreateData } from '@/types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectCreateSchema } from '@/types/project';

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
            bg="bg.surface"
            p={6} 
            rounded="lg" 
            shadow="lg" 
            borderWidth="1px" 
            borderColor="border.base"
        >
            <VStack spacing={4}>
                <Heading size="md" color="text.primary" mb={2} textAlign="center">
                    Define New Initiative
                </Heading>

                <FormControl isInvalid={!!errors.name}>
                    <FormLabel color="text.primary">Name</FormLabel>
                    <Input
                        id="name"
                        {...register('name')}
                        placeholder="Enter project name"
                        bg="bg.input"
                        color="text.primary"
                        borderColor="border.input"
                        _hover={{ borderColor: "border.input_hover" }}
                        _focus={{ borderColor: "border.focus", boxShadow: "outline" }}
                        _placeholder={{ color: "text.placeholder" }}
                    />
                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.description}>
                    <FormLabel color="text.primary">Description</FormLabel>
                    <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Enter project description"
                        bg="bg.input"
                        color="text.primary"
                        borderColor="border.input"
                        _hover={{ borderColor: "border.input_hover" }}
                        _focus={{ borderColor: "border.focus", boxShadow: "outline" }}
                        _placeholder={{ color: "text.placeholder" }}
                    />
                    <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
                </FormControl>

                <Button 
                    type="submit" 
                    bg="bg.button.primary"
                    color="text.button.primary"
                    _hover={{ bg: "bg.button.primary.hover" }}
                    width="full"
                    size="lg"
                    isLoading={isLoading}
                >
                    Define New Initiative
                </Button>
            </VStack>
        </Box>
    );
};

export default AddProjectForm; 