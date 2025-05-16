import React from 'react';
// import {
//     Box,
//     Spinner,
//     Text,
//     VStack,
// } from '@chakra-ui/react';
import styles from './TaskLoading.module.css';

const TaskLoading: React.FC = () => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.loadingBox}>
                <div className={styles.loadingContentStack}>
                    <div className={styles.loadingSpinner} />
                    <p className={styles.loadingText}>Loading tasks...</p>
                </div>
            </div>
        </div>
    );
};

export default TaskLoading; 