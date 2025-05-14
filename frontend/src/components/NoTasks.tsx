import React from 'react';
import {
    Box,
    Button,
    Container,
    Heading,
    Text,
    Icon
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

interface NoTasksProps {
    onAddTask: () => void;
}

const NoTasks: React.FC<NoTasksProps> = ({ onAddTask }) => {
    return (
        <Container maxW="container.lg" p={4}>
            <Box 
                bg="bg.surface" 
                p={6} 
                rounded="radius.lg"
                shadow="shadow.md"
                borderWidth="1px"
                borderColor="border.base"
                textAlign="center"
            >
                <Icon as={AddIcon} w={10} h={10} color="brand.500" mb={4} /> {/* Added Icon explicitly as per original TaskList styling */}
                <Heading size="md" color="text.heading" mb={3}>No Tasks Found</Heading>
                <Text color="text.secondary" mb={4}>
                    There are no tasks matching your current filters, or no tasks have been created yet.
                </Text>
                <Button
                    leftIcon={<AddIcon />}
                    bg="bg.button.accent"
                    color="text.button.accent"
                    _hover={{ bg: "bg.button.accent.hover" }}
                    onClick={onAddTask}
                    size="md"
                >
                    Add Your First Task
                </Button>
            </Box>
        </Container>
    );
};

export default NoTasks; 