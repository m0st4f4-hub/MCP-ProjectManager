import React from 'react';
import {
    Button,
    Select,
    Flex,
    HStack,
    Text,
} from '@chakra-ui/react';
import { AddIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { GroupByType, ViewMode } from '@/types'; // Assuming these types are exported from types/index.ts or similar

interface TaskControlsProps {
    groupBy: GroupByType;
    setGroupBy: (value: GroupByType) => void;
    viewMode: ViewMode;
    setViewMode: (value: ViewMode) => void;
    onAddTask: () => void;
}

const TaskControls: React.FC<TaskControlsProps> = ({
    groupBy,
    setGroupBy,
    viewMode,
    setViewMode,
    onAddTask,
}) => {
    return (
        <Flex 
            mb={6} 
            justifyContent="space-between" 
            alignItems="center"
            bg="bg.surface"
            p={4}
            borderRadius="md"
            flexDirection={{ base: 'column', md: 'row' }}
            gap={4}
        >
            <HStack spacing={4} w={{ base: '100%', md: 'auto' }}>
                <Text fontSize="sm" fontWeight="medium" color="text.secondary" whiteSpace="nowrap">Group by:</Text>
                <Select 
                    aria-label="Group by"
                    size="sm" 
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as GroupByType)}
                    w={{ base: 'full', md: '150px' }}
                    bg="bg.input"
                    borderColor="border.input"
                    _hover={{ borderColor: 'border.input_hover' }}
                    color="text.primary" // Ensure text color is appropriate for the theme
                    sx={{ option: { bg: 'bg.input', color: 'text.primary' } }} // Style options too
                >
                    <option value="status">Status</option>
                    <option value="project">Project</option>
                    <option value="agent">Agent</option>
                    <option value="parent">Parent Task</option>
                </Select>
                <Button
                    aria-label={viewMode === 'kanban' ? 'Switch to List View' : 'Switch to Kanban View'}
                    size="sm"
                    leftIcon={viewMode === 'kanban' ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
                    variant="outline"
                    borderColor="border.base"
                    color="text.primary"
                >
                    {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
                </Button>
            </HStack>
            <Button 
                leftIcon={<AddIcon />}
                bg="bg.button.primary" 
                color="text.button.primary"
                _hover={{ bg: 'brand.600' }}
                size="sm"
                onClick={onAddTask}
                w={{ base: '100%', md: 'auto' }}
            >
                Add Task
            </Button>
        </Flex>
    );
};

export default TaskControls; 