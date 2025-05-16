'use client';

import React from 'react';
// import { Box, Heading, Text, SimpleGrid, Stat, StatLabel, StatNumber, VStack } from '@chakra-ui/react'; // To be removed
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useAgentStore } from '@/store/agentStore';
import styles from './OverviewContent.module.css';

const OverviewContent: React.FC = () => {
    const projects = useProjectStore(state => state.projects);
    const tasks = useTaskStore(state => state.tasks);
    const agents = useAgentStore(state => state.agents);

    const totalProjects = projects?.length || 0;
    const totalTasks = tasks?.length || 0;
    const totalAgents = agents?.length || 0;

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.mainHeading}>Application Overview</h1>
            <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                    <div className={styles.statLabel}>Total Projects</div>
                    <div className={styles.statNumber}>{totalProjects}</div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statLabel}>Total Tasks</div>
                    <div className={styles.statNumber}>{totalTasks}</div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statLabel}>Total Agents</div>
                    <div className={styles.statNumber}>{totalAgents}</div>
                </div>
            </div>
            <div className={styles.welcomeVStack}>
                <p className={styles.welcomeText}>Welcome to your Task Management Dashboard!</p>
                <p className={styles.descriptionText}>Here you can get a quick glance at the current state of your projects, tasks, and agents. Use the sidebar to navigate to different sections for more detailed views and management options.</p>
            </div>
        </div>
    );
};

export default OverviewContent; 