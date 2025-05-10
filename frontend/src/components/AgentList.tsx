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
    useToast,
    Menu,
    MenuButton,
    MenuList,
    MenuItem
} from '@chakra-ui/react';
import { DeleteIcon, HamburgerIcon, CopyIcon, CheckCircleIcon, ViewIcon } from '@chakra-ui/icons';
import { useAgentStore } from '@/store/agentStore';
import { useTaskStore } from '@/store/taskStore';
import { Agent, TaskFilters } from '@/types';
import { formatDisplayName } from '@/lib/utils';

const ACCENT_COLOR = "#dad2cc";
const IDLE_TEXT_COLOR = "gray.400";

const AgentList: React.FC = () => {
    const agents = useAgentStore(state => state.agents);
    const loading = useAgentStore(state => state.loading);
    const fetchAgents = useAgentStore(state => state.fetchAgents);
    const removeAgent = useAgentStore(state => state.removeAgent);
    const tasks = useTaskStore(state => state.tasks);
    const globalFilters = useTaskStore(state => state.filters);
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

    const filteredAgents = React.useMemo(() => {
        if (!agents) return [];
        return agents.filter(agent => {
            if (!agent) return false;

            if (globalFilters.searchTerm) {
                const searchTermLower = globalFilters.searchTerm.toLowerCase();
                if (!agent.name?.toLowerCase().includes(searchTermLower)) return false;
            }

            if (globalFilters.projectId) {
                const agentTasksInProject = tasks.filter(task => 
                    task.agent_name === agent.name && task.project_id === globalFilters.projectId
                );
                if (agentTasksInProject.length === 0) return false;
            }

            if (globalFilters.status && globalFilters.status !== 'all') {
                const agentTasks = tasks.filter(task => task.agent_name === agent.name);
                if (agentTasks.length === 0 && globalFilters.status === 'active') return false;
                if (agentTasks.length === 0 && globalFilters.status === 'completed') return true;

                const allAgentTasksCompleted = agentTasks.every(task => task.completed);
                if (globalFilters.status === 'completed' && !allAgentTasksCompleted) return false;
                if (globalFilters.status === 'active' && allAgentTasksCompleted && agentTasks.length > 0) return false;
            }

            if (globalFilters.agentName && agent.name !== globalFilters.agentName) {
                // return false; // Uncomment if this specific behavior is desired.
            }

            return true;
        });
    }, [agents, globalFilters, tasks]);

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

    if (!filteredAgents.length && !loading) {
        return (
            <Box textAlign="center" py={8} bg="gray.700" rounded="lg" shadow="lg" borderWidth="1px" borderColor="gray.600">
                <Text color="gray.300">No agents found</Text>
            </Box>
        );
    }

    return (
        <VStack spacing={4} align="stretch">
            {filteredAgents.map(agent => {
                const stats = getAgentStats(agent.name);
                const isActive = stats.totalTasks > 0 || stats.activeProjects > 0;
                return (
                    <Box
                        key={agent.id}
                        p={4}
                        bg="gray.700"
                        rounded="lg"
                        shadow="lg"
                        borderWidth="1px"
                        borderColor="gray.600"
                        _hover={{ 
                            shadow: "xl", 
                            borderColor: isActive ? ACCENT_COLOR : "gray.500", 
                            transform: "translateY(-1px)" 
                        }}
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
                            bg: isActive ? ACCENT_COLOR : "transparent",
                            opacity: 0.9
                        }}
                    >
                        <HStack mb={2} align="start">
                            <VStack align="start" spacing={0.5} flex={1}>
                                <Text 
                                    fontWeight="semibold" 
                                    fontSize="lg"
                                    color="whiteAlpha.900"
                                >
                                    {formatDisplayName(agent.name)}
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color={isActive ? ACCENT_COLOR : IDLE_TEXT_COLOR} 
                                    fontWeight="medium"
                                >
                                    Status: {isActive ? "Active" : "Idle"}
                                </Text>
                            </VStack>
                            <Spacer />
                            <Menu placement="bottom-end">
                                <MenuButton
                                    as={IconButton}
                                    aria-label="Options"
                                    icon={<HamburgerIcon />}
                                    variant="ghost"
                                    color="gray.400"
                                    _hover={{ bg: "gray.600", color: "white" }}
                                    size="sm"
                                />
                                <MenuList bg="gray.700" borderColor="gray.600">
                                    <MenuItem 
                                        icon={<DeleteIcon />} 
                                        onClick={() => handleDelete(agent)}
                                        bg="gray.700"
                                        color="red.300"
                                        _hover={{ bg: "gray.600", color: "red.200" }}
                                    >
                                        Delete
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </HStack>
                        <HStack spacing={4} mt={3} flexWrap="wrap">
                            <HStack spacing={1} align="center">
                                <CopyIcon color={ACCENT_COLOR} boxSize="14px" />
                                <Text fontSize="xs" color="gray.200">Tasks: {stats.totalTasks}</Text>
                            </HStack>
                            <HStack spacing={1} align="center">
                                <CheckCircleIcon color={stats.completedTasks > 0 ? ACCENT_COLOR : "gray.500"} boxSize="14px" />
                                <Text fontSize="xs" color="gray.200">Completed: {stats.completedTasks}</Text>
                            </HStack>
                            <HStack spacing={1} align="center">
                                <ViewIcon color={stats.activeProjects > 0 ? ACCENT_COLOR : "gray.500"} boxSize="14px" /> 
                                <Text fontSize="xs" color="gray.200">Projects: {stats.activeProjects}</Text>
                            </HStack>
                        </HStack>
                    </Box>
                );
            })}
        </VStack>
    );
};

export default React.memo(AgentList); 