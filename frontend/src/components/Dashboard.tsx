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
    Icon,
    useTheme
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

const StatCard = ({ icon, label, value, helpText, iconToken }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    helpText?: string;
    iconToken: string;
}) => {
    return (
        <Box 
            p={5} 
            shadow="md" 
            borderWidth="1px" 
            borderRadius="lg" 
            bg="bg.card"
            borderColor="border.primary"
        >
            <HStack spacing={4}>
                <Icon as={icon} w={8} h={8} color={iconToken} />
                <Stat>
                    <VStack align="start" spacing={0}>
                        <StatLabel color="text.secondary" fontSize="sm">{label}</StatLabel>
                        <StatNumber fontSize="2xl" fontWeight="medium" color="text.primary">{value}</StatNumber>
                        {helpText && <StatHelpText color="text.muted" fontSize="xs">{helpText}</StatHelpText>}
                    </VStack>
                </Stat>
            </HStack>
        </Box>
    );
};

const Dashboard: React.FC = () => {
    const { tasks, fetchTasks, loading: isLoadingTasks, error: tasksError } = useTaskStore();
    const { projects, fetchProjects, loading: isLoadingProjects, error: projectsError } = useProjectStore();
    const { agents, fetchAgents, loading: isLoadingAgents, error: agentsError } = useAgentStore();
    const theme = useTheme();

    const headingColor = useColorModeValue(theme.semanticTokens.colors['text.heading']?._light ?? 'neutral.900', theme.semanticTokens.colors['text.heading']?._dark ?? 'whiteAlpha.900');
    const textColor = useColorModeValue(theme.semanticTokens.colors['text.secondary']?._light ?? 'neutral.600', theme.semanticTokens.colors['text.secondary']?._dark ?? 'neutral.400');
    const chartTextColor = useColorModeValue(theme.semanticTokens.colors['text.secondary']?._light ?? 'neutral.600', theme.semanticTokens.colors['text.secondary']?._dark ?? 'neutral.400');
    const chartGridColor = useColorModeValue(theme.semanticTokens.colors['border.secondary']?._light ?? 'neutral.200', theme.semanticTokens.colors['border.secondary']?._dark ?? 'neutral.700');
    const tooltipBg = useColorModeValue(theme.semanticTokens.colors['bg.tooltip']?._light ?? 'neutral.800', theme.semanticTokens.colors['bg.tooltip']?._dark ?? 'neutral.600');
    const tooltipBorder = useColorModeValue(theme.semanticTokens.colors['border.primary']?._light ?? 'neutral.300', theme.semanticTokens.colors['border.primary']?._dark ?? 'neutral.600');
    const tooltipLabelColor = useColorModeValue(theme.semanticTokens.colors['text.primary']?._light ?? 'neutral.900', theme.semanticTokens.colors['text.primary']?._dark ?? 'whiteAlpha.900');
    const tooltipItemColor = useColorModeValue(theme.semanticTokens.colors['text.secondary']?._light ?? 'neutral.600', theme.semanticTokens.colors['text.secondary']?._dark ?? 'neutral.400');
    const statusWarningColor = useColorModeValue(theme.semanticTokens.colors['status.warning']?._light ?? 'yellow.500', theme.semanticTokens.colors['status.warning']?._dark ?? 'yellow.300');
    const statusSuccessColor = useColorModeValue(theme.semanticTokens.colors['status.success']?._light ?? 'green.500', theme.semanticTokens.colors['status.success']?._dark ?? 'green.300');

    useEffect(() => {
        fetchTasks();
        fetchProjects();
        fetchAgents();
    }, [fetchTasks, fetchProjects, fetchAgents]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    const tasksPerProjectData = useMemo(() => {
        const projectTaskCounts: { [projectName: string]: number } = {};
        tasks.forEach(task => {
            const project = projects.find(p => p.id === task.project_id);
            const projectName = project?.name || (task.project_id ? `Project ID: ${task.project_id}` : 'Unassigned');
            projectTaskCounts[projectName] = (projectTaskCounts[projectName] || 0) + 1;
        });
        return Object.entries(projectTaskCounts).map(([name, count]) => ({ name, tasks: count }));
    }, [tasks, projects]);

    const tasksPerAgentData = useMemo(() => {
        const agentTaskCounts: { [agentName: string]: number } = {};
        tasks.forEach(task => {
            const agentName = task.agent_name || 'Unassigned';
            agentTaskCounts[agentName] = (agentTaskCounts[agentName] || 0) + 1;
        });
        return Object.entries(agentTaskCounts).map(([name, count]) => ({ name, tasks: count }));
    }, [tasks]);

    const taskStatusData = useMemo(() => [
        { name: 'Pending', value: pendingTasks },
        { name: 'Completed', value: completedTasks },
    ], [pendingTasks, completedTasks]);

    const COLORS = { Pending: statusWarningColor, Completed: statusSuccessColor };

    if (isLoadingTasks || isLoadingProjects || isLoadingAgents) {
        return (
            <VStack flex={1} justify="center" align="center" spacing={4} minH="400px">
                <Spinner size="xl" color="icon.primary" />
                <Text color={textColor}>Loading dashboard data...</Text>
            </VStack>
        );
    }

    if (tasksError || projectsError || agentsError) {
        return (
            <VStack flex={1} justify="center" align="center" spacing={4} minH="400px">
                <Icon as={FaTasks} w={12} h={12} color="status.error" />
                <Heading size="md" color="text.critical">Error Loading Dashboard</Heading>
                <Text color={textColor}>There was an issue fetching data. Please try refreshing.</Text>
                {tasksError && <Text color="text.critical" fontSize="sm">Tasks: {tasksError}</Text>}
                {projectsError && <Text color="text.critical" fontSize="sm">Projects: {projectsError}</Text>}
                {agentsError && <Text color="text.critical" fontSize="sm">Agents: {agentsError}</Text>}
            </VStack>
        );
    }

    return (
        <Box p={6} borderRadius="lg" w="full">
            <Heading size="lg" mb={6} color={headingColor}>Dashboard Overview</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
                <StatCard 
                    icon={FaProjectDiagram} 
                    label="Total Projects" 
                    value={projects.length} 
                    iconToken="icon.stat.project"
                />
                <StatCard 
                    icon={FaTasks} 
                    label="Total Tasks" 
                    value={totalTasks} 
                    iconToken="icon.stat.task"
                />
                <StatCard 
                    icon={FaUsersCog} 
                    label="Registered Agents" 
                    value={agents.length} 
                    iconToken="icon.stat.agent"
                />
            </SimpleGrid>

            <Heading size="md" mb={4} color={headingColor}>Task Status</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
                <StatCard 
                    icon={FaCheckCircle} 
                    label="Completed Tasks" 
                    value={completedTasks} 
                    helpText={`${totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0}% of total`} 
                    iconToken="icon.stat.completed"
                />
                <StatCard 
                    icon={FaHourglassHalf} 
                    label="Pending Tasks" 
                    value={pendingTasks} 
                    helpText={`${totalTasks > 0 ? ((pendingTasks / totalTasks) * 100).toFixed(1) : 0}% of total`} 
                    iconToken="icon.stat.pending"
                />
            </SimpleGrid>

            <Divider my={8} borderColor="border.divider" />

            <Text color={textColor} fontSize="sm">
                Graphs and detailed workload charts will be added here in a future update.
            </Text>

            <Heading size="md" mt={8} mb={4} color={headingColor}>Tasks per Project</Heading>
            <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" mb={8} minH="300px">
                {tasksPerProjectData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={tasksPerProjectData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                            <XAxis dataKey="name" stroke={chartTextColor} fontSize="12px" />
                            <YAxis stroke={chartTextColor} fontSize="12px" allowDecimals={false}/>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: tooltipBg,
                                    borderColor: tooltipBorder,
                                    borderWidth: '1px', 
                                    borderRadius: theme.radii.md
                                }}
                                labelStyle={{ color: tooltipLabelColor }}
                                itemStyle={{ color: tooltipItemColor }}
                            />
                            <Legend wrapperStyle={{ color: chartTextColor, fontSize: '12px' }}/>
                            <Bar dataKey="tasks" fill={theme.colors.purple[500]} name="Tasks" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Text color={textColor} textAlign="center" pt={10}>No project data to display.</Text>
                )}
            </Box>

            <Heading size="md" mb={4} color={headingColor}>Tasks per Agent</Heading>
            <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" mb={8} minH="300px">
                {tasksPerAgentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={tasksPerAgentData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                            <XAxis dataKey="name" stroke={chartTextColor} fontSize="12px" />
                            <YAxis stroke={chartTextColor} fontSize="12px" allowDecimals={false}/>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: tooltipBg,
                                    borderColor: tooltipBorder,
                                    borderWidth: '1px', 
                                    borderRadius: theme.radii.md
                                }}
                                labelStyle={{ color: tooltipLabelColor }}
                                itemStyle={{ color: tooltipItemColor }}
                            />
                            <Legend wrapperStyle={{ color: chartTextColor, fontSize: '12px' }}/>
                            <Bar dataKey="tasks" fill={theme.colors.brand[500]} name="Tasks" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <Text color={textColor} textAlign="center" pt={10}>No agent data to display.</Text>
                )}
            </Box>
            
            <Heading size="md" mb={4} color={headingColor}>Task Status Distribution</Heading>
            <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" mb={8} minH="300px">
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
                                <LabelList dataKey="value" position="inside" fill="#FFFFFF" stroke="none" fontSize={14} fontWeight="bold" formatter={(value: number) => `${totalTasks > 0 ? ((value / totalTasks) * 100).toFixed(0) : 0}%`} />

                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: tooltipBg,
                                    borderColor: tooltipBorder,
                                    borderWidth: '1px', 
                                    borderRadius: theme.radii.md
                                }}
                                labelStyle={{ color: tooltipLabelColor }}
                                itemStyle={{ color: tooltipItemColor }}
                            />
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