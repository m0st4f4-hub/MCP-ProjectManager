'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast,
} from '@chakra-ui/react';

interface AddAgentFormProps {
    onClose: () => void;
    onSubmit: (name: string) => Promise<void>; // Parent (AgentList) provides this
    initialData: { name: string };
}

const AddAgentForm: React.FC<AddAgentFormProps> = ({ onClose, onSubmit, initialData }) => {
    const [name, setName] = useState(initialData.name);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            await onSubmit(name.trim()); // Call the onSubmit passed from props
            // Call onClose after successful submission
            onClose(); 
        } catch (error) {
            // Error is caught and displayed here, error is re-thrown from store
            toast({
                title: 'Error registering agent',
                description: error instanceof Error ? error.message : 'Could not register agent.',
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
                    bg="bg.button.primary"
                    color="text.button.primary"
                    _hover={{ bg: "bg.button.primary.hover" }}
                    width="full"
                    size="lg"
                    isLoading={isLoading}
                    mt={4}
                >
                    Register Agent
                </Button>
            </VStack>
        </Box>
    );
};

export default AddAgentForm; 