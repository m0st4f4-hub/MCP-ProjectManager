// D:\mcp\task-manager\frontend\src\app\page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Heading,
    VStack,
    HStack,
    Button,
    useDisclosure,
    Select,
    Spinner,
    Text,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Grid,
    GridItem,
    Flex,
    Spacer,
    Input
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import TaskList from '@/components/TaskList';
import AddTaskForm from '@/components/AddTaskForm';
import EditTaskModal from '@/components/EditTaskModal';
import ProjectList from '@/components/ProjectList'; 
import AddProjectForm from '@/components/AddProjectForm';
import AgentList from '@/components/AgentList'; 
import AddAgentForm from '@/components/AddAgentForm';
import { useTaskStore } from '@/store/taskStore';
import { Task, TaskUpdateData, Project, Agent } from '@/services/api'; 
import { useShallow } from 'zustand/react/shallow';
import MCPDevTools from '@/app/mcp-dev-tools/page'; // Import MCPDevTools

// Custom FormLabel to avoid conflicts or for specific styling
const CustomFormLabel: React.FC<FormLabelProps> = ({ htmlFor, children, size = "sm", fontWeight="medium", color="text.secondary", mb=1 }) => {
    return (
        <Text as="label" htmlFor={htmlFor} fontSize={size} fontWeight={fontWeight} color={color} display="block" mb={mb}>
            {children}
        </Text>
    );
};

interface FormLabelProps {
    htmlFor: string;
    children: React.ReactNode;
    size?: string;
    fontWeight?: string;
    color?: string;
    mb?: number;
}

