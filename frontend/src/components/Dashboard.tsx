'use client';

import React, { useEffect, useMemo } from 'react';
import {
    Box,
    Heading,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    VStack,
    HStack,
    Spinner,
    Text,
    Divider,
    useColorModeValue,
    Icon
} from '@chakra-ui/react';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore } from '@/store/projectStore';
import { useAgentStore } from '@/store/agentStore';
import { FaTasks, FaProjectDiagram, FaUsersCog, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LabelList
} from 'recharts';

const StatCard = ({ icon, label, value, helpText, colorScheme }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    helpText?: string;
    colorScheme?: string;
}) => {
    const bgColor = useColorModeValue('gray.700', 'gray.700');
    const textColor = useColorModeValue('whiteAlpha.900', 'whiteAlpha.900');
    const iconColor = colorScheme ? `${colorScheme}.300` : 'blue.300';

    return (
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor="gray.600">
            <HStack spacing={4}>
                <Icon as={icon} w={8} h={8} color={iconColor} />
                <Stat>
                    <VStack align="start" spacing={0}>
                        <StatLabel color="gray.400" fontSize="sm">{label}</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="medium" color={textColor}>{value}</StatNumber>
                        {helpText && <StatHelpText color="gray.500" fontSize="xs">{helpText}</StatHelpText>}
                    </VStack>
                </Stat>
            </HStack>
        </Box>
    );
};

