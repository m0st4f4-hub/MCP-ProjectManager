'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast
} from '@chakra-ui/react';
import { useAgentStore } from '@/store/agentStore';
import { AgentCreateData } from '@/types';

const AddAgentForm: React.FC = () => {
    const addAgent = useAgentStore(state => state.addAgent);
    const toast = useToast();
    const [formData, setFormData] = useState<AgentCreateData>({
        name: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addAgent(formData);
            setFormData({
                name: ''
            });
            toast({
                title: 'Agent added successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error adding agent',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleChange = (field: keyof AgentCreateData, value: string) => {
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
                <FormControl isRequired>
                    <FormLabel color="gray.100">Name</FormLabel>
                    <Input
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter agent name"
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
                    Add Agent
                </Button>
            </VStack>
        </Box>
    );
};

export default AddAgentForm; 