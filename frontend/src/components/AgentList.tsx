'use client';

import React, { useEffect, useState } from 'react';
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
    Icon,
    Tooltip,
    StackDivider,
    ModalFooter,
} from '@chakra-ui/react';
import { DeleteIcon, HamburgerIcon, CopyIcon, CheckCircleIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { useAgentStore } from '@/store/agentStore';
import { useTaskStore } from '@/store/taskStore';
import { Agent } from '@/types';
import { formatDisplayName } from '@/lib/utils';
import AddAgentForm from './AddAgentForm';
import EditAgentForm from './EditAgentForm';
import { useProjectStore } from "../store/projectStore";
import { shallow } from 'zustand/shallow';

const AgentList: React.FC = () => {
    const agents = useAgentStore(state => state.agents, shallow);
    const agentsLoading = useAgentStore(state => state.loading);
    const agentsError = useAgentStore(state => state.error);
    const fetchAgents = useAgentStore(state => state.fetchAgents);
    const removeAgent = useAgentStore(state => state.removeAgent);
    const addAgent = useAgentStore(state => state.addAgent);
    const editAgent = useAgentStore(state => state.editAgent);
    const agentFilters = useAgentStore(state => state.filters, shallow);
    const tasks = useTaskStore(state => state.tasks, shallow);
    const fetchTasks = useTaskStore(state => state.fetchTasks);
    const toast = useToast();
    const isMobile = useBreakpointValue({ base: true, md: false });
    const projects = useProjectStore(state => state.projects, shallow);
    const fetchProjects = useProjectStore(state => state.fetchProjects);

    const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [cliPromptModalOpen, setCliPromptModalOpen] = useState(false);
    const [cliPromptText, setCliPromptText] = useState('');
    const [cliPromptAgentName, setCliPromptAgentName] = useState('');

    useEffect(() => {
        fetchAgents();
        fetchProjects();
        fetchTasks();
    }, [fetchAgents, fetchProjects, fetchTasks]);

    const getAgentStats = (agentId: string) => {
        // Get all tasks assigned to this agent
        const agentTasks = tasks.filter((task) => task.agent_id === agentId);
        const taskCount = agentTasks.length;

        // Get unique project IDs from these tasks
        const projectIds = Array.from(new Set(agentTasks.map((task) => task.project_id).filter(Boolean)));
        const projectCount = projectIds.length;
        const projectNames = projectIds
            .map((pid) => projects.find((p) => p.id === pid)?.name)
            .filter((name): name is string => !!name);

        // Determine status: Active if any incomplete tasks, Idle otherwise
        const isActive = agentTasks.some((task) => !task.completed);
        const status = isActive ? "Active" : "Idle";

        return {
            taskCount,
            projectCount,
            projectNames,
            status,
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

    const handleCopyAgentId = (id: string) => {
        navigator.clipboard.writeText(id);
        toast({
            title: "Agent ID Copied",
            status: "info",
            duration: 2000,
            isClosable: true,
        });
    };

    // Generate CLI prompt for an agent
    const handleOpenCliPrompt = (agent) => {
        const agentTasks = tasks.filter(task => task.agent_id === agent.id);
        let prompt = `@${agent.name}, you are assigned the following tasks. Please execute each task, update its status as you progress, and mark it as finished when done.\nAgent ID: ${agent.id}\n`;
        if (agentTasks.length === 0) {
            prompt += '\nNo tasks are currently assigned to you.';
        } else {
            prompt += '\nTasks:';
            agentTasks.forEach((task, idx) => {
                prompt += `\n${idx + 1}. Task ID: ${task.id}`;
                prompt += `\n   - Task Name: ${task.title}`;
                if (task.description) prompt += `\n   - Description: ${task.description}`;
                prompt += '\n';
            });
        }
        setCliPromptText(prompt);
        setCliPromptAgentName(agent.name);
        setCliPromptModalOpen(true);
    };

    const handleCopyPrompt = async () => {
        if (cliPromptText) {
            try {
                await navigator.clipboard.writeText(cliPromptText);
                toast({ title: 'Prompt copied to clipboard!', status: 'success', duration: 2000, isClosable: true });
            } catch {
                toast({ title: 'Failed to copy prompt.', status: 'error', duration: 2000, isClosable: true });
            }
        }
    };

    const filteredAgents = React.useMemo(() => {
        if (!agents) return [];
        return agents.filter(agent => {
            if (!agent) return false;

            if (agentFilters.search) {
                const searchTermLower = agentFilters.search.toLowerCase();
                if (!agent.name?.toLowerCase().includes(searchTermLower)) return false;
            }

            if (agentFilters.status && agentFilters.status !== 'all') {
                const agentTasks = tasks.filter(task => task.agent_name === agent.name || task.agent_id === agent.id);
                const isActive = agentTasks.some(task => !task.completed);
                const currentStatus = isActive ? 'busy' : (agentTasks.length > 0 ? 'available' : 'offline');
                
                if (agentFilters.status === 'available' && (currentStatus !== 'available' && currentStatus !== 'offline')) return false;
                if (agentFilters.status === 'busy' && currentStatus !== 'busy') return false;
                if (agentFilters.status === 'offline' && currentStatus !== 'offline') return false;
            }

            return true;
        });
    }, [agents, agentFilters, tasks]);

    if (agentsLoading) return <Text color="text.muted">Loading agents...</Text>;
    if (agentsError) return <Text color="text.critical">Error loading agents: {agentsError}</Text>;

    return (
        <VStack spacing={6} align="stretch" divider={<StackDivider borderColor="border.secondary" />}>
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
                const stats = getAgentStats(agent.id);
                return (
                    <Box
                        key={agent.id}
                        p={4}
                        bg="bg.card"
                        rounded="lg"
                        shadow="md"
                        borderWidth="1px"
                        borderColor="border.primary"
                        _hover={{
                            shadow: "xl", 
                            borderColor: stats.status === 'Active' ? 'border.accent' : 'border.highlight',
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
                            bg: stats.status === 'Active' ? 'border.accent' : "transparent",
                            opacity: 0.9
                        }}
                    >
                        <HStack 
                            mb={2} 
                            align={{ base: 'flex-start', md: 'center' }}
                            spacing={4}
                            w="full"
                        >
                            <Icon 
                                as={CheckCircleIcon} 
                                color={stats.status === 'Active' ? 'icon.accent' : 'icon.muted'} 
                                boxSize={6} 
                                title={stats.status === 'Active' ? 'Active' : 'Idle'}
                                mr={1}
                            />
                            <VStack align="start" spacing={1} flex={1} >
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
                                        bg={stats.status === 'Active' ? 'bg.status.success.subtle' : 'bg.subtle'} 
                                        color={stats.status === 'Active' ? 'text.status.success' : 'text.secondary'}
                                    >
                                        {stats.status}
                                    </Badge>
                                </HStack>
                                <Text color="text.secondary" fontSize="sm" >ID: {agent.id}</Text>
                            </VStack>

                            <VStack 
                                spacing={1}
                                fontSize="sm" 
                                color="text.secondary"
                                alignSelf="center"
                                textAlign="right"
                                minW="120px"
                            >
                                <Text>TASKS: {stats.taskCount}</Text>
                                <Text>PROJECTS: {stats.projectCount}</Text>
                                {stats.projectCount > 0 && (
                                    <Tooltip label={stats.projectNames.join(", ")} aria-label="Project Names" placement="top-start">
                                        <Text fontSize="xs" color="text.secondary" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                                            {stats.projectNames.length > 2
                                                ? stats.projectNames.slice(0, 2).join(", ") + ` +${stats.projectNames.length - 2} more`
                                                : stats.projectNames.join(", ")}
                                        </Text>
                                    </Tooltip>
                                )}
                            </VStack>

                            <HStack spacing={1} alignSelf="center">
                                <IconButton
                                    aria-label="Copy Agent CLI Prompt"
                                    icon={<CopyIcon />}
                                    size="sm"
                                    variant="ghost"
                                    color="icon.secondary"
                                    _hover={{ bg: 'interaction.hover', color: 'icon.primary' }}
                                    onClick={() => handleOpenCliPrompt(agent)}
                                />
                                <IconButton
                                    aria-label="Copy Agent ID"
                                    icon={<CopyIcon />}
                                    size="sm"
                                    variant="ghost"
                                    color="icon.secondary"
                                    _hover={{ bg: 'interaction.hover', color: 'icon.primary' }}
                                    onClick={() => handleCopyAgentId(agent.id)}
                                />
                                <IconButton
                                    aria-label="Edit Agent"
                                    icon={<EditIcon />}
                                    size="sm"
                                    variant="ghost"
                                    color="icon.secondary"
                                    _hover={{ bg: 'interaction.hover', color: 'icon.primary' }}
                                    onClick={() => handleOpenEditModal(agent)}
                                />
                                <IconButton
                                    aria-label="Delete Agent"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    variant="ghost"
                                    color="icon.danger"
                                    _hover={{ bg: 'interaction.danger.hover', color: 'icon.critical' }}
                                    onClick={() => handleAgentDelete(agent.id, agent.name)}
                                />
                             </HStack>
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

            {/* CLI Prompt Modal for Agents */}
            <Modal isOpen={cliPromptModalOpen} onClose={() => setCliPromptModalOpen(false)} size="lg" isCentered>
                <ModalOverlay />
                <ModalContent bg="bg.card" color="text.primary" borderWidth="1px" borderColor="border.secondary">
                    <ModalHeader borderBottomWidth="1px" borderColor="border.secondary">
                        Agent CLI Prompt{cliPromptAgentName ? `: @${cliPromptAgentName}` : ''}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <Box 
                            as="pre" 
                            whiteSpace="pre-wrap" 
                            fontSize="sm" 
                            p={4} 
                            bg="bg.subtle" 
                            color="text.secondary" 
                            borderRadius="md" 
                            borderWidth="1px"
                            borderColor="border.subtle"
                            maxH="60vh" 
                            overflowY="auto"
                        >
                            {cliPromptText}
                        </Box>
                    </ModalBody>
                    <ModalFooter borderTopWidth="1px" borderColor="border.secondary">
                        <Button 
                            leftIcon={<CopyIcon />} 
                            onClick={handleCopyPrompt} 
                            variant="solid"
                            bg="button.primary.default"
                            color="button.primary.text"
                            _hover={{ bg: "button.primary.hover" }}
                            mr={3}
                        >
                            Copy to Clipboard
                        </Button>
                        <Button 
                            onClick={() => setCliPromptModalOpen(false)} 
                            variant="ghost"
                            color="text.link"
                            _hover={{ bg: "bg.hover.subtle" }}
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </VStack>
    );
};

export default AgentList; 