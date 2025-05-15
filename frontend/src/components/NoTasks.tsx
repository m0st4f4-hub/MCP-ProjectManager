import React from 'react';
import {
    Box,
    Button,
    Heading,
    Text,
    Image,
    useColorMode
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

interface NoTasksProps {
    onAddTask: () => void;
}

const NoTasks: React.FC<NoTasksProps> = ({ onAddTask }) => {
    const { colorMode } = useColorMode();

    return (
        <Box w="100%" minH="70vh" display="flex" alignItems="center" justifyContent="center" py={{ base: 4, md: 12 }}>
            <Box 
                maxW="500px"
                w="100%"
                bg="bg.surface"
                p={{ base: 4, md: 8 }}
                rounded="2xl"
                shadow="2xl"
                borderWidth="1px"
                borderColor="border.base"
                mt={{ base: 8, md: 16 }}
                textAlign="center"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
            >
                <Image 
                    src={colorMode === 'dark' ? '/assets/images/icon_dark.png' : '/assets/images/icon_light.png'}
                    alt="Project Manager Icon"
                    boxSize="40px"
                    mb={4} 
                />
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
        </Box>
    );
};

export default NoTasks; 