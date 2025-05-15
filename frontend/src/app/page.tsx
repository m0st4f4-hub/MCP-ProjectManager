// D:\mcp\task-manager\frontend\src\app\page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
    VStack,
    Heading,
    Box,
    useToast,
    HStack,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Text,
    Textarea,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    IconButton,
    Flex,
    Spacer,
    Tooltip,
    Image,
    useColorMode,
    Tabs,
    TabList,
    Tab,
} from '@chakra-ui/react';
import { AddIcon, ArrowUpIcon, CopyIcon, HamburgerIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon, ViewIcon, EditIcon, SearchIcon, TimeIcon } from '@chakra-ui/icons';
import TaskList from '@/components/TaskList';
import AddTaskForm from '@/components/AddTaskForm';
import ProjectList from '@/components/ProjectList';
import AddProjectForm from '@/components/AddProjectForm';
import AgentList from '@/components/AgentList';
import AddAgentForm from '@/components/AddAgentForm';
import { useTaskStore, TaskState } from '@/store/taskStore';
import { useProjectStore, ProjectState } from '@/store/projectStore';
import { useAgentStore, AgentState } from '@/store/agentStore';
import FilterSidebar from '@/components/common/FilterSidebar';
import { createProject, createTask } from '@/services/api';
import { ProjectCreateData } from '@/types/project';
import { TaskCreateData } from '@/types/task';
import Dashboard from '@/components/Dashboard';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import MCPDevTools from '@/components/MCPDevTools';

interface ImportedPlanTask {
    title: string;
    description?: string;
    agentName?: string;
    completed?: boolean;
}

interface ImportedPlan {
    projectName: string;
    projectDescription?: string;
    projectAgentName?: string;
    tasks: ImportedPlanTask[];
}

