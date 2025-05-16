'use client';

import React, { useEffect } from 'react';
import {
    VStack,
    Box,
    Text,
    Badge,
    IconButton,
    HStack,
    Spacer,
    useToast
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useAgentStore } from '@/store/agentStore';
import { useTaskStore } from '@/store/taskStore';
import { Agent } from '@/types';

const AgentList: React.FC = () => {
    const agents = useAgentStore(state => state.agents);
    const loading = useAgentStore(state => state.loading);
    const fetchAgents = useAgentStore(state => state.fetchAgents);
    const removeAgent = useAgentStore(state => state.removeAgent);
    const tasks = useTaskStore(state => state.tasks);
    const toast = useToast();

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    const getAgentStats = (agentName: string) => {
        const agentTasks = tasks.filter(task => task.agent_name === agentName);
        const completedTasks = agentTasks.filter(task => task.completed);
        return {
            totalTasks: agentTasks.length,
            completedTasks: completedTasks.length,
            activeProjects: new Set(agentTasks.map(task => task.project_id).filter(Boolean)).size
        };
    };

    const handleDelete = async (agent: Agent) => {
        try {
            await removeAgent(agent.id);
            toast({
                title: 'Agent deleted',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error deleting agent',
                description: error instanceof Error ? error.message : 'An error occurred',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    if (loading) {
        return (
            <VStack spacing={4} align="stretch">
                {[1, 2, 3].map(i => (
                    <Box key={i} p={4} bg="gray.700" rounded="lg" shadow="lg" borderWidth="1px" borderColor="gray.600">
                        <Box height="20px" width="60%" bg="gray.600" rounded="md" mb={2} />
                        <Box height="8px" width="40%" bg="gray.600" rounded="md" />
                    </Box>
                ))}
            </VStack>
        );
    }

    if (!agents.length) {
        return (
            <Box textAlign="center" py={8} bg="gray.700" rounded="lg" shadow="lg" borderWidth="1px" borderColor="gray.600">
                <Text color="gray.300">No agents found</Text>
            </Box>
        );
    }

    return (
        <VStack spacing={4} align="stretch">
            {agents.map(agent => {
                const stats = getAgentStats(agent.name);
                return (
                    <Box
                        key={agent.id}
                        p={4}
                        bg="gray.700"
                        rounded="lg"
                        shadow="lg"
                        borderWidth="1px"
                        borderColor="gray.600"
                        _hover={{ shadow: "xl", borderColor: "blue.400", transform: "translateY(-1px)" }}
                        transition="all 0.2s ease-in-out"
                        position="relative"
                        overflow="hidden"
                        _before={{
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            bg: "blue.400",
                            opacity: 0.7
                        }}
                    >
                        <HStack mb={2}>
                            <Text fontWeight="medium" fontSize="md" color="white">{agent.name}</Text>
                            <Spacer />
                            <IconButton
                                icon={<DeleteIcon />}
                                aria-label="Delete agent"
                                variant="ghost"
                                colorScheme="red"
                                size="sm"
                                color="gray.100"
                                _hover={{ bg: 'red.500', color: 'white' }}
                                onClick={() => handleDelete(agent)}
                            />
                        </HStack>
                        <HStack spacing={2} mt={2}>
                            <Badge colorScheme="blue" variant="solid">
                                Tasks: {stats.totalTasks}
                            </Badge>
                            <Badge colorScheme="green" variant="solid">
                                Completed: {stats.completedTasks}
                            </Badge>
                            <Badge colorScheme="purple" variant="solid">
                                Projects: {stats.activeProjects}
                            </Badge>
                        </HStack>
                    </Box>
                );
            })}
        </VStack>
    );
};

export default React.memo(AgentList); 