import React from 'react';
import {
    Box,
    Container,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';

const TaskLoading: React.FC = () => {
    return (
        <Box w="100%" minH="70vh" display="flex" alignItems="center" justifyContent="center" py={{ base: 4, md: 12 }}>
            <Box 
                maxW="500px"
                w="100%"
                bg="bg.elevated"
                p={{ base: 4, md: 8 }}
                rounded="2xl"
                shadow="2xl"
                borderWidth="1px" 
                borderColor="border.base"
                mt={{ base: 8, md: 16 }}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <VStack spacing={6} w="100%">
                    <Spinner size="xl" color="icon.primary" />
                    <Text color="text.muted">Loading tasks...</Text>
                </VStack>
            </Box>
        </Box>
    );
};

export default TaskLoading; 