const TaskManager: React.FC = () => {
    // Granular selectors for data
    const tasks = useTaskStore(state => state.tasks);
    const projects = useTaskStore(state => state.projects);
    const agents = useTaskStore(state => state.agents);
    const editingTask = useTaskStore(state => state.editingTask);
    const isEditModalOpen = useTaskStore(state => state.isEditModalOpen);
    const loadingTasks = useTaskStore(state => state.loadingTasks);
    const loadingProjects = useTaskStore(state => state.loadingProjects);
    const loadingAgents = useTaskStore(state => state.loadingAgents);

    // Grouped selector for actions used by TaskManager or passed to direct children
    const {
        fetchTasks,
        fetchProjects,
        fetchAgents,
        editTask,
        closeEditModal,
        createProjectAction,
        updateProjectAction,
        deleteProjectAction,
        createAgentAction,
        updateAgentAction,
        deleteAgentAction,
    } = useTaskStore(
        useShallow(state => ({
            fetchTasks: state.fetchTasks,
            fetchProjects: state.fetchProjects,
            fetchAgents: state.fetchAgents,
            editTask: state.editTask,
            closeEditModal: state.closeEditModal,
            createProjectAction: state.createProjectAction,
            updateProjectAction: state.updateProjectAction,
            deleteProjectAction: state.deleteProjectAction,
            createAgentAction: state.createAgentAction,
            updateAgentAction: state.updateAgentAction,
            deleteAgentAction: state.deleteAgentAction,
        }))
    );

    const { isOpen: isAddTaskModalOpen, onOpen: onOpenAddTaskModal, onClose: onCloseAddTaskModal } = useDisclosure();
    const { isOpen: isAddProjectModalOpen, onOpen: onOpenAddProjectModal, onClose: onCloseAddProjectModal } = useDisclosure();
    const { isOpen: isAddAgentModalOpen, onOpen: onOpenAddAgentModal, onClose: onCloseAddAgentModal } = useDisclosure();
    
    const [filterProjectId, setFilterProjectId] = useState<string>('');
    const [filterAgentName, setFilterAgentName] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        fetchTasks();
        fetchProjects();
        fetchAgents();
    }, [fetchTasks, fetchProjects, fetchAgents]);

    const handleUpdateTask = async (id: number, data: TaskUpdateData) => {
        await editTask(id, data);
    };

    const currentFilters = React.useMemo(() => ({
        projectId: filterProjectId ? parseInt(filterProjectId) : undefined,
        agentName: filterAgentName || undefined,
    }), [filterProjectId, filterAgentName]);

    useEffect(() => {
        fetchTasks(currentFilters);
    }, [currentFilters, fetchTasks]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchTasks(currentFilters);
        }, 60000); // 60,000 ms = 1 minute
        return () => clearInterval(interval);
    }, [fetchTasks, currentFilters]);

    const filteredTasks = React.useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = searchTerm
                ? task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;
            return matchesSearch;
        });
    }, [tasks, searchTerm]);

    return (
        <Box p={5} bg="bg.canvas" minH="100vh">
            <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={6} alignItems="start">
                {/* Main Task Management Area */}
                <GridItem colSpan={{ base: 1, lg: 2 }} bg="bg.surface" p={6} borderRadius="lg" shadow="sm">
                    <Flex mb={6} direction={{ base: "column", md: "row" }} gap={4} alignItems={{ base: "stretch", md: "center" }}>
                        <Heading as="h1" size="lg" color="text.default">Task Manager</Heading>
                        <Spacer />
                        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpenAddTaskModal} minW="150px">
                            Add New Task
                        </Button>
                    </Flex>

                    {/* Filters and Search */}
                    <HStack spacing={4} mb={6} wrap="wrap" alignItems="flex-end">
                        <Box flexGrow={1} minW={{base: "100%", sm: "150px"}}>
                            <CustomFormLabel htmlFor="filter-project">Filter by Project</CustomFormLabel>
                            <Select id="filter-project" value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)} focusBorderColor="brand.primary" bg="bg.default">
                            <option value="">All Projects</option>
                                {projects.map((project) => <option key={project.id} value={project.id.toString()}>{project.name}</option>)}
                        </Select>
                    </Box>
                        <Box flexGrow={1} minW={{base: "100%", sm: "150px"}}>
                            <CustomFormLabel htmlFor="filter-agent">Filter by Agent</CustomFormLabel>
                            <Select id="filter-agent" value={filterAgentName} onChange={(e) => setFilterAgentName(e.target.value)} focusBorderColor="brand.primary" bg="bg.default">
                            <option value="">All Agents</option>
                            {agents.map((agent) => <option key={agent.id} value={agent.name}>{agent.name}</option>)}
                        </Select>
                    </Box>
                        <Box flexGrow={2} minW={{base: "100%", sm: "200px"}}>
                            <CustomFormLabel htmlFor="search-task">Search Tasks</CustomFormLabel>
                            <Input 
                                id="search-task"
                                placeholder="Search by title or description..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                focusBorderColor="brand.primary"
                                bg="bg.default"
                            />
                    </Box>
                    </HStack>

                    {loadingTasks && <Flex justify="center" p={10}><Spinner size="xl" color="brand.primary" /></Flex>}
                    {!loadingTasks && filteredTasks.length === 0 && (
                        <Text textAlign="center" p={10} color="text.secondary">No tasks match your current filters and search. Try adding some!</Text>
                    )}
                    {!loadingTasks && filteredTasks.length > 0 && (
                        <TaskList tasks={filteredTasks} />
                    )}
                    
                    {isAddTaskModalOpen && <AddTaskForm onTaskAdded={onCloseAddTaskModal} />} 

                <EditTaskModal
                    task={editingTask}
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    onUpdate={handleUpdateTask}
                />
                </GridItem>

                {/* Side Panel for Projects, Agents, and Dev Tools */}
                <GridItem colSpan={{ base: 1, lg: 1 }} >
                    <Box position={{lg: "sticky"}} top={{lg: "1.25rem"}} >
                        <Tabs variant="enclosed-colored" colorScheme="gray" isLazy>
                            <TabList>
                                <Tab _selected={{ color: "text.default", bg: "bg.surface", borderColor: "border.default", borderBottomColor: "bg.surface" }}>Projects</Tab>
                                <Tab _selected={{ color: "text.default", bg: "bg.surface", borderColor: "border.default", borderBottomColor: "bg.surface" }}>Agents</Tab>
                                <Tab _selected={{ color: "text.default", bg: "bg.surface", borderColor: "border.default", borderBottomColor: "bg.surface" }}>Dev Tools</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel bg="bg.surface" borderRadius="0 0 lg lg" shadow="sm" p={4}>
                                    <HStack mb={4} justifyContent="space-between">
                                        <Heading as="h2" size="md" color="text.default">Projects</Heading>
                                        <Button size="sm" leftIcon={<AddIcon />} colorScheme="teal" variant="outline" onClick={onOpenAddProjectModal}>
                                            New Project
                                        </Button>
                                    </HStack>
                                    {loadingProjects ? <Spinner /> : <ProjectList projects={projects} onEdit={updateProjectAction} onDelete={deleteProjectAction} />}
                                    {isAddProjectModalOpen && <AddProjectForm isOpen={isAddProjectModalOpen} onClose={onCloseAddProjectModal} addProject={createProjectAction} />}
                                </TabPanel>

                                <TabPanel bg="bg.surface" borderRadius="0 0 lg lg" shadow="sm" p={4}>
                                    <HStack mb={4} justifyContent="space-between">
                                        <Heading as="h2" size="md" color="text.default">Agents</Heading>
                                        <Button size="sm" leftIcon={<AddIcon />} colorScheme="purple" variant="outline" onClick={onOpenAddAgentModal}>
                                            New Agent
                                        </Button>
                                    </HStack>
                                    {loadingAgents ? <Spinner /> : <AgentList agents={agents} onEdit={updateAgentAction} onDelete={deleteAgentAction} />}
                                    {isAddAgentModalOpen && <AddAgentForm isOpen={isAddAgentModalOpen} onClose={onCloseAddAgentModal} addAgent={createAgentAction} />}
                                </TabPanel>

                                <TabPanel bg="bg.surface" borderRadius="0 0 lg lg" shadow="sm" p={0}> {/* p=0 for full bleed */} 
                                    <MCPDevTools />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                </Box>
                </GridItem>
            </Grid>
            </Box>
    );
};

export default TaskManager;
