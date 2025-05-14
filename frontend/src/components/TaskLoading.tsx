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
                    <Spinner size="xl" color="icon.primary" />
                    <Text color="text.muted">Loading tasks...</Text>
                </VStack>
            </Box>
        </Container>
    );
};

export default TaskLoading; 