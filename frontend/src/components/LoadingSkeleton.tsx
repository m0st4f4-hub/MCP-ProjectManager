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
            p={4}
            bg="gray.700"
            rounded="lg"
            shadow="lg"
            borderWidth="1px"
            borderColor="gray.600"
        >
            <VStack align="stretch" spacing={3}>
                <Box display="flex" alignItems="center" gap={4}>
                    <Skeleton height="20px" width="20px" startColor="gray.600" endColor="gray.500" />
                    <Skeleton height="20px" flex="1" startColor="gray.600" endColor="gray.500" />
                </Box>
                <SkeletonText noOfLines={2} spacing={2} startColor="gray.600" endColor="gray.500" />
                <Box display="flex" gap={2}>
                    <Skeleton height="16px" width="80px" startColor="gray.600" endColor="gray.500" />
                    <Skeleton height="16px" width="100px" startColor="gray.600" endColor="gray.500" />
                </Box>
            </VStack>
        </Box>
    );

    const ProjectSkeleton = () => (
        <Box
            p={4}
            bg="gray.700"
            rounded="lg"
            shadow="lg"
            borderWidth="1px"
            borderColor="gray.600"
        >
            <VStack align="stretch" spacing={3}>
                <Box display="flex" justifyContent="space-between">
                    <Skeleton height="24px" width="200px" startColor="gray.600" endColor="gray.500" />
                    <Skeleton height="24px" width="24px" startColor="gray.600" endColor="gray.500" />
                </Box>
                <SkeletonText noOfLines={2} spacing={2} startColor="gray.600" endColor="gray.500" />
                <Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <Box display="flex" gap={2}>
                            <Skeleton height="16px" width="80px" startColor="gray.600" endColor="gray.500" />
                            <Skeleton height="16px" width="100px" startColor="gray.600" endColor="gray.500" />
                        </Box>
                        <Skeleton height="16px" width="60px" startColor="gray.600" endColor="gray.500" />
                    </Box>
                    <Skeleton height="8px" startColor="gray.600" endColor="gray.500" />
                </Box>
            </VStack>
        </Box>
    );

    const AgentSkeleton = () => (
        <Box
            p={4}
            bg="gray.700"
            rounded="lg"
            shadow="lg"
            borderWidth="1px"
            borderColor="gray.600"
        >
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <VStack align="start" spacing={2}>
                    <Skeleton height="24px" width="180px" startColor="gray.600" endColor="gray.500" />
                    <Box display="flex" gap={2}>
                        <Skeleton height="16px" width="80px" startColor="gray.600" endColor="gray.500" />
                        <Skeleton height="16px" width="60px" startColor="gray.600" endColor="gray.500" />
                    </Box>
                </VStack>
                <Skeleton height="32px" width="32px" startColor="gray.600" endColor="gray.500" />
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