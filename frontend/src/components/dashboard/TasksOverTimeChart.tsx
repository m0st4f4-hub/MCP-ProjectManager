import React from 'react';
import {
    Box,
    Heading,
    Text
} from '@chakra-ui/react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface TasksOverTimeDataPoint {
    date: string;
    created: number;
    completed: number;
}

interface TasksOverTimeChartProps {
    tasksOverTime: TasksOverTimeDataPoint[];
}

const TasksOverTimeChart: React.FC<TasksOverTimeChartProps> = ({ tasksOverTime }) => {
    if (!tasksOverTime || tasksOverTime.length === 0) {
        return (
            <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" borderWidth="1px" borderColor="border.primary" minH="340px">
                <Heading size="sm" mb={4} color="text.heading">
                    Tasks Over Time (All Active Projects)
                </Heading>
                <Text color="text.secondary">No data available for tasks over time.</Text>
            </Box>
        );
    }
    return (
        <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" borderWidth="1px" borderColor="border.primary" minH="340px">
            <Heading size="sm" mb={4} color="text.heading">
                Tasks Over Time (All Active Projects)
            </Heading>
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
    );
};

export default TasksOverTimeChart; 