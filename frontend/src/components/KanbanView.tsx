import React, { useRef, useMemo } from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
    VStack,
} from '@chakra-ui/react';
import TaskItem from './TaskItem'; // Assuming TaskItem can be used here
import { Task } from '@/types';
// import { AddIcon } from '@chakra-ui/icons'; // If needed for an "Add task to column" button

type StatusType = 'To Do' | 'In Progress' | 'Blocked' | 'Completed';

type ColorMap = {
    [K in StatusType]: string;
};

interface KanbanViewProps {
    filteredTasks: Task[];
    // onOpenModal: (task: Task | null, parentId?: string | null) => void; // If needed for column-level add
    compactView?: boolean; // Derived from isCompact in original TaskList
}

const KanbanView: React.FC<KanbanViewProps> = ({ 
    filteredTasks,
    // onOpenModal,
    compactView = false, 
}) => {
    const boardRef = useRef<HTMLDivElement>(null);
    // isCompact state is managed internally if needed for column width calculations, 
    // or taken directly from compactView prop if TaskList still manages it for overall layout.
    // For simplicity, this example will assume compactView prop dictates TaskItem's compact state.

    const kanbanColumns = useMemo(() => {
        return (['To Do', 'In Progress', 'Blocked', 'Completed'] as const).map((status: StatusType) => {
            const statusTasks = filteredTasks.filter(task => {
                if (status === 'To Do') {
                    return !task.completed && (!task.status || (task.status !== 'In Progress' && task.status !== 'Blocked' && task.status !== 'Completed'));
                }
                if (status === 'Completed') return task.completed || task.status === 'Completed';
                return task.status === status;
            });

            // Use semantic tokens for column backgrounds and accents
            const statusColumnBgTokens: ColorMap = {
                'To Do': 'bg.card',
                'In Progress': 'status.inProgress.bg',
                'Blocked': 'status.blocked.bg',
                'Completed': 'status.completed.bg',
            };
            const accentColumnTokens: ColorMap = {
                'To Do': 'brand.500',
                'In Progress': 'status.inProgress.text',
                'Blocked': 'status.blocked.text',
                'Completed': 'status.completed.text',
            };

            return {
                id: status,
                title: status,
                tasks: statusTasks,
                bgColor: statusColumnBgTokens[status],
                accentColor: accentColumnTokens[status],
            };
        });
    }, [filteredTasks]);

    return (
        <Box w="100%" overflowX="auto" py={2} ref={boardRef}>
            <Flex direction="row" gap={8} w="100%" minW={{ base: '100%', md: '1200px' }} px={2}>
                {kanbanColumns.map((column) => (
                    <Box 
                        key={column.id} 
                        flex="1 1 0" 
                        minW="400px"
                        maxW="1fr" 
                        bg={column.bgColor} 
                        borderRadius="lg" 
                        p={0} 
                        boxShadow="sm" 
                        borderWidth="1px" 
                        borderColor="border.base" 
                        display="flex" 
                        flexDirection="column" 
                        maxHeight="70vh" 
                        position="relative" 
                        overflow="hidden"
                    >
                        {/* Sticky Header with accent bar */}
                        <Box 
                            position="sticky" 
                            top={0} 
                            zIndex={2} 
                            bg={column.bgColor}
                            borderTopRadius="lg" 
                            boxShadow="sm" 
                            borderBottomWidth="1px" 
                            borderColor="border.base"
                        >
                            <Box h="4px" w="full" bg={column.accentColor} borderTopRadius="lg" />
                            <Heading size="sm" color="text.primary" px={4} py={3} fontWeight="semibold">
                                {column.title} <Box as="span" color={column.accentColor} fontWeight="normal">({column.tasks.length})</Box>
                            </Heading>
                        </Box>
                        {/* Task list, scrollable */}
                        <VStack 
                            spacing={3} 
                            align="stretch" 
                            px={3} pb={3} pt={2} 
                            flex={1} 
                            overflowY="auto" 
                            divider={<Box h="1px" bg="border.base" />} 
                            style={{ transition: 'all 0.2s', minHeight: '60px' }}
                        >
                            {column.tasks.length > 0 ? column.tasks.map((task, idx) => (
                                <TaskItem 
                                    key={task.id} 
                                    task={task} 
                                    compact={compactView} 
                                    style={{ animation: `fadeIn 0.3s ${idx * 0.05}s both` }} 
                                />
                            )) : (
                                <Text color="text.muted" fontSize="sm" textAlign="center" py={4}>No tasks</Text>
                            )}
                        </VStack>
                    </Box>
                ))}
            </Flex>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: none; }}`}</style>
        </Box>
    );
};

export default KanbanView; 