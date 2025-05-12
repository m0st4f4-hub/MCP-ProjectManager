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
    Textarea
} from '@chakra-ui/react';
import { AddIcon, ArrowUpIcon, CopyIcon } from '@chakra-ui/icons';
import TaskList from '@/components/TaskList';
import AddTaskForm from '@/components/AddTaskForm';
import ProjectList from '@/components/ProjectList';
import AddProjectForm from '@/components/AddProjectForm';
import AgentList from '@/components/AgentList';
import AddAgentForm from '@/components/AddAgentForm';
import { useTaskStore, TaskState } from '@/store/taskStore'; // Added TaskState
import { useProjectStore, ProjectState } from '@/store/projectStore'; // Added ProjectState
import { useAgentStore, AgentState } from '@/store/agentStore'; // Added AgentState
import FilterSidebar from '@/components/common/FilterSidebar';
import { createProject, createTask, getProjects } from '@/services/api';
import { ProjectCreateData } from '@/types/project'; // Or just '@/types' if it re-exports
import { TaskCreateData } from '@/types/task'; // Or just '@/types' if it re-exports
import Dashboard from '@/components/Dashboard';

export default function Home() {
    const error = useTaskStore((state: TaskState) => state.error);
    const fetchTasks = useTaskStore((state: TaskState) => state.fetchTasks);
    const startPolling = useTaskStore((state: TaskState) => state.startPolling);
    const stopPolling = useTaskStore((state: TaskState) => state.stopPolling);
    const fetchProjects = useProjectStore((state: ProjectState) => state.fetchProjects);
    const fetchAgents = useAgentStore((state: AgentState) => state.fetchAgents);
    const toast = useToast();
    const [activeView, setActiveView] = useState('Dashboard');

    // Modal states
    const { isOpen: isAddTaskOpen, onOpen: onAddTaskOpen, onClose: onAddTaskClose } = useDisclosure();
    const { isOpen: isAddProjectOpen, onOpen: onAddProjectOpen, onClose: onAddProjectClose } = useDisclosure();
    const { isOpen: isAddAgentOpen, onOpen: onAddAgentOpen, onClose: onAddAgentClose } = useDisclosure();
    const { isOpen: isImportPlanOpen, onOpen: onImportPlanOpen, onClose: onImportPlanClose } = useDisclosure();

    const [jsonPasteContent, setJsonPasteContent] = React.useState<string>("");
    const [importStatus, setImportStatus] = React.useState<string>("");
    const [isImporting, setIsImporting] = React.useState<boolean>(false);

    useEffect(() => {
        startPolling();
        return () => {
            stopPolling();
        };
    }, [startPolling, stopPolling]);

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

    // Function to pass to forms to close modal on successful submission or cancel
    // For now, we assume forms handle their own internal state or the modal's default close button is used.
    // This can be enhanced if forms need to explicitly trigger modal close.

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
        if (!jsonPasteContent.trim()) {
            setImportStatus("Error: JSON content cannot be empty.");
            return;
        }

        setIsImporting(true);
        setImportStatus("Parsing pasted JSON...");
        try {
            const plan = JSON.parse(jsonPasteContent);

            setImportStatus("Plan parsed. Validating structure...");
            if (!plan.projectName || !Array.isArray(plan.tasks)) {
                throw new Error("Invalid plan structure: Missing projectName or tasks array.");
            }

            let newProjectId: number | undefined;
            let projectWasExisting = false;

            try {
                setImportStatus(`Attempting to create project: ${plan.projectName}...`);
                const projectData: ProjectCreateData = {
                    name: plan.projectName,
                    description: plan.projectDescription // Optional, will be undefined if not in plan
                };
                const newProject = await createProject(projectData);
                newProjectId = newProject.id;
                setImportStatus(`Project '${plan.projectName}' created with ID: ${newProjectId}. Creating tasks...`);
            } catch (projectCreationError: unknown) {
                const errorMessage = projectCreationError?.message?.toLowerCase() || '';
                // Check for typical "already exists" error messages. Adjust keywords if needed.
                if (errorMessage.includes("already exist") || errorMessage.includes("duplicate") || errorMessage.includes("already registered") || errorMessage.includes("unique constraint failed")) {
                    setImportStatus(`Project '${plan.projectName}' likely already exists. Verifying...`);
                    try {
                        const existingProjects = await getProjects();
                        const foundProject = existingProjects.find(p => p.name === plan.projectName);
                        if (foundProject) {
                            newProjectId = foundProject.id;
                            projectWasExisting = true;
                            setImportStatus(`Using existing project '${plan.projectName}' (ID: ${newProjectId}). Creating tasks...`);
                        } else {
                            // Project creation failed (e.g. "already exists") but couldn't find it by name.
                            throw new Error(`Project creation failed (duplicate?) but could not find '${plan.projectName}' by name to confirm.`);
                        }
                    } catch (fetchExistingError: unknown) {
                        console.error("Error fetching or finding existing project:", fetchExistingError);
                        setImportStatus(`Error: Project '${plan.projectName}' may already exist but failed to retrieve its details. ${fetchExistingError.message}`);
                        setIsImporting(false);
                        return; // Stop import
                    }
                } else {
                    // Different error during project creation, not a simple "already exists"
                    throw projectCreationError;
                }
            }

            if (typeof newProjectId === 'undefined') {
                // This case should ideally be caught by previous error handling, but as a safeguard:
                setImportStatus(`Error: Could not obtain a project ID for '${plan.projectName}'. Import cannot proceed.`);
                setIsImporting(false);
                return;
            }

            setImportStatus(`Processing tasks for project '${plan.projectName}' (ID: ${newProjectId})...`);
            
            let tasksCreatedCount = 0;
            let tasksFailedCount = 0;
            for (const task of plan.tasks) {
                try {
                    setImportStatus(`Creating task: ${task.title}...`);
                    const taskPayload: TaskCreateData = {
                        title: task.title,
                        description: task.description, // Optional
                        project_id: newProjectId,
                        agent_name: task.agentName || plan.projectAgentName || undefined, // Optional
                        completed: task.completed || false // Optional, defaults to false
                    };
                    await createTask(taskPayload);
                    tasksCreatedCount++;
                } catch (taskError) {
                    console.error(`Failed to create task '${task.title}':`, taskError);
                    tasksFailedCount++;
                }
            }
            let finalStatus = `Import finished. Project '${plan.projectName}' (ID: ${newProjectId}) ${projectWasExisting ? 'found and used' : 'processed'}. `;
            finalStatus += `${tasksCreatedCount} tasks created. `;
            if (tasksFailedCount > 0) {
                finalStatus += `${tasksFailedCount} tasks failed. Check console for details.`;
            }
            setImportStatus(finalStatus);

            // Refresh lists
            fetchTasks();
            fetchProjects();
            fetchAgents(); // In case new agents were implicitly referenced or for general consistency

        } catch (error) {
            console.error("Error during import:", error);
            setImportStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        setIsImporting(false);
        // Keep modal open, user can close manually or copy content for retry
    };

    // Reset import status when modal is closed
    useEffect(() => {
        if (!isImportPlanOpen) {
            setImportStatus("");
            setIsImporting(false);
            setJsonPasteContent("");
        }
    }, [isImportPlanOpen]);

    return (
        <Box bg="gray.900" minH="100vh">
            <Container maxW="container.xl" py={8}>
                <VStack spacing={8} align="stretch">
                    <Box>
                        <Heading size="lg" mb={4} color="white">Project Manager</Heading>
                    </Box>
                    <HStack align="flex-start" spacing={8} w="full">
                        <VStack
                            as="nav"
                            spacing={4}
                            align="stretch"
                            w={{ base: 'full', md: '240px' }}
                            p={5}
                            bg="gray.800"
                            borderRadius="md"
                        >
                            <Heading size="md" mb={2} color="whiteAlpha.900" borderBottomWidth="1px" borderColor="gray.700" pb={3}>
                                Workflow Console
                            </Heading>
                            <Button
                                justifyContent="flex-start"
                                onClick={() => setActiveView('Dashboard')}
                                colorScheme={activeView === 'Dashboard' ? 'blue' : 'gray'}
                                variant={activeView === 'Dashboard' ? 'solid' : 'ghost'}
                                color={activeView === 'Dashboard' ? 'white' : 'gray.300'}
                                _hover={{ bg: activeView !== 'Dashboard' ? 'gray.700' : undefined, textDecoration: 'none' }}
                                w="full"
                            >
                                Dashboard
                            </Button>
                            <Button
                                justifyContent="flex-start"
                                onClick={() => setActiveView('Workboard')}
                                colorScheme={activeView === 'Workboard' ? 'blue' : 'gray'}
                                variant={activeView === 'Workboard' ? 'solid' : 'ghost'}
                                color={activeView === 'Workboard' ? 'white' : 'gray.300'}
                                _hover={{ bg: activeView !== 'Workboard' ? 'gray.700' : undefined, textDecoration: 'none' }}
                                w="full"
                            >
                                Workboard
                            </Button>
                            <Button
                                justifyContent="flex-start"
                                onClick={() => setActiveView('Portfolio')}
                                colorScheme={activeView === 'Portfolio' ? 'blue' : 'gray'}
                                variant={activeView === 'Portfolio' ? 'solid' : 'ghost'}
                                color={activeView === 'Portfolio' ? 'white' : 'gray.300'}
                                _hover={{ bg: activeView !== 'Portfolio' ? 'gray.700' : undefined, textDecoration: 'none' }}
                                w="full"
                            >
                                Portfolio
                            </Button>
                            <Button
                                justifyContent="flex-start"
                                onClick={() => setActiveView('Registry')}
                                colorScheme={activeView === 'Registry' ? 'blue' : 'gray'}
                                variant={activeView === 'Registry' ? 'solid' : 'ghost'}
                                color={activeView === 'Registry' ? 'white' : 'gray.300'}
                                _hover={{ bg: activeView !== 'Registry' ? 'gray.700' : undefined, textDecoration: 'none' }}
                                w="full"
                            >
                                Registry
                            </Button>
                            <Box w="full" pb={4} mb={0} borderTopWidth="1px" borderColor="gray.700" mt={4} pt={4}>
                                {activeView === 'Workboard' && (
                                    <Button leftIcon={<AddIcon />} colorScheme="teal" variant="solid" size="sm" w="full" onClick={onAddTaskOpen}>
                                        Add New Task
                                    </Button>
                                )}
                                {activeView === 'Portfolio' && (
                                    <Button leftIcon={<AddIcon />} colorScheme="teal" variant="solid" size="sm" w="full" onClick={onAddProjectOpen}>
                                        Add New Project
                                    </Button>
                                )}
                                {activeView === 'Registry' && (
                                    <Button leftIcon={<AddIcon />} colorScheme="teal" variant="solid" size="sm" w="full" onClick={onAddAgentOpen}>
                                        Add New Agent
                                    </Button>
                                )}
                            </Box>
                            <Box w="full" pt={2} borderTopWidth="1px" borderColor="gray.700" mt={4}>
                                <Button leftIcon={<ArrowUpIcon />} colorScheme="purple" variant="solid" size="sm" w="full" onClick={onImportPlanOpen}>
                                    Import Plan
                                </Button>
                            </Box>

                            <FilterSidebar />

                        </VStack>

                        <VStack flex={1} spacing={8} align="stretch" pl={4}>
                            {activeView === 'Workboard' && (
                                <VStack spacing={8} align="stretch">
                                    <TaskList />
                                </VStack>
                            )}
                            {activeView === 'Portfolio' && (
                                <VStack spacing={8} align="stretch">
                                    <ProjectList />
                                </VStack>
                            )}
                            {activeView === 'Registry' && (
                                <VStack spacing={8} align="stretch">
                                    <AgentList />
                                </VStack>
                            )}
                            {activeView === 'Dashboard' && (
                                <VStack spacing={8} align="stretch">
                                    <Dashboard />
                                </VStack>
                            )}
                        </VStack>
                    </HStack>
                </VStack>
            </Container>

            {/* Add Task Modal */}
            <Modal isOpen={isAddTaskOpen} onClose={onAddTaskClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="gray.800" color="white" borderColor="gray.700" borderWidth="1px">
                    {/* The AddTaskForm already has a Heading, so we might not need ModalHeader if it's redundant */}
                    {/* <ModalHeader borderBottomWidth="1px" borderColor="gray.700">Add New Task</ModalHeader> */}
                    <ModalCloseButton color="gray.300" _hover={{ bg: "gray.700", color: "white" }} />
                    <ModalBody pb={6} pt={3}> {/* Adjusted padding if ModalHeader is removed */}
                        <AddTaskForm />
                        {/* Pass onAddTaskClose to AddTaskForm if it needs to trigger close: 
                        <AddTaskForm onFormSubmit={onAddTaskClose} onCancel={onAddTaskClose} /> 
                        */}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Add Project Modal */}
            <Modal isOpen={isAddProjectOpen} onClose={onAddProjectClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="gray.800" color="white" borderColor="gray.700" borderWidth="1px">
                    {/* <ModalHeader borderBottomWidth="1px" borderColor="gray.700">Add New Project</ModalHeader> */}
                    <ModalCloseButton color="gray.300" _hover={{ bg: "gray.700", color: "white" }} />
                    <ModalBody pb={6} pt={3}>
                        <AddProjectForm />
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Add Agent Modal */}
            <Modal isOpen={isAddAgentOpen} onClose={onAddAgentClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="gray.800" color="white" borderColor="gray.700" borderWidth="1px">
                    {/* <ModalHeader borderBottomWidth="1px" borderColor="gray.700">Add New Agent</ModalHeader> */}
                    <ModalCloseButton color="gray.300" _hover={{ bg: "gray.700", color: "white" }} />
                    <ModalBody pb={6} pt={3}>
                        <AddAgentForm />
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Import Plan Modal */}
            <Modal isOpen={isImportPlanOpen} onClose={onImportPlanClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="gray.800" color="white" borderColor="gray.700" borderWidth="1px">
                    <ModalHeader borderBottomWidth="1px" borderColor="gray.700">Import Project Plan</ModalHeader>
                    <ModalCloseButton color="gray.300" _hover={{ bg: "gray.700", color: "white" }} />
                    <ModalBody pb={6} pt={3}>
                        <VStack spacing={4}>
                            <Text fontSize="sm" color="gray.300">
                                Paste the JSON content for the project plan below.
                            </Text>
                            <Textarea
                                value={jsonPasteContent}
                                onChange={(e) => setJsonPasteContent(e.target.value)}
                                placeholder='{\n  "projectName": "My Awesome Project",\n  "projectDescription": "Details...",\n  "projectAgentName": "OptionalDefaultAgent",\n  "tasks": [\n    {\n      "title": "First Task",\n      "description": "...",\n      "agentName": "SpecificAgentForTask1"\n    }\n  ]\n}'
                                bg="gray.700"
                                color="white"
                                borderColor="gray.600"
                                rows={10}
                                size="sm"
                                isDisabled={isImporting}
                            />
                            <Button 
                                colorScheme="blue" 
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
                            >
                                Copy AI Prompt for JSON Conversion
                            </Button>
                        </VStack>
                        {importStatus && (
                            <Text fontSize="sm" color={importStatus.startsWith('Error') ? "red.300" : "green.300"} mt={2}>
                                {importStatus}
                            </Text>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

        </Box>
    );
}
