import React from 'react';
import {
    Badge,
} from '@chakra-ui/react';
import styles from './RecentActivityList.module.css';

interface ActivityItem {
    type: string;
    title: string;
    date?: string; // Made optional as in original data structure
    agent?: string;
    project?: string;
}

interface RecentActivityListProps {
    recentActivity: ActivityItem[];
}

const RecentActivityList: React.FC<RecentActivityListProps> = ({ recentActivity }) => {
    return (
        <div className={styles.container}>
            <h3 className={styles.heading}>
                Recent Activity (All Active Projects)
            </h3>
            <ul className={styles.list}>
                {recentActivity.length === 0 ? <li className={styles.noActivityText}>No recent activity for this selection.</li> : recentActivity.map((item, i) => (
                    <li key={i} className={styles.listItem}>
                        <div className={styles.listItemContent}>
                            <Badge colorScheme={item.type === 'Completed' ? 'green' : 'gray'}>{item.type}</Badge>
                            <span className={styles.titleText}>{item.title}</span>
                            {item.agent && <span className={styles.detailText}>Agent: {item.agent}</span>}
                            {item.project && <span className={styles.detailText}>Project: {item.project}</span>}
                            <span className={styles.dateText}>{item.date ? new Date(item.date).toLocaleString() : ''}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecentActivityList; 