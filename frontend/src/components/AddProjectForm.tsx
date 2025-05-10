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
    Heading
} from '@chakra-ui/react';
import { useProjectStore } from '@/store/projectStore';
import { ProjectCreateData } from '@/types';

const AddProjectForm: React.FC = () => {
    const addProject = useProjectStore(state => state.addProject);
    const toast = useToast();
    const [formData, setFormData] = useState<ProjectCreateData>({
        name: '',
        description: null
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addProject(formData);
            setFormData({
                name: '',
                description: null
            });
            toast({
                title: 'Project added successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error adding project',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleChange = (field: keyof ProjectCreateData, value: string | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Box 
            as="form" 
            onSubmit={handleSubmit} 
            bg="gray.800" 
            p={6} 
            rounded="lg" 
            shadow="lg" 
            borderWidth="1px" 
            borderColor="gray.700"
        >
            <VStack spacing={4}>
                <Heading size="md" color="whiteAlpha.900" mb={2} textAlign="center">
                    Define New Initiative
                </Heading>

                <FormControl isRequired>
                    <FormLabel color="gray.100">Name</FormLabel>
                    <Input
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter project name"
                        bg="gray.700"
                        color="white"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                        _placeholder={{ color: "gray.400" }}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel color="gray.100">Description</FormLabel>
                    <Textarea
                        value={formData.description || ''}
                        onChange={(e) => handleChange('description', e.target.value || null)}
                        placeholder="Enter project description"
                        bg="gray.700"
                        color="white"
                        borderColor="gray.600"
                        _hover={{ borderColor: "gray.500" }}
                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }}
                        _placeholder={{ color: "gray.400" }}
                    />
                </FormControl>

                <Button 
                    type="submit" 
                    colorScheme="blue" 
                    width="full"
                    size="lg"
                    _hover={{ bg: "blue.500" }}
                    _active={{ bg: "blue.600" }}
                >
                    Define New Initiative
                </Button>
            </VStack>
        </Box>
    );
};

export default AddProjectForm; 