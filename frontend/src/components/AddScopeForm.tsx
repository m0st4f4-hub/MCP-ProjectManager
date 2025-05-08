'use client';

import React, { useState } from 'react';
import { ScopeCreateData } from '@/services/api';
import { useTaskStore } from '@/store/taskStore';
import {
    Box,
    Input,
    Button,
    Textarea,
    FormControl,
    FormLabel,
    VStack,
    Heading,
    useToast,
} from '@chakra-ui/react';

interface AddScopeFormProps {
    addScope: (scopeData: ScopeCreateData) => Promise<void>;
}

const AddScopeForm: React.FC<AddScopeFormProps> = ({ addScope }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const isLoading = useTaskStore((state) => state.loadingCreateScope);
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({ title: "Scope name is required", status: "warning", duration: 3000, isClosable: true });
            return;
        }
        
        const scopeData: ScopeCreateData = {
            name: name.trim(),
            description: description.trim() || undefined,
        };

        try {
            await addScope(scopeData);
            setName('');
            setDescription('');
            toast({ title: "Scope added successfully", status: "success", duration: 3000, isClosable: true });
        } catch (error: unknown) {
            console.error("Failed to add scope:", error);
            const message = error instanceof Error ? error.message : 'Unknown error';
             toast({ title: "Failed to add scope", description: message, status: "error", duration: 5000, isClosable: true });
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit} p={4} borderWidth="1px" borderRadius="lg" borderColor="border.default" bg="bg.surface">
            <VStack spacing={4} align="stretch">
                <Heading size="sm" mb={2} color="text.secondary">Add New Scope</Heading>
                <FormControl isRequired>
                    <FormLabel color="text.secondary">Scope Name</FormLabel>
                    <Input
                        placeholder="Enter scope name..."
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
                        placeholder="Enter scope description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        bg="bg.default"
                        borderColor="border.default"
                        focusBorderColor="brand.primary"
                        isDisabled={isLoading}
                    />
                </FormControl>

                <Button
                    type="submit"
                    colorScheme="purple" // Use purple color scheme
                    isLoading={isLoading}
                    loadingText="Adding..."
                >
                    Add Scope
                </Button>
            </VStack>
        </Box>
    );
};

export default AddScopeForm; 