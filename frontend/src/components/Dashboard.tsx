'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
    Icon,
    Badge,
    Tooltip,
    Skeleton,
    Avatar,
    List,
    ListItem,
    Tag,
    TagLeftIcon,
    Progress,
} from '@chakra-ui/react';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore } from '@/store/projectStore';
import { useAgentStore } from '@/store/agentStore';
import { FaTasks, FaProjectDiagram, FaUsersCog, FaCheckCircle, FaHourglassHalf, FaExclamationTriangle, FaFire, FaRegClock, FaUserTie, FaRegListAlt, FaArrowUp, FaArrowDown, FaSpinner, FaBan, FaArchive } from 'react-icons/fa';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    LabelList,
} from 'recharts';
import { getStatusAttributes, StatusID } from '@/lib/statusUtils';
import { shallow } from 'zustand/shallow';
import { Project } from '@/types/project';
import { Task } from '@/types/task';
import * as api from '@/services/api';

const StatCard = ({ icon, label, value, helpText, iconColor, trend, trendType, onClick }) => (
    <Box
        as={onClick ? 'button' : 'div'}
        p={6}
        shadow="lg"
            borderWidth="1px" 
        borderRadius="xl"
            bg="bg.card"
            borderColor="border.primary"
        transition="all 0.2s"
        _hover={onClick ? { shadow: '2xl', transform: 'translateY(-2px)', borderColor: 'accent.active', cursor: 'pointer' } : {}}
        minH="120px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={4}
    >
        <HStack spacing={4} align="center">
            <Icon as={icon} w={10} h={10} color={iconColor} />
                <Stat>
                    <VStack align="start" spacing={0}>
                        <StatLabel color="text.secondary" fontSize="sm">{label}</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" color="text.primary">{value}</StatNumber>
                        {helpText && <StatHelpText color="text.muted" fontSize="xs">{helpText}</StatHelpText>}
                    </VStack>
                </Stat>
        </HStack>
        {trend !== undefined && (
            <HStack spacing={1} align="center">
                <Icon as={trendType === 'up' ? FaArrowUp : FaArrowDown} color={trendType === 'up' ? 'green.400' : 'red.400'} boxSize={4} />
                <Text color={trendType === 'up' ? 'green.400' : 'red.400'} fontWeight="bold" fontSize="md">{trend > 0 ? '+' : ''}{trend}%</Text>
            </HStack>
        )}
        </Box>
    );

const COLORS = ['#3182ce', '#38a169', '#e53e3e', '#d69e2e', '#805ad5', '#319795', '#f6ad55', '#718096'];

