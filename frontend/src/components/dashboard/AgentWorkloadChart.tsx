import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    LabelList
} from 'recharts';
import styles from './AgentWorkloadChart.module.css';

interface AgentWorkloadDataPoint {
    name: string;
    value: number; // Number of tasks
    color: string;
}

interface AgentWorkloadChartProps {
    tasksPerAgent: AgentWorkloadDataPoint[];
}

const AgentWorkloadChart: React.FC<AgentWorkloadChartProps> = ({ tasksPerAgent }) => {
    if (!tasksPerAgent || tasksPerAgent.length === 0) {
        return (
            <div className={styles.container}>
                <h3 className={styles.heading}>
                    Agent Workload (All Active Projects)
                </h3>
                <p className={styles.noDataText}>No data available for agent workload.</p>
            </div>
        );
    }
    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>
                Agent Workload (All Active Projects)
            </h3>
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
        </div>
    );
};

export default AgentWorkloadChart; 