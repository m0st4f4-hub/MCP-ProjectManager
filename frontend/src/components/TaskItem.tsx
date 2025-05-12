// D:\mcp\task-manager\frontend\src\components\TaskItem.tsx
'use client';

import React, { useCallback, useEffect, useState, memo } from 'react';
import {
    Box,
    Checkbox,
    Text,
    IconButton,
    HStack,
    VStack,
    useDisclosure,
    Tag,
    TagLabel,
    TagCloseButton,
    useColorMode,
    Flex,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { Task } from '@/types'; // Removed Subtask as SubtaskType import
import EditTaskModal from './EditTaskModal'; // Ensure this path is correct
// import SubtaskList from './SubtaskList'; // If you have a SubtaskList component
// import AddSubtaskForm from './AddSubtaskForm'; // If you have this form

// For MotionFlex
const MotionFlex = motion(Flex);


interface TaskItemProps {
    task: Task;
    onToggle: (id: string, completed: boolean) => void;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void; // Assuming this is how edit is handled
    // onAddSubtask: (taskId: string, subtask: Omit<SubtaskType, 'id' | 'created_at' | 'updated_at'>) => void;
    // onToggleSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
    // onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = memo(({
    task,
    onToggle,
    onDelete,
    onEdit,
    // onAddSubtask,
    // onToggleSubtask,
    // onDeleteSubtask
}) => {
    const { isOpen: isEditTaskModalOpen, onOpen: onOpenEditTaskModal, onClose: onCloseEditTaskModal } = useDisclosure();
    const [justUpdated, setJustUpdated] = useState(false);

    const { colorMode } = useColorMode(); // Kept colorMode as it's used in animation

    useEffect(() => {
        if (task.updated_at) { // Check if updated_at exists
            const taskUpdateTime = new Date(task.updated_at).getTime();
            const now = Date.now();
            // If updated in the last 2 seconds, trigger flash
            if (now - taskUpdateTime < 2000) {
                setJustUpdated(true);
                const timer = setTimeout(() => setJustUpdated(false), 1500); // Flash duration
                return () => clearTimeout(timer);
            }
        }
        setJustUpdated(false); // Ensure it's false if not recently updated
    }, [task.updated_at]);


    const handleToggleCompletion = useCallback(() => {
        onToggle(task.id, !task.completed);
    }, [task.id, task.completed, onToggle]);

    const handleDeleteClick = useCallback(() => {
        onDelete(task.id);
    }, [task.id, onDelete]);

    const taskBg = task.completed ? 'task.item.completed.bg' : 'task.item.bg';
    const textColor = task.completed ? 'text.disabled' : 'text.primary';

    return (
        <>
            <MotionFlex
                align="center"
                p={3}
                // bg={task.completed ? 'gray.800' : 'gray.700'} // OLD
                bg={taskBg} // NEW: Use semantic token
            borderRadius="md" 
                boxShadow="sm"
                mb={2}
                animate={{
                    // backgroundColor: justUpdated ? (colorMode === 'dark' ? 'yellow.800' : 'yellow.100') : (task.completed ? 'gray.800' : 'gray.700'), // OLD
                    backgroundColor: justUpdated 
                                        ? 'var(--chakra-colors-task-item-flash-bg)' // Use CSS var for semantic token
                                        : `var(--chakra-colors-${taskBg.replace('.', '-')})` // Use CSS var for semantic token
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                whileHover={{ boxShadow: "md" }}
                borderWidth="1px"
                // borderColor="gray.600" // OLD
                borderColor="border.secondary" // NEW: Use semantic token
                width="100%"
            >
                    <Checkbox 
                        isChecked={task.completed} 
                        onChange={handleToggleCompletion}
                        borderColor="border.checkbox" // USE NEW TOKEN
                        size="lg"
                        mr={3}
                    sx={{
                        '.chakra-checkbox__control': {
                            // bg: task.completed ? 'green.500' : (colorMode === 'dark' ? 'gray.600' : 'gray.200'), // OLD
                            // borderColor: task.completed ? 'green.500' : (colorMode === 'dark' ? 'gray.500' : 'gray.300'), // OLD
                            // Use semantic tokens or theme colors for checkbox control if needed, or let Chakra handle it
                        },
                    }}
                />
                <VStack align="start" spacing={0} flexGrow={1}>
                    <Text
                        // color={task.completed ? 'gray.500' : 'whiteAlpha.900'} // OLD
                        // textDecoration={task.completed ? 'line-through' : 'none'} // OLD
                        color={textColor} // NEW: Use semantic token
                        textDecoration={task.completed ? 'line-through' : 'none'} 
                        fontWeight="medium"
                        fontSize="md"
                    >
                        {task.title}
                    </Text>
                {task.description && (
                        <Text 
                            // color={task.completed ? 'gray.600' : 'gray.400'} // OLD
                            color={task.completed ? 'text.disabled' : 'text.secondary'} // NEW
                            fontSize="sm"
                        >
                        {task.description}
                    </Text>
                )}
            </VStack>
                <HStack spacing={1}>
                <IconButton
                    aria-label="Edit task"
                    icon={<EditIcon />}
                    size="sm"
                    variant="ghost"
                        color="text.secondary"
                        _hover={{ color: 'text.primary', bg: 'interaction.hover' }} // USE interaction.hover
                        onClick={onOpenEditTaskModal}
                />
                <IconButton
                    aria-label="Delete task"
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                        color="text.danger" // USE TOKEN
                         _hover={{ color: 'text.critical', bg: 'bg.danger.hover' }} // USE TOKENS
                        onClick={handleDeleteClick}
                />
                    {/* Add other icons/buttons as needed, e.g., for subtasks */}
            </HStack>
            </MotionFlex>

            <EditTaskModal
                isOpen={isEditTaskModalOpen}
                onClose={onCloseEditTaskModal}
                task={task} // Pass task directly if editedTask state is removed
                onUpdate={async (numericId, updatePayload) => {
                    const fullUpdatedTask: Task = {
                        ...task, // Start with original task data
                        id: numericId.toString(), // ensure id is string
                        ...updatePayload, // fields from the modal form
                        updated_at: new Date().toISOString(), // ensure updated_at is fresh
                    };
                    onEdit(fullUpdatedTask);
                    onCloseEditTaskModal(); // Close modal after successful update via onEdit
                }}
            />
            {/*
            {task.id && ( // Conditionally render subtask section if task.id exists
                <Box pl={8} mt={2} borderLeft="2px" borderColor="gray.700">
                    <SubtaskList
                        taskId={task.id}
                        subtasks={task.subtasks || []}
                        onToggleSubtask={onToggleSubtask}
                        onDeleteSubtask={onDeleteSubtask}
                    />
                    <AddSubtaskForm taskId={task.id} onAddSubtask={onAddSubtask} />
                </Box>
            )}
            */}
        </>
    );
});

TaskItem.displayName = 'TaskItem'; // Added display name

export default TaskItem;

// Helper to get all descendant IDs (if you have nested subtasks and want to delete them all)
// This would be more relevant if subtasks were managed within TaskItem directly or if
// TaskStore needed this logic for deep optimistic deletes based on parent task ID.
// For now, assuming subtasks are handled elsewhere or not deeply nested for deletion via TaskItem.
// const getAllDescendantIds = (taskId: string, tasks: Task[]): string[] => {
//     const descendants: string[] = [];
//     const task = tasks.find(t => t.id === taskId);
//     if (task && task.subtasks) {
//         task.subtasks.forEach(sub => {
//             descendants.push(sub.id);
//             // If subtasks can also have subtasks, recurse:
//             // descendants.push(...getAllDescendantIds(sub.id, tasks)); // This requires subtasks to be in the main tasks array or a different structure
//         });
//     }
//     return descendants;
// };