interface SidebarContentProps {
    activeView: string;
    setActiveView: (view: string) => void;
    onAddTaskOpen: () => void;
    onAddProjectOpen: () => void;
    onAddAgentOpen: () => void;
    onImportPlanOpen: () => void;
    onOpenDevTools: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const SidebarContent = ({ activeView, setActiveView, onAddTaskOpen, onAddProjectOpen, onAddAgentOpen, onImportPlanOpen, onOpenDevTools, isCollapsed, onToggleCollapse }: SidebarContentProps) => {
    return (
        <VStack h="full" spacing={2} align="stretch" flexGrow={1}>
            <HStack justify="space-between" align="center" w="full" pb={3} borderBottomWidth="1px" borderColor="border.primary">
                {!isCollapsed && (
                    <Heading size="md" color="text.heading">
                        Menu
                    </Heading>
                )}
                {isCollapsed && <Box w={1} /> }
                <ThemeToggleButton />
            </HStack>

            <VStack spacing={1} align="stretch">
                <Tooltip label="Dashboard" isDisabled={!isCollapsed} placement="right">
                    <Button
                        justifyContent={isCollapsed ? "center" : "flex-start"}
                        onClick={() => setActiveView('Dashboard')}
                        variant={activeView === 'Dashboard' ? 'solid' : 'ghost'}
                        bg={activeView === 'Dashboard' ? 'bg.active.nav' : undefined}
                        color={activeView === 'Dashboard' ? 'text.button.primary' : 'text.secondary'}
                        _hover={{ 
                            bg: activeView !== 'Dashboard' ? 'bg.hover.nav' : undefined,
                            textDecoration: 'none' 
                        }}
                        w={isCollapsed ? "auto" : "full"}
                        px={isCollapsed ? 2 : undefined}
                        leftIcon={<ViewIcon />}
                    >
                        {!isCollapsed && "Dashboard"}
                    </Button>
                </Tooltip>
                <Tooltip label="Workboard" isDisabled={!isCollapsed} placement="right">
                    <Button
                        justifyContent={isCollapsed ? "center" : "flex-start"}
                        onClick={() => setActiveView('Workboard')}
                        variant={activeView === 'Workboard' ? 'solid' : 'ghost'}
                        bg={activeView === 'Workboard' ? 'bg.active.nav' : undefined}
                        color={activeView === 'Workboard' ? 'text.button.primary' : 'text.secondary'}
                        _hover={{ 
                            bg: activeView !== 'Workboard' ? 'bg.hover.nav' : undefined,
                            textDecoration: 'none' 
                        }}
                        w={isCollapsed ? "auto" : "full"}
                        px={isCollapsed ? 2 : undefined}
                        leftIcon={<EditIcon />}
                    >
                        {!isCollapsed && "Workboard"}
                    </Button>
                </Tooltip>
                <Tooltip label="Portfolio" isDisabled={!isCollapsed} placement="right">
                    <Button
                        justifyContent={isCollapsed ? "center" : "flex-start"}
                        onClick={() => setActiveView('Portfolio')}
                        variant={activeView === 'Portfolio' ? 'solid' : 'ghost'}
                        bg={activeView === 'Portfolio' ? 'bg.active.nav' : undefined}
                        color={activeView === 'Portfolio' ? 'text.button.primary' : 'text.secondary'}
                        _hover={{ 
                            bg: activeView !== 'Portfolio' ? 'bg.hover.nav' : undefined,
                            textDecoration: 'none' 
                        }}
                        w={isCollapsed ? "auto" : "full"}
                        px={isCollapsed ? 2 : undefined}
                        leftIcon={<SearchIcon />}
                    >
                        {!isCollapsed && "Portfolio"}
                    </Button>
                </Tooltip>
                <Tooltip label="Registry" isDisabled={!isCollapsed} placement="right">
                    <Button
                        justifyContent={isCollapsed ? "center" : "flex-start"}
                        onClick={() => setActiveView('Registry')}
                        variant={activeView === 'Registry' ? 'solid' : 'ghost'}
                        bg={activeView === 'Registry' ? 'bg.active.nav' : undefined}
                        color={activeView === 'Registry' ? 'text.button.primary' : 'text.secondary'}
                        _hover={{ 
                            bg: activeView !== 'Registry' ? 'bg.hover.nav' : undefined,
                            textDecoration: 'none' 
                        }}
                        w={isCollapsed ? "auto" : "full"}
                        px={isCollapsed ? 2 : undefined}
                        leftIcon={<TimeIcon />}
                    >
                        {!isCollapsed && "Registry"}
                    </Button>
                </Tooltip>
            </VStack>

            {!isCollapsed && (
                <Box w="full" pb={2} mb={0} borderTopWidth="1px" borderColor="border.divider" mt={2} pt={2}>
                    {activeView === 'Workboard' && (
                        <Tooltip label="Add New Task" isDisabled={!isCollapsed} placement="right">
                            <Button 
                                leftIcon={<AddIcon />} 
                                variant="solid" 
                                size="sm" 
                                w={isCollapsed ? "auto" : "full"} 
                                px={isCollapsed ? 2 : undefined}
                                onClick={onAddTaskOpen}
                                bg="bg.button.accent"
                                color="text.button.accent"
                                _hover={{ bg: 'bg.button.accent.hover' }}
                            >
                                {!isCollapsed && "Add New Task"}
                            </Button>
                        </Tooltip>
                    )}
                    {activeView === 'Portfolio' && (
                        <Tooltip label="Add New Project" isDisabled={!isCollapsed} placement="right">
                            <Button 
                                leftIcon={<AddIcon />} 
                                variant="solid" 
                                size="sm" 
                                w={isCollapsed ? "auto" : "full"} 
                                px={isCollapsed ? 2 : undefined}
                                onClick={onAddProjectOpen}
                                bg="bg.button.accent"
                                color="text.button.accent"
                                _hover={{ bg: 'bg.button.accent.hover' }}
                            >
                                {!isCollapsed && "Add New Project"}
                            </Button>
                        </Tooltip>
                    )}
                    {activeView === 'Registry' && (
                        <Tooltip label="Add New Agent" isDisabled={!isCollapsed} placement="right">
                            <Button 
                                leftIcon={<AddIcon />} 
                                variant="solid" 
                                size="sm" 
                                w={isCollapsed ? "auto" : "full"} 
                                px={isCollapsed ? 2 : undefined}
                                onClick={onAddAgentOpen}
                                bg="bg.button.accent"
                                color="text.button.accent"
                                _hover={{ bg: 'bg.button.accent.hover' }}
                            >
                                {!isCollapsed && "Add New Agent"}
                            </Button>
                        </Tooltip>
                    )}
                </Box>
            )}

            <Spacer />

            <VStack spacing={1} align="stretch" pb={2}>
                <Tooltip label="Import Plan" isDisabled={!isCollapsed} placement="right">
                    <Box w="full" pt={2} borderTopWidth={isCollapsed ? "none" : "1px"} borderColor="border.divider" mt={isCollapsed ? 0 : 2}>
                        <Button 
                            leftIcon={<ArrowUpIcon />} 
                            variant="solid" 
                            size="sm" 
                            w={isCollapsed ? "auto" : "full"} 
                            px={isCollapsed ? 2 : undefined}
                            onClick={onImportPlanOpen}
                            bg="bg.button.primary"
                            color="text.button.primary"
                            _hover={{ bg: 'bg.button.primary.hover' }}
                        >
                            {!isCollapsed && "Import Plan"}
                        </Button>
                    </Box>
                </Tooltip>
                <Tooltip label="Dev Tools" isDisabled={!isCollapsed} placement="right">
                    <Box w="full" pt={2} >
                        <Button 
                            leftIcon={<SettingsIcon />} 
                            variant="ghost" 
                            size="sm" 
                            w={isCollapsed ? "auto" : "full"} 
                            px={isCollapsed ? 2 : undefined}
                            onClick={onOpenDevTools}
                            color="text.secondary"
                            _hover={{ bg: 'bg.hover.nav' }} 
                        >
                            {!isCollapsed && "Dev Tools"}
                        </Button>
                    </Box>
                </Tooltip>
            </VStack>
            <IconButton 
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} 
                icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                onClick={onToggleCollapse}
                variant="ghost"
                alignSelf={isCollapsed ? "center" : "flex-end"}
                mt={2}
                size="sm"
            />
            {!isCollapsed && <FilterSidebar />}
        </VStack>
    );
};

