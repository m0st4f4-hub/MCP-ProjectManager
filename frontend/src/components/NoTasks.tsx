import React from 'react';
import Image from 'next/image'; // Added import for Next.js Image
// import {
//     Box,
//     Button,
//     Heading,
//     Text,
//     Image,
//     useColorMode
// } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react'; // Keep for colorMode
import { AddIcon } from '@chakra-ui/icons'; // Keep for icon
import styles from './NoTasks.module.css';

interface NoTasksProps {
    onAddTask: () => void;
}

const NoTasks: React.FC<NoTasksProps> = ({ onAddTask }) => {
    const { colorMode } = useColorMode();

    return (
        <div className={styles.noTasksContainer}>
            <div className={styles.noTasksBox}>
                <Image 
                    src={colorMode === 'dark' ? '/assets/images/icon_dark.png' : '/assets/images/icon_light.png'}
                    alt="Project Manager Icon"
                    width={64} // Added width
                    height={64} // Added height
                    className={styles.noTasksImage}
                />
                <h2 className={styles.noTasksHeading}>No Tasks Found</h2>
                <p className={styles.noTasksText}>
                    There are no tasks matching your current filters, or no tasks have been created yet.
                </p>
                <button
                    onClick={onAddTask}
                    className={styles.addTaskButton}
                >
                    <AddIcon style={{ marginRight: 'var(--chakra-space-2)'}} /> 
                    Add Your First Task
                </button>
            </div>
        </div>
    );
};

export default NoTasks; 