const Dashboard: React.FC = () => {
    const { tasks, fetchTasks, isLoading: isLoadingTasks, error: tasksError } = useTaskStore();
    const { projects, fetchProjects, isLoading: isLoadingProjects, error: projectsError } = useProjectStore();
    const { agents, fetchAgents, isLoading: isLoadingAgents, error: agentsError } = useAgentStore();

    useEffect(() => {
        fetchTasks();
        fetchProjects();
        fetchAgents();
    }, [fetchTasks, fetchProjects, fetchAgents]);

    const bgColor = useColorModeValue('gray.800', 'gray.800');
    const headingColor = useColorModeValue('whiteAlpha.900', 'whiteAlpha.900');
    const textColor = useColorModeValue('gray.300', 'gray.300');

    if (isLoadingTasks || isLoadingProjects || isLoadingAgents) {
        return (
            <VStack flex={1} justify="center" align="center" spacing={4} minH="400px">
                <Spinner size="xl" color="blue.300" />
                <Text color={textColor}>Loading dashboard data...</Text>
            </VStack>
        );
    }

    if (tasksError || projectsError || agentsError) {
        return (
            <VStack flex={1} justify="center" align="center" spacing={4} minH="400px">
                <Icon as={FaTasks} w={12} h={12} color="red.400" />
                <Heading size="md" color="red.300">Error Loading Dashboard</Heading>
                <Text color={textColor}>There was an issue fetching data. Please try refreshing.</Text>
                {tasksError && <Text color="red.400" fontSize="sm">Tasks: {tasksError}</Text>}
                {projectsError && <Text color="red.400" fontSize="sm">Projects: {projectsError}</Text>}
                {agentsError && <Text color="red.400" fontSize="sm">Agents: {agentsError}</Text>}
            </VStack>
        );
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    // Data for Charts
    const tasksPerProjectData = useMemo(() => {
        const projectTaskCounts: { [projectName: string]: number } = {};
        tasks.forEach(task => {
            const projectName = task.project?.name || 'Unassigned';
            projectTaskCounts[projectName] = (projectTaskCounts[projectName] || 0) + 1;
        });
        return Object.entries(projectTaskCounts).map(([name, count]) => ({ name, tasks: count }));
    }, [tasks]);

    const tasksPerAgentData = useMemo(() => {
        const agentTaskCounts: { [agentName: string]: number } = {};
        tasks.forEach(task => {
            const agentName = task.agent?.name || 'Unassigned';
            agentTaskCounts[agentName] = (agentTaskCounts[agentName] || 0) + 1;
        });
        return Object.entries(agentTaskCounts).map(([name, count]) => ({ name, tasks: count }));
    }, [tasks]);

    const taskStatusData = useMemo(() => [
        { name: 'Pending', value: pendingTasks },
        { name: 'Completed', value: completedTasks },
    ], [pendingTasks, completedTasks]);

    const COLORS = { Pending: '#ECC94B', Completed: '#48BB78' }; // Yellow for Pending, Green for Completed

    const chartCardBg = useColorModeValue('gray.700', 'gray.700');
    const chartTextColor = useColorModeValue('gray.200', 'gray.200');

    return (
        <Box bg={bgColor} p={6} borderRadius="lg" w="full">
            <Heading size="lg" mb={6} color={headingColor}>Dashboard Overview</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
                <StatCard 
                    icon={FaProjectDiagram} 
                    label="Total Projects" 
                    value={projects.length} 
                    colorScheme="purple"
                />
                <StatCard 
                    icon={FaTasks} 
                    label="Total Tasks" 
                    value={totalTasks} 
                    colorScheme="teal"
                />
                <StatCard 
                    icon={FaUsersCog} 
                    label="Registered Agents" 
                    value={agents.length} 
                    colorScheme="orange"
                />
            </SimpleGrid>

            <Heading size="md" mb={4} color={headingColor}>Task Status</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
                <StatCard 
                    icon={FaCheckCircle} 
                    label="Completed Tasks" 
                    value={completedTasks} 
                    helpText={`${totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0}% of total`} 
                    colorScheme="green"
                />
                <StatCard 
                    icon={FaHourglassHalf} 
                    label="Pending Tasks" 
                    value={pendingTasks} 
                    helpText={`${totalTasks > 0 ? ((pendingTasks / totalTasks) * 100).toFixed(1) : 0}% of total`} 
                    colorScheme="yellow"
                />
            </SimpleGrid>

            <Divider my={8} borderColor="gray.600" />

            <Text color={textColor} fontSize="sm">
                Graphs and detailed workload charts will be added here in a future update.
            </Text>

            {/* Placeholder for future charts */}
            {/* E.g., Tasks per Project, Tasks per Agent */}

            <Heading size="md" mt={8} mb={4} color={headingColor}>Tasks per Project</Heading>
            <Box p={4} bg={chartCardBg} borderRadius="lg" shadow="md" mb={8} minH="300px">
                {tasksPerProjectData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={tasksPerProjectData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="name" stroke={chartTextColor} fontSize="12px" />
                            <YAxis stroke={chartTextColor} fontSize="12px" allowDecimals={false}/>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568', borderRadius: 'md'}} 
                                labelStyle={{ color: '#E2E8F0' }}
                                itemStyle={{ color: '#A0AEC0' }}
                            />
                            <Legend wrapperStyle={{ color: chartTextColor, fontSize: '12px' }}/>
                            <Bar dataKey="tasks" fill="#805AD5" name="Tasks" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Text color={textColor} textAlign="center" pt={10}>No project data to display.</Text>
                )}
            </Box>

            <Heading size="md" mb={4} color={headingColor}>Tasks per Agent</Heading>
            <Box p={4} bg={chartCardBg} borderRadius="lg" shadow="md" mb={8} minH="300px">
                {tasksPerAgentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={tasksPerAgentData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="name" stroke={chartTextColor} fontSize="12px" />
                            <YAxis stroke={chartTextColor} fontSize="12px" allowDecimals={false}/>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568', borderRadius: 'md'}} 
                                labelStyle={{ color: '#E2E8F0' }}
                                itemStyle={{ color: '#A0AEC0' }}
                            />
                            <Legend wrapperStyle={{ color: chartTextColor, fontSize: '12px' }}/>
                            <Bar dataKey="tasks" fill="#3182CE" name="Tasks" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Text color={textColor} textAlign="center" pt={10}>No agent data to display.</Text>
                )}
            </Box>
            
            <Heading size="md" mb={4} color={headingColor}>Task Status Distribution</Heading>
            <Box p={4} bg={chartCardBg} borderRadius="lg" shadow="md" mb={8} minH="300px">
                 {(pendingTasks > 0 || completedTasks > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={taskStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {taskStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                                ))}
                                <LabelList dataKey="name" position="outside" fill={chartTextColor} stroke="none" fontSize={12} />
                                <LabelList dataKey="value" position="inside" fill="#FFFFFF" stroke="none" fontSize={14} fontWeight="bold" formatter={(value: number) => `${((value / totalTasks) * 100).toFixed(0)}%`} />

                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568', borderRadius: 'md'}} 
                                labelStyle={{ color: '#E2E8F0' }}
                                itemStyle={{ color: '#A0AEC0' }}
                            />
                            {/* <Legend wrapperStyle={{ color: chartTextColor, fontSize: '12px', paddingTop: '10px' }}/> */}
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <Text color={textColor} textAlign="center" pt={10}>No task status data to display.</Text>
                )}
            </Box>

        </Box>
    );
};

export default Dashboard; 