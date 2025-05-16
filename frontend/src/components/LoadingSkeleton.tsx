'use client';

import React from 'react';
import { Skeleton, SkeletonText } from '@chakra-ui/react';
import styles from './LoadingSkeleton.module.css';
import { clsx } from 'clsx';

interface LoadingSkeletonProps {
    count?: number;
    type?: 'task' | 'project' | 'agent';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
    count = 3, 
    type = 'task' 
}) => {
    const skeletons = Array(count).fill(0);

    const TaskSkeleton = () => (
        <div className={styles.skeletonItemBase} data-testid="skeleton-item">
            <div className={styles.taskSkeletonContentStack}>
                <div className={styles.taskSkeletonHeader}>
                    <Skeleton height="20px" width="20px" startColor="bg.subtle" endColor="bg.surface" />
                    <Skeleton height="20px" flex="1" startColor="bg.subtle" endColor="bg.surface" />
                </div>
                <SkeletonText noOfLines={2} spacing={2} startColor="bg.subtle" endColor="bg.surface" />
                <div className={styles.taskSkeletonTagsContainer}>
                    <Skeleton height="16px" width="80px" startColor="bg.subtle" endColor="bg.surface" />
                    <Skeleton height="16px" width="100px" startColor="bg.subtle" endColor="bg.surface" />
                </div>
            </div>
        </div>
    );

    const ProjectSkeleton = () => (
        <div className={styles.skeletonItemBase} data-testid="skeleton-item">
            <div className={styles.projectSkeletonContentStack}>
                <div className={styles.projectSkeletonHeader}>
                    <Skeleton height="24px" width="200px" startColor="bg.subtle" endColor="bg.surface" />
                    <Skeleton height="24px" width="24px" startColor="bg.subtle" endColor="bg.surface" />
                </div>
                <SkeletonText noOfLines={2} spacing={2} startColor="bg.subtle" endColor="bg.surface" />
                <div className={styles.projectSkeletonDetailsContainer}>
                    <div className={styles.projectSkeletonProgressHeader}>
                        <div className={styles.projectSkeletonTags}>
                            <Skeleton height="16px" width="80px" startColor="bg.subtle" endColor="bg.surface" />
                            <Skeleton height="16px" width="100px" startColor="bg.subtle" endColor="bg.surface" />
                        </div>
                        <Skeleton height="16px" width="60px" startColor="bg.subtle" endColor="bg.surface" />
                    </div>
                    <Skeleton height="8px" startColor="bg.subtle" endColor="bg.surface" />
                </div>
            </div>
        </div>
    );

    const AgentSkeleton = () => (
        <div className={clsx(styles.skeletonItemBase, styles.agentSkeletonContainer)} data-testid="skeleton-item">
            <div className={styles.agentInfoStack}>
                <Skeleton height="24px" width="180px" startColor="bg.subtle" endColor="bg.surface" />
                <div className={styles.agentTagsContainer}>
                    <Skeleton height="16px" width="80px" startColor="bg.subtle" endColor="bg.surface" />
                    <Skeleton height="16px" width="60px" startColor="bg.subtle" endColor="bg.surface" />
                </div>
            </div>
            <Skeleton height="32px" width="32px" startColor="bg.subtle" endColor="bg.surface" />
        </div>
    );

    const SkeletonComponent = {
        task: TaskSkeleton,
        project: ProjectSkeleton,
        agent: AgentSkeleton
    }[type];

    return (
        <div className={styles.skeletonListContainer}>
            {skeletons.map((_, i) => (
                <SkeletonComponent key={i} />
            ))}
        </div>
    );
};

export default React.memo(LoadingSkeleton); 