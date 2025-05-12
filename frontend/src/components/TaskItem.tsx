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
    TagLeftIcon,
    useColorMode,
    Flex,
    Spacer,
    Icon,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, WarningIcon } from '@chakra-ui/icons';
import { BsPerson } from 'react-icons/bs';
import { GoProject } from "react-icons/go";
import { motion } from 'framer-motion';
import { Task } from '@/types'; // Removed Subtask as SubtaskType import
import EditTaskModal from './EditTaskModal'; // Ensure this path is correct
import { useProjectStore } from '@/store/projectStore'; // <-- Import project store
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
    // Get projects from store to find the name
    const projects = useProjectStore((state) => state.projects);
    const projectName = projects.find(p => p.id === task.project_id)?.name;

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
    const textColorPrimary = task.completed ? 'text.disabled' : 'text.primary';
    const textColorSecondary = task.completed ? 'text.disabled' : 'text.secondary';
    const textDecoration = task.completed ? 'line-through' : 'none';

    // Placeholder for priority - replace with actual task.priority check
    const showPriorityIcon = task.title.length > 30; // Example condition
    const priorityColor = 'status.warning'; // Example color

    return (
        <>
            <Box position="relative" role="group">
                <MotionFlex
                    align="center"
                    p={3}
                    bg={taskBg} 
                    borderRadius="md" 
                    boxShadow="sm"
                    mb={2}
                    _hover={{ 
                        bg: 'interaction.subtle.hover' 
                    }}
                    transition="background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out" 
                    animate={{
                        backgroundColor: justUpdated 
                                            ? 'var(--chakra-colors-task-item-flash-bg)' 
                                            : `var(--chakra-colors-${taskBg.replace('.', '-')})` 
                    }}
                    whileHover={{ 
                        boxShadow: "md"
                    }}
                    borderWidth="1px"
                    borderColor="border.secondary" 
                    borderLeftWidth="4px" 
                    borderLeftColor={task.completed ? 'status.success' : 'border.accent'}
                    width="100%"
                >
                    <Checkbox 
                        isChecked={task.completed} 
                        onChange={handleToggleCompletion}
                        size="lg"
                        mr={4} 
                        colorScheme="brand"
                        sx={{
                            '.chakra-checkbox__control': {
                                bg: task.completed ? 'bg.checkbox.checked' : 'bg.input',
                                borderColor: task.completed ? 'border.checkbox.checked' : 'border.checkbox',
                                transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
                                _hover: {
                                    bg: task.completed ? 'bg.checkbox.checked' : 'interaction.hover',
                                    borderColor: task.completed ? 'border.checkbox.checked' : 'border.input_hover'
                                }
                            },
                        }}
                    />
                    <Box 
                        flexGrow={1} 
                        onClick={onOpenEditTaskModal} 
                        cursor="pointer" 
                        mr={2}
                        _hover={{ 
                        }}
                        borderRadius="sm"
                    >
                        <VStack align="start" spacing={1} w="full">
                            <HStack spacing={2} align="center">
                                {showPriorityIcon && <Icon as={WarningIcon} color={priorityColor} boxSize={3.5} />}
                                <Text
                                    color={textColorPrimary}
                                    textDecoration={textDecoration} 
                                    fontWeight="medium"
                                    fontSize="md"
                                    noOfLines={1}
                                >
                                    {task.title}
                                </Text>
                            </HStack>
                        {task.description && (
                                <Text 
                                    color={textColorSecondary} 
                                    fontSize="sm"
                                    pl={showPriorityIcon ? 5.5 : 0}
                                >
                                    {task.description}
                                </Text>
                            )}
                            {task.agent_name && (
                                <Tag 
                                    size="sm" 
                                    bg="bg.tag.agent"
                                    color="text.tag.agent"
                                    borderRadius="full"
                                    variant="subtle"
                                    mt={1}
                                    ml={showPriorityIcon ? 5.5 : 0}
                                >
                                    <TagLeftIcon boxSize='12px' as={BsPerson} />
                                    <TagLabel>{task.agent_name}</TagLabel>
                                </Tag>
                            )}
                            <HStack spacing={2} mt={1} ml={showPriorityIcon ? 5.5 : 0} wrap="wrap">
                                {(projectName || task.project_id) && (
                                     <Tag 
                                        size="sm" 
                                        colorScheme="purple"
                                        borderRadius="full" 
                                        variant="subtle" 
                                    >
                                        <TagLeftIcon boxSize='12px' as={GoProject} />
                                        <TagLabel>{projectName ?? `ID: ${task.project_id}`}</TagLabel>
                                    </Tag>
                                )}
                           </HStack>
                        </VStack>
                    </Box>

                    <HStack 
                        spacing={1} 
                        onClick={(e) => e.stopPropagation()}
                        opacity={0} 
                        _groupHover={{ opacity: 1 }} 
                        transition="opacity 0.2s ease-in-out"
                        position="absolute"
                        right={3}
                        top="50%"
                        transform="translateY(-50%)"
                    >
                        <IconButton
                            aria-label="Edit task"
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            color="text.secondary" 
                            _hover={{ color: 'text.primary', bg: 'interaction.hover' }} 
                            onClick={onOpenEditTaskModal}
                        />
                        <IconButton
                            aria-label="Delete task"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            color="text.danger" 
                            _hover={{ color: 'text.critical', bg: 'bg.danger.hover' }} 
                            onClick={handleDeleteClick}
                        />
                    </HStack>
                </MotionFlex>
            </Box>

            <EditTaskModal
                isOpen={isEditTaskModalOpen}
                onClose={onCloseEditTaskModal}
                task={task}
                onUpdate={async (numericId, updatePayload) => {
                    const fullUpdatedTask: Task = {
                        ...task,
                        id: numericId.toString(),
                        ...updatePayload,
                        updated_at: new Date().toISOString(),
                    };
                    onEdit(fullUpdatedTask);
                    onCloseEditTaskModal();
                }}
            />
        </>
    );
});

TaskItem.displayName = 'TaskItem';

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

