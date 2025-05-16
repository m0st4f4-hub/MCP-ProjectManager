import React from 'react';
import {
    Tag,
    TagLeftIcon,
} from '@chakra-ui/react';
import { Task } from '@/types/task';
import { Project } from '@/types/project';
import { getStatusAttributes } from '@/lib/statusUtils'; 
import { mapStatusToStatusID } from '@/lib/utils';
import { FaTasks } from 'react-icons/fa';
import styles from './UnassignedTasksList.module.css';

interface UnassignedTasksListProps {
    unassignedTasks: Task[];
    projects: Project[];
}

const UnassignedTasksList: React.FC<UnassignedTasksListProps> = ({ unassignedTasks, projects }) => {
    if (!unassignedTasks || unassignedTasks.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>
                Unassigned Tasks (All Active Projects)
            </h3>
            <ul className={styles.list}>
                {unassignedTasks.slice(0,5).map(task => {
                    const statusId = task.status ? mapStatusToStatusID(task.status) : undefined;
                    const statusAttributes = statusId ? getStatusAttributes(statusId) : undefined;
                    return (
                        <li key={task.id} className={styles.listItem}>
                            <div className={styles.listItemContent}>
                                <Tag colorScheme={statusAttributes?.colorScheme || "gray"} size="sm">
                                    <TagLeftIcon as={typeof statusAttributes?.icon !== 'string' && statusAttributes?.icon ? statusAttributes.icon : FaTasks} />
                                    {task.status || "Unknown"}
                                </Tag>
                                <p className={styles.taskTitle}>{task.title}</p>
                                {task.project_id && projects.find(p => p.id === task.project_id) &&
                                    <span className={styles.projectText}> P: {projects.find(p => p.id === task.project_id)?.name}</span>
                                }
                            </div>
                        </li>
                    );
                })}
                {unassignedTasks.length > 5 && <p className={styles.moreTasksText}>...and {unassignedTasks.length - 5} more.</p>}
            </ul>
        </div>
    );
};

export default UnassignedTasksList; 