// D:\mcp\task-manager\frontend\src\app\page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
    // VStack, // To be replaced
    // Box, // To be replaced
    useToast,
    // HStack, // To be replaced where possible or kept if complex and not simple flex row
    Button, // Keep for modals for now
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Text, // Keep for modals for now, or replace if simple
    Textarea, // Keep for modal
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    IconButton,
    // Flex, // To be replaced
    // Spacer, // Already replaced in SidebarContent
    Tooltip, // Keep
    Image, // Keep
    useColorMode,
    Box,
} from '@chakra-ui/react';
import { AddIcon, ArrowUpIcon, CopyIcon, HamburgerIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon, ViewIcon, EditIcon, SearchIcon, TimeIcon } from '@chakra-ui/icons';
import TaskList from '@/components/TaskList';
import AddTaskForm from '@/components/forms/AddTaskForm';
import ProjectList from '@/components/ProjectList';
import AddProjectForm from '@/components/forms/AddProjectForm';
import AgentList from '@/components/AgentList';
import AddAgentForm from '@/components/forms/AddAgentForm';
import { useTaskStore, TaskState } from '@/store/taskStore';
import { useProjectStore, ProjectState } from '@/store/projectStore';
import { useAgentStore, AgentState } from '@/store/agentStore';
import FilterSidebar from '@/components/common/FilterSidebar';
import { createProject, createTask, createAgent } from '@/services/api';
import { ProjectCreateData } from '@/types/project';
import { TaskCreateData, TaskStatus } from '@/types/task';
import Dashboard from '@/components/Dashboard';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import MCPDevTools from '@/components/MCPDevTools';
import SettingsContent from '@/components/SettingsContent';
import styles from './page.module.css'; 
import sidebarStyles from './Sidebar.module.css'; 
import clsx from 'clsx'; 

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
    const { colorMode } = useColorMode();

    const navItems = [
        { view: 'Dashboard', label: 'Dashboard', icon: <ViewIcon /> },
        { view: 'Workboard', label: 'Workboard', icon: <EditIcon /> },
        { view: 'Portfolio', label: 'Portfolio', icon: <SearchIcon /> },
        { view: 'Registry', label: 'Registry', icon: <TimeIcon /> },
        { view: 'Settings', label: 'Settings', icon: <SettingsIcon /> },
    ];

    if (activeView === 'Workboard') {
        navItems.push({ id: 'addTask', label: 'Add Task', icon: <AddIcon />, action: onAddTaskOpen });
    }
    if (activeView === 'Portfolio') {
        navItems.push({ id: 'addProject', label: 'Add Project', icon: <AddIcon />, action: onAddProjectOpen });
    }
    if (activeView === 'Registry') {
        navItems.push({ id: 'addAgent', label: 'Register Agent', icon: <AddIcon />, action: onAddAgentOpen });
    }

    navItems.push(
        { id: 'importPlan', label: 'Import Plan', icon: <ArrowUpIcon />, action: onImportPlanOpen },
        { id: 'devTools', label: 'Dev Tools', icon: <SettingsIcon />, action: onOpenDevTools }
    );

    return (
        <div className={clsx(sidebarStyles.sidebarRoot, isCollapsed ? sidebarStyles.sidebarRootCollapsed : sidebarStyles.sidebarRootExpanded)}>
            <div className={sidebarStyles.sidebarHeader}>
                {isCollapsed ? (
                    <Image
                        src={colorMode === 'dark' ? '/assets/images/logo_dark.png' : '/assets/images/logo_light.png'}
                        alt="Project Manager Logo"
                        className={sidebarStyles.sidebarLogoCollapsed}
                    />
                ) : (
                    <Image
                        src={colorMode === 'dark' ? '/assets/images/logo_dark.png' : '/assets/images/logo_light.png'}
                        alt="Project Manager Logo"
                        className={sidebarStyles.sidebarLogoExpanded}
                    />
                )}
                {!isCollapsed && <div style={{ marginLeft: 'auto' }} />}
                <ThemeToggleButton />
                <IconButton 
                    aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    onClick={onToggleCollapse}
                    variant="ghost"
                    size="sm"
                    className={sidebarStyles.sidebarToggle}
                />
            </div>

            <div className={sidebarStyles.navButtonVStack}>
                {navItems.map(item => (
                    <Tooltip label={item.label} isDisabled={!isCollapsed} placement="right" key={item.view || item.id}>
                        <button
                            onClick={item.action ? item.action : () => setActiveView(item.view)}
                            className={clsx(
                                sidebarStyles.navButton,
                                !item.action && activeView === item.view && sidebarStyles.navButtonActive,
                                isCollapsed ? sidebarStyles.navButtonJustifyCenter : sidebarStyles.navButtonJustifyStart,
                                isCollapsed ? sidebarStyles.navButtonCollapsed : sidebarStyles.navButtonExpanded
                            )}
                        >
                            <span className={sidebarStyles.navButtonIcon}>{item.icon}</span>
                            {!isCollapsed && <span className={!isCollapsed ? sidebarStyles.navButtonTextExpanded : sidebarStyles.navButtonTextCollapsed}>{item.label}</span>}
                        </button>
                    </Tooltip>
                ))}
            </div>
        </div>
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
    const { colorMode } = useColorMode();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeView, setActiveView] = useState('Dashboard');
    const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

    const { isOpen: isAddTaskOpen, onOpen: onAddTaskOpen, onClose: onAddTaskClose } = useDisclosure();
    const { isOpen: isAddProjectOpen, onOpen: _internalOnAddProjectOpen, onClose: onAddProjectClose } = useDisclosure();
    const { isOpen: isAddAgentOpen, onOpen: onAddAgentOpen, onClose: onAddAgentClose } = useDisclosure();
    const { isOpen: isImportPlanOpen, onOpen: onImportPlanOpen, onClose: onImportPlanClose } = useDisclosure();
    const { isOpen: isDevToolsOpen, onOpen: onOpenDevTools, onClose: onCloseDevTools } = useDisclosure();

    const [jsonPasteContent, setJsonPasteContent] = React.useState<string>("");
    const [importStatus, setImportStatus] = React.useState<string>("");
    const [isImporting, setIsImporting] = React.useState<boolean>(false);

    const projectFilters = useProjectStore(state => state.filters);
    const setProjectFilters = useProjectStore(state => state.setFilters);

    const taskFilters = useTaskStore(state => state.filters);
    const setTaskFilters = useTaskStore(state => state.setFilters);

    console.log('Home render. isAddProjectOpen:', isAddProjectOpen, 'activeView:', activeView, 'isSidebarCollapsed:', isSidebarCollapsed);

    const onAddProjectOpen = () => {
        console.log('Home: onAddProjectOpen logic initiated. Current isAddProjectOpen before call:', isAddProjectOpen);
        _internalOnAddProjectOpen();
    };

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

    useEffect(() => {
        // Consuming filter variables to satisfy ESLint rule
        if (process.env.NODE_ENV === 'development') {
            console.log('Current Project Filters:', projectFilters);
            console.log('Current Task Filters:', taskFilters);
        }
        // setProjectFilters and setTaskFilters are setters, their usage is implied by using the state they set.
    }, [projectFilters, taskFilters, setProjectFilters, setTaskFilters]);

    const AI_REVISION_PROMPT = `Based on our preceding discussion detailing the project plan, please convert that plan into the following JSON format. This JSON will be used to import the project and its tasks into my task manager.\\n\\nThe JSON structure MUST be as follows:\\n\\n{\\n  \"projectName\": \"STRING - The name of the project (required)\",\\n  \"projectDescription\": \"STRING - A brief description of the project (optional)\",\\n  \"projectAgentName\": \"STRING - The name of a default agent for all tasks in this project (optional)\",\\n  \"tasks\": [\\n    {\\n      \"title\": \"STRING - The title of the task (required)\",\\n      \"description\": \"STRING - A description for the task (optional)\",\\n      \"agentName\": \"STRING - The name of a specific agent for this task (optional, overrides projectAgentName if provided for this task)\",\\n      \"completed\": BOOLEAN - Whether the task is completed (optional, defaults to false, true/false)\\n    }\\n    // ... more tasks can be added to the array\\n  ]\\n}\\n\\nPlease provide ONLY the JSON output derived from our preceding conversation. Ensure all string values are correctly quoted and boolean values for 'completed' are strictly \`true\` or \`false\` (not strings).`;

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
            importLog += `Created project: ${newProject.name} (ID: ${newProject.id})\\n`;

            for (const task of data.tasks) {
                if (!task.title || typeof task.title !== 'string') {
                    importLog += `Skipping task: Missing or invalid title.\\n`;
                    continue;
                }
                const taskPayload: TaskCreateData = {
                    title: task.title,
                    description: task.description,
                    project_id: newProject.id,
                    agent_name: task.agentName ?? data.projectAgentName,
                    status: task.completed ? TaskStatus.COMPLETED : TaskStatus.PENDING
                };
                try {
                    const newTask = await createTask(taskPayload);
                    importLog += `  - Created task: ${newTask.title} (ID: ${newTask.id})\\n`;
                } catch (taskError) {
                    importLog += `  - Failed to create task '${task.title}': ${taskError instanceof Error ? taskError.message : String(taskError)}\\n`;
                }
            }

            setImportStatus(`Import successful!\\n${importLog}`);
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

    const renderContent = () => {
        switch (activeView) {
            case 'Dashboard':
                return <Dashboard />;
            case 'Workboard':
                return <TaskList />;
            case 'Portfolio':
                return <ProjectList />;
            case 'Registry':
                return <AgentList />;
            case 'Settings':
                return <SettingsContent />;
            default:
                return null;
        }
    };

    return (
        <main className={styles.pageContainer}>
            <IconButton
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                size="md"
                variant="outline"
                display={{ base: 'block', md: 'none' }}
                onClick={onDrawerOpen}
                className={styles.mobileMenuButton}
                bg="bg.content"
                borderColor="border.primary"
                _hover={{ bg: "interaction.hover" }}
            />

            <div className={styles.mainVStackLayout}>
                <div className={styles.contentFlexContainer}>
                    <nav 
                        className={clsx(
                            styles.desktopSidebar,
                            isSidebarCollapsed ? styles.desktopSidebarCollapsed : styles.desktopSidebarExpanded
                        )}
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
                            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        />
                        {!isSidebarCollapsed && <FilterSidebar />}
                    </nav>

                    <Drawer isOpen={isDrawerOpen} placement="left" onClose={onDrawerClose}>
                        <DrawerOverlay bg="blackAlpha.600" />
                        <DrawerContent bg="bg.surface" className={styles.drawerContent}>
                            <DrawerCloseButton />
                            <DrawerHeader borderBottomWidth="1px" borderColor="border.divider" className={styles.drawerHeader}>Menu</DrawerHeader>
                            <DrawerBody p={0} className={styles.drawerBody}>
                                <div className={styles.drawerSidebarContentContainerLayout}>
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
                                </div>
                            </DrawerBody>
                        </DrawerContent>
                    </Drawer>

                    <section className={styles.mainContentAreaLayout}>
                        {renderContent()}
                    </section>
                </div>
            </div>

            <Modal isOpen={isAddTaskOpen} onClose={onAddTaskClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="bg.modal" color="text.primary" borderColor="border.modal" borderWidth="1px">
                    <ModalCloseButton color="text.secondary" _hover={{ bg: "button.hover.secondary", color: "text.primary" }} />
                    <ModalBody pb={6} pt={3} className={styles.modalBody}>
                        <AddTaskForm />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isAddProjectOpen} onClose={onAddProjectClose} size="xl">
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent bg="bg.modal" color="text.primary" borderColor="border.modal" borderWidth="1px">
                    <ModalCloseButton color="text.secondary" _hover={{ bg: "button.hover.secondary", color: "text.primary" }} />
                    <ModalBody pb={6} pt={3} className={styles.modalBody}>
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
                    <ModalBody pb={6} pt={3} className={styles.modalBody}>
                        <AddAgentForm 
                            onSubmit={async (name: string) => {
                                if (!name.trim()) {
                                    console.error("Agent name cannot be empty.");
                                    return;
                                }
                                try {
                                    await createAgent(name);
                                    fetchAgents();
                                    onAddAgentClose();
                                } catch (error) {
                                    console.error("Failed to create agent:", error);
                                }
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
                    <ModalHeader color="text.heading" className={styles.importPlanModalHeader}>Import Project from JSON</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Text mb={2} color="text.secondary" className={styles.importPlanDescription}>Paste the JSON content below. You can use the AI prompt to help generate this.</Text>
                        <Textarea
                            placeholder="Paste JSON here..."
                            value={jsonPasteContent}
                            onChange={(e) => setJsonPasteContent(e.target.value)}
                            rows={10}
                            mb={4}
                            bg="bg.input"
                            borderColor="border.input"
                            focusBorderColor="border.focus"
                            className={styles.importPlanTextarea}
                        />
                        <div className={styles.importPlanActionsContainer}>
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
                        </div>
                        {importStatus && (
                            <Box 
                                p={3} 
                                bg={importStatus.startsWith("Error") || importStatus.startsWith("Import failed") ? "bg.danger.subtle" : "bg.status.success.subtle"} 
                                borderRadius="md" 
                                mt={2} 
                                className={styles.importPlanStatusBox}
                            >
                                <Text 
                                    fontFamily="mono" 
                                    fontSize="sm" 
                                    color={importStatus.startsWith("Error") || importStatus.startsWith("Import failed") ? "text.danger" : "text.status.success"}
                                    className={styles.importPlanStatusText}
                                >
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
                <DrawerContent bg="bg.surface" className={styles.drawerContent}>
                    <DrawerHeader borderBottomWidth='1px' borderColor="border.primary" className={styles.devToolsDrawerHeader}>
                        <div className={styles.devToolsHeaderContainer}>
                            <Image 
                                src={colorMode === 'dark' ? '/assets/images/icon_dark.png' : '/assets/images/icon_light.png'}
                                alt="Project Manager Icon"
                                boxSize="24px"
                                className={styles.devToolsIcon}
                            />
                            <Text>MCP Dev Tools</Text>
                        </div>
                    </DrawerHeader>
                    <DrawerBody>
                        <MCPDevTools />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

        </main>
    );
}
