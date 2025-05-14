import React from 'react';
import {
    Box,
    Container,
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
        <Container maxW="container.lg" p={4}>
            <Box 
                bg="bg.elevated"
                p={6} 
                rounded="radius.xl"
                shadow="shadow.lg"
                borderWidth="1px" 
                borderColor="border.base"
                height="400px"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <VStack spacing={6}>
                    <Icon as={AddIcon} w={12} h={12} color="status.error" /> {/* Consider WarningIcon from '@chakra-ui/icons' */}
                    <Heading size="md" color="status.error">Error Loading Tasks</Heading>
                    <Text color="text.muted">{error}</Text>
                </VStack>
            </Box>
        </Container>
    );
};

export default TaskError; 