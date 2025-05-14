'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast,
} from '@chakra-ui/react';
import { Agent } from '@/types'; // Assuming Agent type is available

interface EditAgentFormProps {
    agent: Agent | null; // Agent to edit, null if none selected
    onClose: () => void;
    onSubmit: (agentId: string, newName: string) => Promise<void>; 
    initialAgentName?: string;
}

const EditAgentForm: React.FC<EditAgentFormProps> = ({ agent, onClose, onSubmit, initialAgentName }) => {
    const [name, setName] = useState(initialAgentName || '');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (agent) {
            setName(agent.name);
        }
    }, [agent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agent) {
            toast({
                title: 'No agent selected for editing.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        if (!name.trim()) {
            toast({
                title: 'Agent name cannot be empty.',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        setIsLoading(true);
        try {
            await onSubmit(agent.id, name.trim());
            // Parent component (AgentList modal) will handle closing and success toast
            // Call onClose after successful submission
            onClose(); 
        } catch (error) {
            toast({
                title: 'Error updating agent',
                description: error instanceof Error ? error.message : 'Could not update agent.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!agent) {
        // Optionally, render a loading state or null if no agent is passed yet
        // This case should ideally be handled by the parent controlling the modal visibility
        return <Box>Loading agent data...</Box>; 
    }

    return (
        <Box
            as="form"
            onSubmit={handleSubmit}
        >
            <VStack spacing={4}>
                <FormControl isRequired>
                    <FormLabel color="text.primary">Agent Name</FormLabel>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter unique agent name"
                        bg="bg.input"
                        color="text.primary"
                        borderColor="border.input"
                        _hover={{ borderColor: "border.input_hover" }}
                        _focus={{ borderColor: "border.focus", boxShadow: "outline" }}
                        _placeholder={{ color: "text.placeholder" }}
                    />
                </FormControl>

                <Button
                    type="submit"
                    bg="bg.button.accent"
                    color="text.button.accent"
                    _hover={{ bg: "bg.button.accent.hover" }}
                    width="full"
                    size="lg"
                    isLoading={isLoading}
                    mt={4}
                >
                    Update Agent
                </Button>
            </VStack>
        </Box>
    );
};

export default EditAgentForm; 