import React from 'react';
import {
    Avatar,
    Badge,
} from '@chakra-ui/react';
import { FaRegListAlt } from 'react-icons/fa';
import styles from './TopPerformersLists.module.css';

interface PerformerItem {
    name: string;
    value: number; // tasks count
}

interface TopPerformersListsProps {
    topAgents: PerformerItem[];
    topProjects: PerformerItem[];
}

const TopPerformersLists: React.FC<TopPerformersListsProps> = ({ topAgents, topProjects }) => {
    return (
        <div className={styles.performersGrid}>
            <div className={styles.listContainer}>
                <h3 className={styles.heading}>
                    Top 3 Busiest Agents (All Active Projects)
                </h3>
                <ul className={styles.list}>
                    {topAgents.length === 0 ? <li className={styles.noDataText}>No agent data for this selection.</li> : topAgents.map(agent => (
                        <li key={agent.name} className={styles.listItem}>
                            <div className={styles.listItemContent}>
                                <Avatar name={agent.name} size="sm" />
                                <span className={styles.itemNameText}>{agent.name}</span>
                                <Badge colorScheme="purple">{agent.value} tasks</Badge>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles.listContainer}>
                <h3 className={styles.heading}>
                    Top 3 Projects by Workload (All Active Projects)
                </h3>
                <ul className={styles.list}>
                    {topProjects.length === 0 ? <li className={styles.noDataText}>No project data for this selection.</li> : topProjects.map(project => (
                        <li key={project.name} className={styles.listItem}>
                            <div className={styles.listItemContent}>
                                <FaRegListAlt className={styles.projectIcon} />
                                <span className={styles.itemNameText}>{project.name}</span>
                                <Badge colorScheme="blue">{project.value} tasks</Badge>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TopPerformersLists; 