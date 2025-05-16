import React from 'react';
import {
    Progress,
} from '@chakra-ui/react';
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
import styles from './ProjectProgressChart.module.css';

interface ProjectProgressDataPoint {
    name: string;
    value: number; // Number of tasks
    color: string;
    progress: number; // Percentage completion
}

interface ProjectProgressChartProps {
    tasksPerProject: ProjectProgressDataPoint[];
}

const ProjectProgressChart: React.FC<ProjectProgressChartProps> = ({ tasksPerProject }) => {
    if (!tasksPerProject || tasksPerProject.length === 0) {
        return (
            <div className={styles.container}>
                <h3 className={styles.heading}>
                    Project Progress (All Active Projects)
                </h3>
                <p className={styles.noDataText}>No data available for project progress.</p>
            </div>
        );
    }
    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>
                Project Progress (All Active Projects)
            </h3>
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
            <div className={styles.progressSection}>
                {tasksPerProject.slice(0, 5).map(project => (
                    <div key={project.name} className={styles.progressItemContainer}>
                        <p className={styles.progressLabel}>{project.name} Progress</p>
                        <Progress value={project.progress} size="sm" colorScheme="green" borderRadius="full" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectProgressChart; 