const Dashboard: React.FC = () => {
    const { tasks, loading: isLoadingTasks, error: tasksError } = useTaskStore();
    const taskFilters = useTaskStore(state => state.filters, shallow);
    const { projects, loading: isLoadingProjects, error: projectsError } = useProjectStore();
    const projectFilters = useProjectStore(state => state.filters, shallow);
    const { agents, loading: isLoadingAgents, error: agentsError } = useAgentStore();

    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [isLoadingAll, setIsLoadingAll] = useState(true);
    const [dataReadyForArchivedCalc, setDataReadyForArchivedCalc] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [projectsResponse, tasksResponse] = await Promise.all([
                    api.getProjects({ is_archived: null }),
                    api.getTasks({ is_archived: null })
                ]);

                const projectsToSet = Array.isArray(projectsResponse) ? projectsResponse : (projectsResponse?.projects || []);
                const tasksToSet = Array.isArray(tasksResponse) ? tasksResponse : (tasksResponse?.tasks || []);
                
                setAllProjects(projectsToSet);
                setAllTasks(tasksToSet);
            } catch (error) {
                console.error("Error fetching all projects/tasks for dashboard totals:", error);
                setAllProjects([]);
                setAllTasks([]);
            } finally {
                setIsLoadingAll(false);
                setDataReadyForArchivedCalc(true);
            }
        };
        fetchAllData();
    }, []);

    const filteredTasksForDashboard = useMemo(() => {
        return tasks.filter(task => task.is_archived === taskFilters.is_archived);
    }, [tasks, taskFilters.is_archived]);

    const filteredProjectsForDashboard = useMemo(() => {
        return projects.filter(project => project.is_archived === projectFilters.is_archived);
    }, [projects, projectFilters.is_archived]);

    const totalArchivedProjects = useMemo(() => {
        if (!dataReadyForArchivedCalc) return 0;
        const filtered = allProjects.filter(project => project.is_archived);
        return filtered.length;
    }, [allProjects, dataReadyForArchivedCalc]);

    const totalArchivedTasks = useMemo(() => {
        if (!dataReadyForArchivedCalc) return 0;
        const filtered = allTasks.filter(task => task.is_archived);
        return filtered.length;
    }, [allTasks, dataReadyForArchivedCalc]);

    const taskStats = useMemo(() => {
        let completed = 0;
        let failed = 0;
        let inProgress = 0;
        let blocked = 0;
        let toDo = 0;

        filteredTasksForDashboard.forEach(task => {
            const attributes = task.status ? getStatusAttributes(task.status as StatusID) : null;
            if (attributes) {
                switch (attributes.category) {
                    case 'completed':
                        completed++;
                        break;
                    case 'failed':
                        failed++;
                        break;
                    case 'inProgress':
                        inProgress++;
                        break;
                    case 'blocked':
                        blocked++;
                        break;
                    case 'todo':
                        toDo++;
                        break;
                    default:
                        toDo++;
                        break;
                }
            } else {
                toDo++;
            }
        });
        return { completed, failed, inProgress, blocked, toDo, total: filteredTasksForDashboard.length };
    }, [filteredTasksForDashboard]);

    const totalTasks = taskStats.total;
    const completedTasks = taskStats.completed;
    const pendingTasks = taskStats.toDo;
    const inProgressTasks = taskStats.inProgress;
    const blockedTasks = taskStats.blocked;
    const failedTasks = taskStats.failed;

    const unassignedTasks = useMemo(() => tasks.filter(task => !task.agent_id && !task.agent_name && task.is_archived === taskFilters.is_archived), [tasks, taskFilters.is_archived]);
    const agentsWithTasks = agents.filter(agent => tasks.some(task => task.agent_id === agent.id));
    const idleAgents = agents.filter(agent => !tasks.some(task => task.agent_id === agent.id));
    const activeAgents = agentsWithTasks.length;

    const tasksOverTime = useMemo(() => {
        const days = Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            return d.toISOString().slice(0, 10);
        });
        return days.map(date => {
            const created = tasks.filter(t => t.created_at && t.created_at.slice(0, 10) === date && t.is_archived === taskFilters.is_archived).length;
            const completedInPeriod = tasks.filter(t => t.completed && t.updated_at && t.updated_at.slice(0, 10) === date && t.is_archived === taskFilters.is_archived).length;
            return { date, created, completed: completedInPeriod };
        });
    }, [tasks, taskFilters.is_archived]);

    const tasksPerProject = useMemo(() => {
        return filteredProjectsForDashboard.map((project, i) => ({
            name: project.name,
            value: filteredTasksForDashboard.filter(t => t.project_id === project.id).length,
            color: COLORS[i % COLORS.length],
            progress: (() => {
                const totalProjectTasks = filteredTasksForDashboard.filter(t => t.project_id === project.id).length;
                const doneProjectTasks = filteredTasksForDashboard.filter(t => t.project_id === project.id && t.completed).length;
                return totalProjectTasks > 0 ? Math.round((doneProjectTasks / totalProjectTasks) * 100) : 0;
            })(),
        })).sort((a, b) => b.value - a.value);
    }, [filteredProjectsForDashboard, filteredTasksForDashboard]);

    const tasksPerAgent = useMemo(() => {
        const agentData = agents.map((agent, i) => ({
            name: agent.name,
            value: filteredTasksForDashboard.filter(t => t.agent_id === agent.id).length,
            color: COLORS[i % COLORS.length],
        }));
        const unassignedCount = unassignedTasks.length;
        if (unassignedCount > 0) {
            agentData.push({ name: 'Unassigned', value: unassignedCount, color: '#CBD5E1' });
        }
        return agentData.sort((a, b) => b.value - a.value);
    }, [agents, filteredTasksForDashboard, unassignedTasks]);

    const statusCounts = useMemo(() => {
        const counts: { [category: string]: number } = {
            'To Do': 0,
            'In Progress': 0,
            'Blocked': 0,
            'Completed': 0,
            'Failed': 0,
        };

        filteredTasksForDashboard.forEach(task => {
            const attributes = task.status ? getStatusAttributes(task.status as StatusID) : null;
            if (attributes) {
                if (attributes.category === 'todo') counts['To Do']++;
                else if (attributes.category === 'inProgress') counts['In Progress']++;
                else if (attributes.category === 'blocked') counts['Blocked']++;
                else if (attributes.category === 'completed') counts['Completed']++;
                else if (attributes.category === 'failed') counts['Failed']++;
                } else {
                counts['To Do']++;
            }
        });

        return Object.entries(counts)
            .filter(([name, value]) => value > 0)
            .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
    }, [filteredTasksForDashboard]);

    const topAgents = tasksPerAgent.filter(a => a.name !== 'Unassigned').slice(0, 3);
    const topProjects = tasksPerProject.slice(0, 3);

    const recentActivity = useMemo(() => {
        return filteredTasksForDashboard
            .slice()
            .sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime())
            .slice(0, 5)
            .map(task => ({
                type: task.completed ? 'Completed' : (task.status || 'Updated'),
                title: task.title,
                date: task.updated_at || task.created_at,
                agent: agents.find(a => a.id === task.agent_id)?.name,
                project: filteredProjectsForDashboard.find(p => p.id === task.project_id)?.name,
            }));
    }, [filteredTasksForDashboard, agents, filteredProjectsForDashboard]);

    const displayTotalProjects = filteredProjectsForDashboard.length;
    const displayTotalTasks = totalTasks;

    if (isLoadingTasks || isLoadingProjects || isLoadingAgents || isLoadingAll) {
        return (
            <VStack flex={1} justify="center" align="center" spacing={4} minH="400px">
                <Spinner size="xl" color="blue.400" />
                <Text color="text.secondary">Loading dashboard data...</Text>
            </VStack>
        );
    }
    if (tasksError || projectsError || agentsError) {
        return (
            <VStack flex={1} justify="center" align="center" spacing={4} minH="400px">
                <Icon as={FaTasks} w={12} h={12} color="red.400" />
                <Heading size="md" color="text.critical">Error Loading Dashboard</Heading>
                <Text color="text.secondary">There was an issue fetching data. Please try refreshing.</Text>
                {tasksError && <Text color="text.critical" fontSize="sm">Tasks: {tasksError}</Text>}
                {projectsError && <Text color="text.critical" fontSize="sm">Projects: {projectsError}</Text>}
                {agentsError && <Text color="text.critical" fontSize="sm">Agents: {agentsError}</Text>}
            </VStack>
        );
    }

    return (
        <VStack spacing={8} align="stretch" w="full" maxW="1400px" mx="auto" py={6}>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                <Skeleton isLoaded={!isLoadingProjects && !isLoadingTasks && !isLoadingAgents} height="120px" borderRadius="xl">
                    <StatCard 
                        icon={FaProjectDiagram} 
                        label={projectFilters.is_archived ? "Archived Projects (Filtered View)" : "Active Projects (Filtered View)"} 
                        value={displayTotalProjects} 
                        iconColor="accent.500" 
                        onClick={() => {/* Potentially navigate to projects view */}}
                    />
                </Skeleton>
                <Skeleton isLoaded={!isLoadingProjects && !isLoadingTasks && !isLoadingAgents} height="120px" borderRadius="xl">
                    <StatCard 
                        icon={FaTasks} 
                        label={taskFilters.is_archived ? "Archived Tasks (Filtered View)" : "Active Tasks (Filtered View)"} 
                        value={displayTotalTasks} 
                        iconColor="brand.500" 
                        onClick={() => {/* Potentially navigate to tasks view */}}
                    />
                </Skeleton>
                <Skeleton isLoaded={!isLoadingAll} height="120px" borderRadius="xl">
                    <StatCard
                        icon={FaArchive}
                        label={<Tooltip label="Total count of all archived projects in the system." placement="top" hasArrow><span>Total Archived Projects</span></Tooltip>}
                        value={totalArchivedProjects}
                        iconColor="gray.600"
                    />
                </Skeleton>
                <Skeleton isLoaded={!isLoadingAll} height="120px" borderRadius="xl">
                    <StatCard
                        icon={FaArchive}
                        label={<Tooltip label="Total count of all archived tasks in the system." placement="top" hasArrow><span>Total Archived Tasks</span></Tooltip>}
                        value={totalArchivedTasks}
                        iconColor="gray.600"
                    />
                </Skeleton>
                <StatCard icon={FaCheckCircle} label="Completed Tasks (Filtered)" value={completedTasks} iconColor="success.500" />
                <StatCard icon={FaHourglassHalf} label="Pending Tasks (To Do, Filtered)" value={pendingTasks} iconColor="warning.500" />
                <StatCard icon={FaSpinner} label="In Progress Tasks" value={inProgressTasks} iconColor="blue.500" />
                <StatCard icon={FaBan} label="Blocked Tasks" value={blockedTasks} iconColor="orange.500" />
                <StatCard icon={FaExclamationTriangle} label="Failed Tasks" value={failedTasks} iconColor="red.600" />
                <StatCard icon={FaUsersCog} label="Registered Agents" value={agents.length} iconColor="purple.500" />
                <StatCard icon={FaUserTie} label="Active Agents" value={activeAgents} iconColor="info.500" />
                <StatCard icon={FaRegClock} label="Idle Agents" value={idleAgents.length} iconColor="text.muted" />
                <StatCard icon={FaFire} label="Unassigned Tasks" value={unassignedTasks.length} iconColor="warning.500" />
            </SimpleGrid>

            {/* Unassigned Tasks List */}
            {unassignedTasks.length > 0 && (
                <Box bg="bg.surface" borderRadius="lg" p={4} borderWidth="1px" borderColor="border.secondary" shadow="md" mt={5}>
                    <Heading size="sm" color="text.primary" mb={2}>Unassigned Tasks</Heading>
                    <List spacing={2}>
                        {unassignedTasks.slice(0,5).map(task => (
                            <ListItem key={task.id}>
                                <HStack>
                                    <Tag colorScheme={getStatusAttributes(task.status as StatusID)?.colorScheme || "gray"} size="sm">
                                        <TagLeftIcon as={getStatusAttributes(task.status as StatusID)?.icon || FaTasks} />
                                        {task.status || "Unknown"}
                                    </Tag>
                                    <Text fontWeight="medium" noOfLines={1}>{task.title}</Text>
                                    {task.project_id && projects.find(p => p.id === task.project_id) &&
                                        <Text fontSize="xs" color="text.secondary" noOfLines={1}> P: {projects.find(p => p.id === task.project_id)?.name}</Text>
                                    }
                                </HStack>
                            </ListItem>
                        ))}
                        {unassignedTasks.length > 5 && <Text fontSize="sm" color="text.secondary" mt={2}>...and {unassignedTasks.length - 5} more.</Text>}
                    </List>
                </Box>
            )}

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                {/* Task Status Donut */}
                <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" borderWidth="1px" borderColor="border.primary" minH="340px">
                    <Heading size="sm" mb={4} color="text.heading">Tasks per Status</Heading>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={statusCounts}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={90}
                                dataKey="value"
                                isAnimationActive
                            >
                                {statusCounts.map((entry, i) => (
                                    <Cell key={`cell-${i}`} fill={entry.color} />
                                ))}
                                <LabelList dataKey="name" position="outside" fill="#444" fontSize={12} />
                                <LabelList dataKey="value" position="inside" fill="#fff" fontSize={14} fontWeight="bold" />
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
                {/* Tasks Over Time Line Chart */}
                <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" borderWidth="1px" borderColor="border.primary" minH="340px">
                    <Heading size="sm" mb={4} color="text.heading">Tasks Over Time</Heading>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={tasksOverTime} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={12} />
                            <YAxis fontSize={12} allowDecimals={false} />
                            <RechartsTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="created" stroke="#3182ce" name="Created" strokeWidth={2} dot />
                            <Line type="monotone" dataKey="completed" stroke="#38a169" name="Completed" strokeWidth={2} dot />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" borderWidth="1px" borderColor="border.primary" minH="340px">
                    <Heading size="sm" mb={4} color="text.heading">Project Progress</Heading>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={tasksPerProject} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" fontSize={12} allowDecimals={false} />
                            <YAxis dataKey="name" type="category" fontSize={12} width={120} />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="value" name="Tasks" isAnimationActive>
                                {tasksPerProject.map((entry, i) => (
                                    <Cell key={`cell-${i}`} fill={entry.color} />
                                ))}
                                <LabelList dataKey="value" position="right" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <VStack align="stretch" mt={4} spacing={2}>
                        {tasksPerProject.slice(0, 5).map(project => (
                            <Box key={project.name}>
                                <Text fontSize="xs" color="text.secondary" mb={1}>{project.name} Progress</Text>
                                <Progress value={project.progress} size="sm" colorScheme="green" borderRadius="full" />
                            </Box>
                        ))}
                    </VStack>
                </Box>
                <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" borderWidth="1px" borderColor="border.primary" minH="340px">
                    <Heading size="sm" mb={4} color="text.heading">Agent Workload</Heading>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={tasksPerAgent} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" fontSize={12} allowDecimals={false} />
                            <YAxis dataKey="name" type="category" fontSize={12} width={120} />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="value" name="Tasks" isAnimationActive>
                                {tasksPerAgent.map((entry, i) => (
                                    <Cell key={`cell-${i}`} fill={entry.color} />
                                ))}
                                <LabelList dataKey="value" position="right" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" borderWidth="1px" borderColor="border.primary" minH="220px">
                    <Heading size="sm" mb={4} color="text.heading">Top 3 Busiest Agents</Heading>
                    <List spacing={2}>
                        {topAgents.length === 0 ? <Text color="text.secondary">No agent data.</Text> : topAgents.map(agent => (
                            <ListItem key={agent.name}>
                                <HStack>
                                    <Avatar name={agent.name} size="sm" />
                                    <Text fontWeight="bold">{agent.name}</Text>
                                    <Badge colorScheme="purple">{agent.value} tasks</Badge>
                                </HStack>
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" borderWidth="1px" borderColor="border.primary" minH="220px">
                    <Heading size="sm" mb={4} color="text.heading">Top 3 Projects by Workload</Heading>
                    <List spacing={2}>
                        {topProjects.length === 0 ? <Text color="text.secondary">No project data.</Text> : topProjects.map(project => (
                            <ListItem key={project.name}>
                                <HStack>
                                    <FaRegListAlt color="#3182ce" />
                                    <Text fontWeight="bold">{project.name}</Text>
                                    <Badge colorScheme="blue">{project.value} tasks</Badge>
                                </HStack>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </SimpleGrid>

            <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" borderWidth="1px" borderColor="border.primary" minH="180px">
                <Heading size="sm" mb={4} color="text.heading">Recent Activity</Heading>
                <List spacing={2}>
                    {recentActivity.length === 0 ? <Text color="text.secondary">No recent activity.</Text> : recentActivity.map((item, i) => (
                        <ListItem key={i}>
                            <HStack>
                                <Badge colorScheme={item.type === 'Completed' ? 'green' : 'gray'}>{item.type}</Badge>
                                <Text fontWeight="bold">{item.title}</Text>
                                {item.agent && <Text fontSize="xs" color="text.secondary">Agent: {item.agent}</Text>}
                                {item.project && <Text fontSize="xs" color="text.secondary">Project: {item.project}</Text>}
                                <Text fontSize="xs" color="text.muted">{item.date ? new Date(item.date).toLocaleString() : ''}</Text>
                            </HStack>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </VStack>
    );
};

export default Dashboard; 