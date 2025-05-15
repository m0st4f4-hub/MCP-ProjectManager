import React from 'react';
import {
    Box,
    Heading,
    Icon,
    Text,
    VStack,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons'; // Or a more appropriate error icon like WarningIcon

interface TaskErrorProps {
    error: string;
}

const TaskError: React.FC<TaskErrorProps> = ({ error }) => {
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
                    <Icon as={AddIcon} w={12} h={12} color="status.error" /> {/* Consider WarningIcon from '@chakra-ui/icons' */}
                    <Heading size="md" color="status.error">Error Loading Tasks</Heading>
                    <Text color="text.muted">{error}</Text>
                </VStack>
            </Box>
        </Box>
    );
};

export default TaskError; 