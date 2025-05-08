'use client';

import React, { useState } from 'react';
import { AgentCreateData } from '@/services/api';
import { useTaskStore } from '@/store/taskStore';
import {
    Box,
    Input,
    Button,
    FormControl,
    FormLabel,
    VStack,
    Heading,
    useToast,
} from '@chakra-ui/react';

interface AddAgentFormProps {
    addAgent: (agentData: AgentCreateData) => Promise<void>;
}

const AddAgentForm: React.FC<AddAgentFormProps> = ({ addAgent }) => {
    const [name, setName] = useState('');
    const isLoading = useTaskStore((state) => state.loadingCreateAgent);
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast({ title: "Agent name is required", status: "warning", duration: 3000, isClosable: true });
            return;
        }
        
        const agentData: AgentCreateData = {
            name: name.trim(),
        };

        try {
            await addAgent(agentData);
            setName('');
            toast({ title: "Agent added successfully", status: "success", duration: 3000, isClosable: true });
        } catch (error: unknown) {
            console.error("Failed to add agent:", error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            toast({ title: "Failed to add agent", description: message, status: "error", duration: 5000, isClosable: true });
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit} p={4} borderWidth="1px" borderRadius="lg" borderColor="border.default" bg="bg.surface">
            <VStack spacing={4} align="stretch">
                 <Heading size="sm" mb={2} color="text.secondary">Add New Agent</Heading>
                <FormControl isRequired>
                    <FormLabel color="text.secondary">Agent Name</FormLabel>
                    <Input
                        placeholder="Enter agent name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        bg="bg.default"
                        borderColor="border.default"
                        focusBorderColor="brand.primary"
                        isDisabled={isLoading}
                    />
                </FormControl>

                <Button
                    type="submit"
                    colorScheme="teal" // Use another color scheme
                    isLoading={isLoading}
                    loadingText="Adding..."
                >
                    Add Agent
                </Button>
            </VStack>
        </Box>
    );
};

export default AddAgentForm; 