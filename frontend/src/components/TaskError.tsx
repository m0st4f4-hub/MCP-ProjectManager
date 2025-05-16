import React from 'react';
// import {
//     Box,
//     Heading,
//     Icon,
//     Text,
//     VStack,
// } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons'; // Or a more appropriate error icon like WarningIcon
import styles from './TaskError.module.css';

interface TaskErrorProps {
    error: string;
}

const TaskError: React.FC<TaskErrorProps> = ({ error }) => {
    return (
        <div className={styles.errorContainer}>
            <div className={styles.errorBox}>
                <div className={styles.errorContentStack}>
                    {/* Consider replacing AddIcon with a proper error icon (e.g., SVG or a different component) */}
                    <AddIcon className={styles.errorIcon} /> 
                    <h2 className={styles.errorHeading}>Error Loading Tasks</h2>
                    <p className={styles.errorMessageText}>{error}</p>
                </div>
            </div>
        </div>
    );
};

export default TaskError; 