export default function Home() {
    const error = useTaskStore((state: TaskState) => state.error);
    const fetchTasks = useTaskStore((state: TaskState) => state.fetchTasks);
    const startPolling = useTaskStore((state: TaskState) => state.startPolling);
    const stopPolling = useTaskStore((state: TaskState) => state.stopPolling);
    const fetchProjects = useProjectStore((state: ProjectState) => state.fetchProjects);
    const fetchAgents = useAgentStore((state: AgentState) => state.fetchAgents);
    const toast = useToast();
    const [activeView, setActiveView] = useState('Dashboard');
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    const { isOpen: isAddTaskOpen, onOpen: onAddTaskOpen, onClose: onAddTaskClose } = useDisclosure();
    const { isOpen: isAddProjectOpen, onOpen: onAddProjectOpen, onClose: onAddProjectClose } = useDisclosure();
    const { isOpen: isAddAgentOpen, onOpen: onAddAgentOpen, onClose: onAddAgentClose } = useDisclosure();
    const { isOpen: isImportPlanOpen, onOpen: onImportPlanOpen, onClose: onImportPlanClose } = useDisclosure();
    const { isOpen: isDevToolsOpen, onOpen: onOpenDevTools, onClose: onCloseDevTools } = useDisclosure();

    const [jsonPasteContent, setJsonPasteContent] = React.useState<string>("");
    const [importStatus, setImportStatus] = React.useState<string>("");
    const [isImporting, setIsImporting] = React.useState<boolean>(false);

    const { colorMode } = useColorMode();

    const projectFilters = useProjectStore(state => state.filters);
    const setProjectFilters = useProjectStore(state => state.setFilters);

    const taskFilters = useTaskStore(state => state.filters);
    const setTaskFilters = useTaskStore(state => state.setFilters);

    useEffect(() => {
        startPolling();
        fetchAgents();
        fetchProjects();
        return () => {
            stopPolling();
        };
    }, [startPolling, stopPolling, fetchAgents, fetchProjects]);

    useEffect(() => {
        if (error) {
            toast({
                title: 'Error',
                description: error,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }, [error, toast]);

    const AI_REVISION_PROMPT = `Based on our preceding discussion detailing the project plan, please convert that plan into the following JSON format. This JSON will be used to import the project and its tasks into my task manager.\n\nThe JSON structure MUST be as follows:\n\n{\n  \"projectName\": \"STRING - The name of the project (required)\",\n  \"projectDescription\": \"STRING - A brief description of the project (optional)\",\n  \"projectAgentName\": \"STRING - The name of a default agent for all tasks in this project (optional)\",\n  \"tasks\": [\n    {\n      \"title\": \"STRING - The title of the task (required)\",\n      \"description\": \"STRING - A description for the task (optional)\",\n      \"agentName\": \"STRING - The name of a specific agent for this task (optional, overrides projectAgentName if provided for this task)\",\n      \"completed\": BOOLEAN - Whether the task is completed (optional, defaults to false, true/false)\n    }\n    // ... more tasks can be added to the array\n  ]\n}\n\nPlease provide ONLY the JSON output derived from our preceding conversation. Ensure all string values are correctly quoted and boolean values for 'completed' are strictly \`true\` or \`false\` (not strings).`;

    const handleCopyAiPrompt = async () => {
        try {
            await navigator.clipboard.writeText(AI_REVISION_PROMPT);
            toast({
                title: "Prompt Copied!",
                description: "The AI revision prompt has been copied to your clipboard.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (err) {
            console.error("Failed to copy prompt: ", err);
            toast({
                title: "Copy Failed",
                description: "Could not copy the prompt to your clipboard.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleJsonImport = async () => {
        if (!jsonPasteContent) {
            setImportStatus("Error: No JSON content provided.");
            return;
        }
        setIsImporting(true);
        setImportStatus("Importing...");
        try {
            const data: ImportedPlan = JSON.parse(jsonPasteContent);

            if (!data.projectName || typeof data.projectName !== 'string') {
                throw new Error("Missing or invalid 'projectName' in JSON.");
            }
            if (!Array.isArray(data.tasks)) {
                throw new Error("Missing or invalid 'tasks' array in JSON.");
            }

            let importLog = "";

            const projectPayload: ProjectCreateData = {
                name: data.projectName,
                description: data.projectDescription,
            };
            const newProject = await createProject(projectPayload);
            importLog += `Created project: ${newProject.name} (ID: ${newProject.id})\n`;

            for (const task of data.tasks) {
                if (!task.title || typeof task.title !== 'string') {
                    importLog += `Skipping task: Missing or invalid title.\n`;
                    continue;
                }
                const taskPayload: TaskCreateData = {
                    title: task.title,
                    description: task.description,
                    project_id: newProject.id,
                    agent_name: task.agentName ?? data.projectAgentName,
                    completed: task.completed ?? false,
                };
                try {
                    const newTask = await createTask(taskPayload);
                    importLog += `  - Created task: ${newTask.title} (ID: ${newTask.id})\n`;
                } catch (taskError) {
                    importLog += `  - Failed to create task '${task.title}': ${taskError instanceof Error ? taskError.message : String(taskError)}\n`;
                }
            }

            setImportStatus(`Import successful!\n${importLog}`);
            setJsonPasteContent("");
            fetchProjects();
            fetchTasks();

        } catch (err) {
            console.error("Import failed:", err);
            setImportStatus(`Import failed: ${err instanceof Error ? err.message : String(err)}. Check JSON structure and console.`);
        } finally {
            setIsImporting(false);
        }
    };

    useEffect(() => {
        if (!isImportPlanOpen) {
            setImportStatus("");
            setIsImporting(false);
            setJsonPasteContent("");
        }
    }, [isImportPlanOpen]);

    // Define a placeholder name for demonstration
    // const name = 'User';

    return (
        <Box w="100vw" minH="100vh" px={0} mx={0} bg="bg.content">
            <IconButton
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                size="md"
                variant="outline"
                display={{ base: 'block', md: 'none' }}
                onClick={onDrawerOpen}
                position="fixed"
                top="1rem"
                left="1rem"
                zIndex="overlay"
                bg="bg.content"
                borderColor="border.primary"
                _hover={{ bg: "interaction.hover" }}
            />

            <VStack spacing={4} align="stretch" p={{ base: 4, md: 6 }} pt={{ base: "60px", md: 6 }}>
                <HStack 
                    w="full" 
                    justifyContent={{ base: 'center', md: 'space-between' }} 
                    alignItems="center" 
                    mb={4} 
                    px={{ base: 0, md: 2}}
                >
                    <Image
                        src={colorMode === 'dark' ? '/assets/images/logo_dark.png' : '/assets/images/logo_light.png'}
                        alt="Project Manager Logo"
                        h={{ base: "100px", md: "120px" }}
                        objectFit="contain"
                    />
                </HStack>
                
                <Flex align="flex-start" gap={{ base: 4, md: 6 }} w="full" direction={{ base: 'column', md: 'row' }}>
                    <VStack 
                        as="nav"
                        w={{ base: 'full', md: isSidebarCollapsed ? 20 : 60 }} 
                        bg="bg.sidebar" 
                        p={4} 
                        display={{ base: 'none', md: 'flex' }} 
                        transition="width 0.2s ease-in-out"
                        spacing={0} 
                        align="stretch"
                        h="calc(100vh - 100px)"
                        position="sticky"
                        top="20px"
                    >
                        <SidebarContent 
                            activeView={activeView} 
                            setActiveView={setActiveView} 
                            onAddTaskOpen={onAddTaskOpen} 
                            onAddProjectOpen={onAddProjectOpen}
                            onAddAgentOpen={onAddAgentOpen}
                            onImportPlanOpen={onImportPlanOpen}
                            onOpenDevTools={onOpenDevTools}
                            isCollapsed={isSidebarCollapsed}
                            onToggleCollapse={toggleSidebarCollapse}
                        />
                    </VStack>

                    <Drawer isOpen={isDrawerOpen} placement="left" onClose={onDrawerClose}>
                        <DrawerOverlay bg="blackAlpha.600" />
                        <DrawerContent bg="bg.surface">
                            <DrawerCloseButton />
                            <DrawerHeader borderBottomWidth="1px" borderColor="border.divider">Menu</DrawerHeader>
                            <DrawerBody p={0}>
                                <VStack spacing={4} align="stretch" p={5}>
                                    <SidebarContent 
                                        activeView={activeView} 
                                        setActiveView={(view) => { setActiveView(view); onDrawerClose(); }}
                                        onAddTaskOpen={() => { onAddTaskOpen(); onDrawerClose(); }}
                                        onAddProjectOpen={() => { onAddProjectOpen(); onDrawerClose(); }}
                                        onAddAgentOpen={() => { onAddAgentOpen(); onDrawerClose(); }}
                                        onImportPlanOpen={() => { onImportPlanOpen(); onDrawerClose(); }}
                                        onOpenDevTools={() => { onOpenDevTools(); onDrawerClose(); }}
                                        isCollapsed={false} 
                                        onToggleCollapse={() => {}} 
                                    />
                                </VStack>
                            </DrawerBody>
                        </DrawerContent>
                    </Drawer>

                    <Box flex={1} p={{ base: 2, md: 4 }} overflowY="auto" bg="bg.page">
                        {activeView === 'Dashboard' && <Dashboard />}
                        {activeView === 'Workboard' && (
                            <Box>
                                <Tabs 
                                    variant="soft-rounded" 
                                    colorScheme="teal"
                                    mb={4}
                                    index={taskFilters.is_archived === true ? 1 : 0}
                                    onChange={(index) => setTaskFilters({ is_archived: index === 1 })}
                                >
                                    <TabList>
                                        <Tab>Active Tasks</Tab>
                                        <Tab>Archived Tasks</Tab>
                                    </TabList>
                                </Tabs>
                                <TaskList />
                            </Box>
                        )}
                        {activeView === 'Portfolio' && (
                            <Box>
                                <Tabs 
                                    variant="soft-rounded" 
                                    colorScheme="blue" 
                                    mb={4}
                                    index={projectFilters.is_archived === true ? 1 : 0}
                                    onChange={(index) => setProjectFilters({ is_archived: index === 1 })}
                                >
                                    <TabList>
                                        <Tab>Active</Tab>
                                        <Tab>Archived</Tab>
                                    </TabList>
                                </Tabs>
                                <ProjectList />
                            </Box>
                        )}
                        {activeView === 'Registry' && <AgentList />}
                    </Box>
                </Flex>
            </VStack>

            <Modal isOpen={isAddTaskOpen} onClose={onAddTaskClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="bg.modal" color="text.primary" borderColor="border.modal" borderWidth="1px">
                    <ModalCloseButton color="text.secondary" _hover={{ bg: "button.hover.secondary", color: "text.primary" }} />
                    <ModalBody pb={6} pt={3}>
                        <AddTaskForm />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isAddProjectOpen} onClose={onAddProjectClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="bg.modal" color="text.primary" borderColor="border.modal" borderWidth="1px">
                    <ModalCloseButton color="text.secondary" _hover={{ bg: "button.hover.secondary", color: "text.primary" }} />
                    <ModalBody pb={6} pt={3}>
                        <AddProjectForm 
                            onSubmit={async (data) => {
                                await createProject(data);
                                fetchProjects();
                                onAddProjectClose();
                            }}
                            onClose={onAddProjectClose}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isAddAgentOpen} onClose={onAddAgentClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="bg.modal" color="text.primary" borderColor="border.modal" borderWidth="1px">
                    <ModalCloseButton color="text.secondary" _hover={{ bg: "button.hover.secondary", color: "text.primary" }} />
                    <ModalBody pb={6} pt={3}>
                        <AddAgentForm 
                            onSubmit={async (name) => {
                                // Assuming addAgent is available from useAgentStore
                                // You may need to import and use it if not already
                                // For now, just close the modal
                                // TODO: Implement actual agent creation logic
                                onAddAgentClose();
                            }}
                            onClose={onAddAgentClose}
                            initialData={{ name: '' }}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isImportPlanOpen} onClose={onImportPlanClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="bg.modal" color="text.primary" borderColor="border.modal" borderWidth="1px">
                    <ModalHeader color="text.heading">Import Project from JSON</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Text mb={2} color="text.secondary">Paste the JSON content below. You can use the AI prompt to help generate this.</Text>
                        <Textarea
                            placeholder="Paste JSON here..."
                            value={jsonPasteContent}
                            onChange={(e) => setJsonPasteContent(e.target.value)}
                            rows={10}
                            mb={4}
                            bg="bg.input"
                            borderColor="border.input"
                            focusBorderColor="border.focus"
                        />
                        <HStack justify="space-between" mb={4}>
                            <Button 
                                variant="solid" 
                                onClick={handleJsonImport} 
                                isLoading={isImporting} 
                                loadingText="Importing..."
                                bg="bg.button.primary"
                                color="text.button.primary"
                                _hover={{ bg: "bg.button.primary.hover" }}
                            >
                                Import Plan
                            </Button>
                            <Button variant="ghost" onClick={handleCopyAiPrompt} leftIcon={<CopyIcon />} color="text.link">
                                Copy AI Prompt
                            </Button>
                        </HStack>
                        {importStatus && (
                            <Box p={3} bg={importStatus.startsWith("Error") || importStatus.startsWith("Import failed") ? "bg.danger.subtle" : "bg.status.success.subtle"} borderRadius="md" mt={2}>
                                <Text whiteSpace="pre-wrap" fontFamily="mono" fontSize="sm" color={importStatus.startsWith("Error") || importStatus.startsWith("Import failed") ? "text.danger" : "text.status.success"}>
                                    {importStatus}
                                </Text>
                            </Box>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Drawer 
                isOpen={isDevToolsOpen} 
                placement='right' 
                onClose={onCloseDevTools} 
                size='lg'
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth='1px' borderColor="border.primary">
                        <HStack spacing={2}>
                            <Image 
                                src={colorMode === 'dark' ? '/assets/images/icon_dark.png' : '/assets/images/icon_light.png'}
                                alt="Project Manager Icon"
                                boxSize="24px"
                            />
                            <Text>MCP Dev Tools</Text>
                        </HStack>
                    </DrawerHeader>
                    <DrawerBody>
                        <MCPDevTools />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

        </Box>
    );
}
