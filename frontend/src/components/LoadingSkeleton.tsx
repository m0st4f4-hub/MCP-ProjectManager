'use client';

import React from 'react';
import { Box, VStack, Skeleton, SkeletonText } from '@chakra-ui/react';

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
        <Box
            data-testid="skeleton-item"
            p={4}
            bg="bg.card"
            rounded="lg"
            shadow="lg"
            borderWidth="1px"
            borderColor="border.secondary"
        >
            <VStack align="stretch" spacing={3}>
                <Box display="flex" alignItems="center" gap={4}>
                    <Skeleton height="20px" width="20px" startColor="bg.subtle" endColor="bg.surface" />
                    <Skeleton height="20px" flex="1" startColor="bg.subtle" endColor="bg.surface" />
                </Box>
                <SkeletonText noOfLines={2} spacing={2} startColor="bg.subtle" endColor="bg.surface" />
                <Box display="flex" gap={2}>
                    <Skeleton height="16px" width="80px" startColor="bg.subtle" endColor="bg.surface" />
                    <Skeleton height="16px" width="100px" startColor="bg.subtle" endColor="bg.surface" />
                </Box>
            </VStack>
        </Box>
    );

    const ProjectSkeleton = () => (
        <Box
            data-testid="skeleton-item"
            p={4}
            bg="bg.card"
            rounded="lg"
            shadow="lg"
            borderWidth="1px"
            borderColor="border.secondary"
        >
            <VStack align="stretch" spacing={3}>
                <Box display="flex" justifyContent="space-between">
                    <Skeleton height="24px" width="200px" startColor="bg.subtle" endColor="bg.surface" />
                    <Skeleton height="24px" width="24px" startColor="bg.subtle" endColor="bg.surface" />
                </Box>
                <SkeletonText noOfLines={2} spacing={2} startColor="bg.subtle" endColor="bg.surface" />
                <Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <Box display="flex" gap={2}>
                            <Skeleton height="16px" width="80px" startColor="bg.subtle" endColor="bg.surface" />
                            <Skeleton height="16px" width="100px" startColor="bg.subtle" endColor="bg.surface" />
                        </Box>
                        <Skeleton height="16px" width="60px" startColor="bg.subtle" endColor="bg.surface" />
                    </Box>
                    <Skeleton height="8px" startColor="bg.subtle" endColor="bg.surface" />
                </Box>
            </VStack>
        </Box>
    );

    const AgentSkeleton = () => (
        <Box
            data-testid="skeleton-item"
            p={4}
            bg="bg.card"
            rounded="lg"
            shadow="lg"
            borderWidth="1px"
            borderColor="border.secondary"
        >
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <VStack align="start" spacing={2}>
                    <Skeleton height="24px" width="180px" startColor="bg.subtle" endColor="bg.surface" />
                    <Box display="flex" gap={2}>
                        <Skeleton height="16px" width="80px" startColor="bg.subtle" endColor="bg.surface" />
                        <Skeleton height="16px" width="60px" startColor="bg.subtle" endColor="bg.surface" />
                    </Box>
                </VStack>
                <Skeleton height="32px" width="32px" startColor="bg.subtle" endColor="bg.surface" />
            </Box>
        </Box>
    );

    const SkeletonComponent = {
        task: TaskSkeleton,
        project: ProjectSkeleton,
        agent: AgentSkeleton
    }[type];

    return (
        <VStack spacing={4} align="stretch" w="100%">
            {skeletons.map((_, i) => (
                <SkeletonComponent key={i} />
            ))}
        </VStack>
    );
};

export default React.memo(LoadingSkeleton); 