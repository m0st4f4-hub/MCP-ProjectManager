import React from 'react';
import {
    Box,
    Heading,
    Text
} from '@chakra-ui/react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    LabelList
} from 'recharts';

interface StatusCountItem {
    name: string;
    value: number;
    color: string;
}

interface TaskStatusChartProps {
    statusCounts: StatusCountItem[];
}

const TaskStatusChart: React.FC<TaskStatusChartProps> = ({ statusCounts }) => {
    if (!statusCounts || statusCounts.length === 0) {
        return (
            <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" borderWidth="1px" borderColor="border.primary" minH="340px">
                <Heading size="sm" mb={4} color="text.heading">
                    Tasks per Status (All Active Projects)
                </Heading>
                <Text color="text.secondary">No data available for task statuses.</Text>
            </Box>
        );
    }

    return (
        <Box p={4} bg="bg.card" borderRadius="lg" shadow="md" borderWidth="1px" borderColor="border.primary" minH="340px">
            <Heading size="sm" mb={4} color="text.heading">
                Tasks per Status (All Active Projects)
            </Heading>
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
    );
};

export default TaskStatusChart; 