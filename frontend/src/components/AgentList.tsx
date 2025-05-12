'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    VStack,
    Box,
    Text,
    Badge,
    IconButton,
    HStack,
    useToast,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Flex,
    useBreakpointValue,
    Heading,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
} from '@chakra-ui/react';
import { DeleteIcon, HamburgerIcon, CopyIcon, CheckCircleIcon, ViewIcon, AddIcon, EditIcon } from '@chakra-ui/icons';
import { useAgentStore } from '@/store/agentStore';
import { useTaskStore } from '@/store/taskStore';
import { Agent } from '@/types';
import { formatDisplayName } from '@/lib/utils';
import AddAgentForm from './AddAgentForm';
import EditAgentForm from './EditAgentForm';

const ACCENT_COLOR = "#dad2cc";

const AgentList: React.FC = () => {
    const {
        agents,
        loading: agentsLoading,
        error: agentsError,
        fetchAgents,
        removeAgent,
        addAgent,
        editAgent,
    } = useAgentStore();
    const tasks = useTaskStore(state => state.tasks);
    const globalFilters = useTaskStore(state => state.filters);
    const toast = useToast();
    const isMobile = useBreakpointValue({ base: true, md: false });

    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

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

    const handleAddAgentSubmit = async (name: string) => {
        try {
            await addAgent({ name });
            toast({
                title: "Agent registered.",
                description: `Agent '${name}' has been added.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onAddClose();
        } catch (error) {
            console.error("[AgentList] Failed to add agent:", error);
        }
    };

    const handleEditAgentSubmit = async (agentId: string, newName: string) => {
        try {
            await editAgent(agentId, { name: newName });
            toast({
                title: "Agent updated.",
                description: `Agent updated to name '${newName}'.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onEditClose();
        } catch (error) {
            console.error("[AgentList] Failed to edit agent:", error);
        }
    };

    const handleAgentDelete = async (id: string, name: string) => {
        try {
            await removeAgent(id);
            toast({
                title: 'Agent Deleted',
                description: `Agent ${name} (${id}) has been deleted.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error Deleting Agent',
                description: error instanceof Error ? error.message : `Could not delete agent ${name}.`,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleOpenEditModal = (agent: Agent) => {
        setSelectedAgent(agent);
        onEditOpen();
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

    if (agentsLoading) return <Text color="text.muted">Loading agents...</Text>;
    if (agentsError) return <Text color="text.critical">Error loading agents: {agentsError}</Text>;

    return (
        <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center" mb={4} px={1}>
                <Heading size="md" color="text.heading">Registry</Heading>
                {isMobile ? (
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label='Agent Actions'
                            icon={<HamburgerIcon />}
                            size="sm"
                            variant="ghost"
                            color="icon.secondary"
                            _hover={{ bg: "bg.hover.nav", color: "text.primary" }}
                        />
                        <MenuList bg="bg.card" borderColor="border.secondary">
                            <MenuItem 
                                icon={<AddIcon />} 
                                bg="bg.card"
                                _hover={{ bg: "bg.hover.nav" }}
                                onClick={onAddOpen}
                            >
                                Register Agent
                            </MenuItem>
                        </MenuList>
                    </Menu>
                ) : (
                    <Button 
                        leftIcon={<AddIcon />} 
                        bg="bg.button.primary"
                        color="text.button.primary"
                        _hover={{ bg: "bg.button.primary.hover" }}
                        onClick={onAddOpen}
                        size="sm"
                    >
                        Register Agent
                    </Button>
                )}
            </Flex>

            {filteredAgents.map(agent => {
                const stats = getAgentStats(agent.name);
                const isActive = stats.totalTasks > 0 || stats.activeProjects > 0;
                return (
                    <Box
                        key={agent.id}
                        p={4}
                        bg="bg.card"
                        rounded="lg"
                        shadow="lg"
                        borderWidth="1px"
                        borderColor="border.secondary"
                        _hover={{ 
                            shadow: "xl", 
                            borderColor: isActive ? 'border.accent' : "border.primary",
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
                            bg: isActive ? 'accent.active' : "transparent",
                            opacity: 0.9
                        }}
                    >
                        <HStack 
                            mb={2} 
                            align={{ base: 'flex-start', md: 'start' }}
                            direction={{ base: 'column', md: 'row' }}
                        >
                            <VStack align="start" spacing={0.5} flex={1} mb={{ base: 2, md: 0 }}>
                                <Text 
                                    fontWeight="semibold" 
                                    fontSize="lg"
                                    color="text.primary"
                                >
                                    {formatDisplayName(agent.name)}
                                </Text>
                                <HStack>
                                    <Text fontSize="xs" color="text.secondary" fontWeight="medium">Status: </Text>
                                    <Badge 
                                        variant="subtle"
                                        size="sm"
                                        px={2} 
                                        py={0.5} 
                                        borderRadius="md"
                                        bg={isActive ? 'bg.status.success.subtle' : 'bg.subtle'} 
                                        color={isActive ? 'text.status.success' : 'text.secondary'}
                                    >
                                        {isActive ? 'Active' : 'Idle'}
                                    </Badge>
                                </HStack>
                                <Text fontSize="xs" color="text.muted">ID: {agent.id}</Text>
                            </VStack>

                            <HStack 
                                spacing={3} 
                                wrap="wrap" 
                                justify={{ base: 'flex-start', md: 'flex-end' }} 
                                align="center"
                                ml={{ md: 4 }}
                            >
                                <Badge 
                                    variant="subtle"
                                    bg={stats.totalTasks > 0 ? "badge.bg.info" : "badge.bg.neutral"}
                                    color={stats.totalTasks > 0 ? "badge.text.info" : "badge.text.neutral"}
                                >
                                    Tasks: {stats.totalTasks}
                                </Badge>
                                <Badge 
                                    variant="subtle"
                                    bg={stats.completedTasks > 0 ? "badge.bg.success" : "badge.bg.neutral"}
                                    color={stats.completedTasks > 0 ? "badge.text.success" : "badge.text.neutral"}
                                >
                                    Completed: {stats.completedTasks}
                                </Badge>
                                <Badge 
                                    variant="subtle"
                                    bg={stats.activeProjects > 0 ? "badge.bg.info" : "badge.bg.neutral"}
                                    color={stats.activeProjects > 0 ? "badge.text.info" : "badge.text.neutral"}
                                >
                                    Projects: {stats.activeProjects}
                                </Badge>
                            </HStack>

                            <Menu placement="bottom-end">
                                <MenuButton
                                    as={IconButton}
                                    aria-label="Options"
                                    icon={<HamburgerIcon />}
                                    variant="ghost"
                                    color="icon.secondary"
                                    _hover={{ bg: "bg.hover.nav", color: "text.primary" }}
                                    size="sm"
                                />
                                <MenuList bg="bg.card" borderColor="border.secondary">
                                    <MenuItem 
                                        icon={<EditIcon />} 
                                        onClick={() => handleOpenEditModal(agent)}
                                        bg="bg.card"
                                        _hover={{ bg: "bg.hover.nav" }}
                                    >
                                        Edit Agent
                                    </MenuItem>
                                    <MenuItem 
                                        icon={<DeleteIcon />} 
                                        onClick={() => handleAgentDelete(agent.id, agent.name)}
                                        color="text.danger"
                                        bg="bg.card"
                                        _hover={{ bg: "bg.danger.hover" }}
                                    >
                                        Delete Agent
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        </HStack>
                    </Box>
                );
            })}

            <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="bg.modal" color="text.primary" borderColor="border.modal" borderWidth="1px">
                    <ModalHeader>Register New Agent</ModalHeader>
                    <ModalCloseButton color="icon.secondary" _hover={{ bg: "button.hover.secondary"}} />
                    <ModalBody pb={6}>
                        <AddAgentForm onSubmit={handleAddAgentSubmit} />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="bg.modal" color="text.primary" borderColor="border.modal" borderWidth="1px">
                    <ModalHeader>Edit Agent: {selectedAgent ? formatDisplayName(selectedAgent.name) : ''}</ModalHeader>
                    <ModalCloseButton color="icon.secondary" _hover={{ bg: "button.hover.secondary"}} />
                    <ModalBody pb={6}>
                        {selectedAgent && (
                            <EditAgentForm
                                agent={selectedAgent}
                                onSubmit={(newName) => handleEditAgentSubmit(selectedAgent.id, newName)}
                            />
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </VStack>
    );
};

export default AgentList; 