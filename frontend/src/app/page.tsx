// D:\mcp\task-manager\frontend\src\app\page.tsx
'use client';

import React, { useEffect } from 'react';
import {
    Container,
    VStack,
    Heading,
    Box,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    TabPanel,
    Tab,
    HStack
} from '@chakra-ui/react';
import TaskList from '@/components/TaskList';
import AddTaskForm from '@/components/AddTaskForm';
import ProjectList from '@/components/ProjectList'; 
import AddProjectForm from '@/components/AddProjectForm';
import AgentList from '@/components/AgentList'; 
import AddAgentForm from '@/components/AddAgentForm';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore } from '@/store/projectStore';
import { useAgentStore } from '@/store/agentStore';

export default function Home() {
    const fetchTasks = useTaskStore(state => state.fetchTasks);
    const fetchProjects = useProjectStore(state => state.fetchProjects);
    const fetchAgents = useAgentStore(state => state.fetchAgents);
    const taskError = useTaskStore(state => state.error);
    const projectError = useProjectStore(state => state.error);
    const agentError = useAgentStore(state => state.error);
    const toast = useToast();

    useEffect(() => {
        // Fetch data initially
        fetchTasks();
        fetchProjects();
        fetchAgents();

        // Set up an interval to fetch data every 30 seconds
        const intervalId = setInterval(() => {
            fetchTasks();
            fetchProjects();
            fetchAgents();
        }, 30000); // 30000 milliseconds = 30 seconds

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [fetchTasks, fetchProjects, fetchAgents]);

    useEffect(() => {
        if (taskError) {
            toast({
                title: 'Task Error',
                description: taskError,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }, [taskError, toast]);

    useEffect(() => {
        if (projectError) {
            toast({
                title: 'Project Error',
                description: projectError,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }, [projectError, toast]);

    useEffect(() => {
        if (agentError) {
            toast({
                title: 'Agent Error',
                description: agentError,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }, [agentError, toast]);

    return (
        <Box bg="gray.900" minH="100vh">
            <Container maxW="container.xl" py={8}>
                <VStack spacing={8} align="stretch">
                    <Box>
                        <Heading size="lg" mb={4} color="white">Task Manager</Heading>
                    </Box>
                    <Tabs variant="soft-rounded" colorScheme="blue">
                        <TabList>
                            <Tab color="gray.100" _selected={{ color: 'white', bg: 'blue.500' }}>Tasks</Tab>
                            <Tab color="gray.100" _selected={{ color: 'white', bg: 'blue.500' }}>Projects</Tab>
                            <Tab color="gray.100" _selected={{ color: 'white', bg: 'blue.500' }}>Agents</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <VStack spacing={8} align="stretch">
                                    <AddTaskForm />
                                    <TaskList />
                                </VStack>
                            </TabPanel>
                            <TabPanel>
                                <VStack spacing={8} align="stretch">
                                    <AddProjectForm />
                                    <ProjectList />
                                </VStack>
                            </TabPanel>
                            <TabPanel>
                                <VStack spacing={8} align="stretch">
                                    <AddAgentForm />
                                    <AgentList />
                                </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </VStack>
            </Container>
        </Box>
    );
}
