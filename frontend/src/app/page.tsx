// D:\mcp\task-manager\frontend\src\app\page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
    Container,
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
} from '@chakra-ui/react';
import { AddIcon, ArrowUpIcon, CopyIcon, HamburgerIcon, SettingsIcon } from '@chakra-ui/icons';
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
}

const SidebarContent = ({ activeView, setActiveView, onAddTaskOpen, onAddProjectOpen, onAddAgentOpen, onImportPlanOpen, onOpenDevTools }: SidebarContentProps) => (
    <>
        <HStack justify="space-between" align="center" w="full" pb={3} borderBottomWidth="1px" borderColor="border.primary">
            <Heading size="md" color="text.heading">
                Workflow Console
            </Heading>
            <ThemeToggleButton />
        </HStack>
        <Button
            justifyContent="flex-start"
            onClick={() => setActiveView('Dashboard')}
            colorScheme={activeView === 'Dashboard' ? 'brand' : 'gray'}
            variant={activeView === 'Dashboard' ? 'solid' : 'ghost'}
            bg={activeView === 'Dashboard' ? 'bg.active.nav' : undefined}
            color={activeView === 'Dashboard' ? 'text.button.primary' : 'text.secondary'}
            _hover={{ 
                bg: activeView !== 'Dashboard' ? 'bg.hover.nav' : undefined,
                textDecoration: 'none' 
            }}
            w="full"
        >
            Dashboard
        </Button>
        <Button
            justifyContent="flex-start"
            onClick={() => setActiveView('Workboard')}
            colorScheme={activeView === 'Workboard' ? 'brand' : 'gray'}
            variant={activeView === 'Workboard' ? 'solid' : 'ghost'}
            bg={activeView === 'Workboard' ? 'bg.active.nav' : undefined}
            color={activeView === 'Workboard' ? 'text.button.primary' : 'text.secondary'}
            _hover={{ 
                bg: activeView !== 'Workboard' ? 'bg.hover.nav' : undefined,
                textDecoration: 'none' 
            }}
            w="full"
        >
            Workboard
        </Button>
        <Button
            justifyContent="flex-start"
            onClick={() => setActiveView('Portfolio')}
            colorScheme={activeView === 'Portfolio' ? 'brand' : 'gray'}
            variant={activeView === 'Portfolio' ? 'solid' : 'ghost'}
            bg={activeView === 'Portfolio' ? 'bg.active.nav' : undefined}
            color={activeView === 'Portfolio' ? 'text.button.primary' : 'text.secondary'}
            _hover={{ 
                bg: activeView !== 'Portfolio' ? 'bg.hover.nav' : undefined,
                textDecoration: 'none' 
            }}
            w="full"
        >
            Portfolio
        </Button>
        <Button
            justifyContent="flex-start"
            onClick={() => setActiveView('Registry')}
            colorScheme={activeView === 'Registry' ? 'brand' : 'gray'}
            variant={activeView === 'Registry' ? 'solid' : 'ghost'}
            bg={activeView === 'Registry' ? 'bg.active.nav' : undefined}
            color={activeView === 'Registry' ? 'text.button.primary' : 'text.secondary'}
            _hover={{ 
                bg: activeView !== 'Registry' ? 'bg.hover.nav' : undefined,
                textDecoration: 'none' 
            }}
            w="full"
        >
            Registry
        </Button>
        <Box w="full" pb={4} mb={0} borderTopWidth="1px" borderColor="border.divider" mt={4} pt={4}>
            {activeView === 'Workboard' && (
                <Button 
                    leftIcon={<AddIcon />} 
                    variant="solid" 
                    size="sm" 
                    w="full" 
                    onClick={onAddTaskOpen}
                    bg="bg.button.accent"
                    color="text.button.accent"
                    _hover={{ bg: 'bg.button.accent.hover' }}
                >
                    Add New Task
                </Button>
            )}
            {activeView === 'Portfolio' && (
                <Button 
                    leftIcon={<AddIcon />} 
                    variant="solid" 
                    size="sm" 
                    w="full" 
                    onClick={onAddProjectOpen}
                    bg="bg.button.accent"
                    color="text.button.accent"
                    _hover={{ bg: 'bg.button.accent.hover' }}
                 >
                    Add New Project
                </Button>
            )}
            {activeView === 'Registry' && (
                <Button 
                    leftIcon={<AddIcon />} 
                    variant="solid" 
                    size="sm" 
                    w="full" 
                    onClick={onAddAgentOpen}
                    bg="bg.button.accent"
                    color="text.button.accent"
                    _hover={{ bg: 'bg.button.accent.hover' }}
                >
                    Add New Agent
                </Button>
            )}
        </Box>
        <Box w="full" pt={2} borderTopWidth="1px" borderColor="border.divider" mt={4}>
            <Button 
                leftIcon={<ArrowUpIcon />} 
                variant="solid" 
                size="sm" 
                w="full" 
                onClick={onImportPlanOpen}
                bg="bg.button.action"
                color="text.button.action"
                _hover={{ bg: 'bg.button.action.hover' }}
            >
                Import Plan
            </Button>
        </Box>
        <Box w="full" pt={2} borderTopWidth="1px" borderColor="border.divider" mt={4}>
            <Button 
                leftIcon={<SettingsIcon />} 
                variant="ghost" 
                size="sm" 
                w="full" 
                onClick={onOpenDevTools}
                color="text.secondary"
                _hover={{ bg: 'bg.hover.nav' }} 
            >
                Dev Tools
            </Button>
        </Box>
        <FilterSidebar />
    </>
);

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

    const { isOpen: isAddTaskOpen, onOpen: onAddTaskOpen, onClose: onAddTaskClose } = useDisclosure();
    const { isOpen: isAddProjectOpen, onOpen: onAddProjectOpen, onClose: onAddProjectClose } = useDisclosure();
    const { isOpen: isAddAgentOpen, onOpen: onAddAgentOpen, onClose: onAddAgentClose } = useDisclosure();
    const { isOpen: isImportPlanOpen, onOpen: onImportPlanOpen, onClose: onImportPlanClose } = useDisclosure();
    const { isOpen: isDevToolsOpen, onOpen: onOpenDevTools, onClose: onCloseDevTools } = useDisclosure();

    const [jsonPasteContent, setJsonPasteContent] = React.useState<string>("");
    const [importStatus, setImportStatus] = React.useState<string>("");
    const [isImporting, setIsImporting] = React.useState<boolean>(false);

    useEffect(() => {
        startPolling();
        fetchAgents();
        return () => {
            stopPolling();
        };
    }, [startPolling, stopPolling, fetchAgents]);

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

    return (
        <Box bg="bg.page" minH="100vh">
            <IconButton
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                size="md"
                colorScheme="gray"
                variant="outline"
                display={{ base: 'block', md: 'none' }}
                onClick={onDrawerOpen}
                position="fixed"
                top="1rem"
                left="1rem"
                zIndex="overlay"
                bg="bg.content"
                borderColor="border.primary"
                _hover={{ bg: "button.hover.secondary" }}
            />

            <Container maxW="container.xl" py={8} pt={{ base: "5rem", md: 8 }}>
                <VStack spacing={8} align="stretch">
                    <Heading size="lg" mb={4} color="text.heading" textAlign={{ base: 'center', md: 'left' }}>
                        Project Manager
                    </Heading>
                    <HStack 
                        align="flex-start" 
                        spacing={8} 
                        w="full"
                        direction={{ base: 'column', md: 'row' }}
                    >
                        <VStack
                            as="nav"
                            spacing={4}
                            align="stretch"
                            w="240px"
                            p={5}
                            bg="bg.sidebar"
                            borderRadius="md"
                            display={{ base: 'none', md: 'flex' }}
                        >
                            <SidebarContent 
                                onAddTaskOpen={onAddTaskOpen} 
                                onAddProjectOpen={onAddProjectOpen} 
                                onAddAgentOpen={onAddAgentOpen} 
                                onImportPlanOpen={onImportPlanOpen} 
                                onOpenDevTools={onOpenDevTools} 
                                activeView={activeView} 
                                setActiveView={setActiveView} 
                            />
                        </VStack>

                        <Drawer isOpen={isDrawerOpen} placement="left" onClose={onDrawerClose}>
                            <DrawerOverlay bg="blackAlpha.600" />
                            <DrawerContent bg="bg.sidebar" color="text.primary">
                                <DrawerCloseButton />
                                <DrawerHeader borderBottomWidth="1px" borderColor="border.divider">Menu</DrawerHeader>
                                <DrawerBody p={0}>
                                    <VStack spacing={4} align="stretch" p={5}>
                                        <SidebarContent 
                                            onAddTaskOpen={() => { onAddTaskOpen(); onDrawerClose(); }} 
                                            onAddProjectOpen={() => { onAddProjectOpen(); onDrawerClose(); }} 
                                            onAddAgentOpen={() => { onAddAgentOpen(); onDrawerClose(); }} 
                                            onImportPlanOpen={() => { onImportPlanOpen(); onDrawerClose(); }} 
                                            onOpenDevTools={onOpenDevTools} 
                                            activeView={activeView} 
                                            setActiveView={(view) => { setActiveView(view); onDrawerClose(); }} 
                                        />
                                    </VStack>
                                </DrawerBody>
                            </DrawerContent>
                        </Drawer>

                        <Box
                            flex="1"
                            p={{ base: 4, md: 6 }}
                            overflowY="auto"
                            bg="bg.content"
                        >
                            <Container maxW="container.2xl" py={0} px={0}>
                                {activeView === 'Dashboard' && <Dashboard />}
                                {activeView === 'Workboard' && <TaskList />}
                                {activeView === 'Portfolio' && <ProjectList />}
                                {activeView === 'Registry' && <AgentList />}
                            </Container>
                        </Box>
                    </HStack>
                </VStack>
            </Container>

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
                        <AddProjectForm />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isAddAgentOpen} onClose={onAddAgentClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="bg.modal" color="text.primary" borderColor="border.modal" borderWidth="1px">
                    <ModalCloseButton color="text.secondary" _hover={{ bg: "button.hover.secondary", color: "text.primary" }} />
                    <ModalBody pb={6} pt={3}>
                        <AddAgentForm />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isImportPlanOpen} onClose={onImportPlanClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="bg.modal" color="text.primary" borderColor="border.modal" borderWidth="1px">
                    <ModalHeader borderBottomWidth="1px" borderColor="border.divider">Import Project Plan</ModalHeader>
                    <ModalCloseButton color="text.secondary" _hover={{ bg: "button.hover.secondary", color: "text.primary" }} />
                    <ModalBody pb={6} pt={3}>
                        <VStack spacing={4}>
                            <Text fontSize="sm" color="text.secondary">
                                Paste the JSON content for the project plan below.
                            </Text>
                            <Textarea
                                value={jsonPasteContent}
                                onChange={(e) => setJsonPasteContent(e.target.value)}
                                placeholder='{\n  "projectName": "My Awesome Project",\n  "projectDescription": "Details...",\n  "projectAgentName": "OptionalDefaultAgent",\n  "tasks": [\n    {\n      "title": "First Task",\n      "description": "...",\n      "agentName": "SpecificAgentForTask1"\n    }\n  ]\n}'
                                bg="bg.input"
                                color="text.primary"
                                borderColor="border.input"
                                rows={10}
                                size="sm"
                                isDisabled={isImporting}
                            />
                            <Button 
                                colorScheme="brand"
                                onClick={handleJsonImport} 
                                w="full"
                                isLoading={isImporting}
                                loadingText="Importing..."
                            >
                                Import Pasted JSON
                            </Button>
                            <Button 
                                leftIcon={<CopyIcon />} 
                                colorScheme="gray" 
                                variant="outline"
                                size="sm"
                                onClick={handleCopyAiPrompt} 
                                w="full"
                                mt={2}
                                borderColor="border.primary"
                                color="text.secondary"
                                _hover={{ bg: "button.hover.secondary"}}
                            >
                                Copy AI Prompt for JSON Conversion
                            </Button>
                        </VStack>
                        {importStatus && (
                            <Text fontSize="sm" color={importStatus.startsWith('Error') ? "status.error" : "status.success"} mt={2}>
                                {importStatus}
                            </Text>
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
                        MCP Dev Tools
                    </DrawerHeader>
                    <DrawerBody>
                        <MCPDevTools />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

        </Box>
    );
}
