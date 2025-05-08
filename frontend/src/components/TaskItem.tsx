// D:\mcp\task-manager\frontend\src\components\TaskItem.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Text,
    Checkbox,
    IconButton,
    HStack,
    VStack,
    useToast,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Input,
    Select,
    Button,
    Tag,
    Tooltip,
    Spinner,
    Badge,
    Flex
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon, ChatIcon } from '@chakra-ui/icons';
import { Task } from '@/services/api';
import { useTaskStore } from '@/store/taskStore';
import { useShallow } from 'zustand/react/shallow';

interface TaskItemProps {
    task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
    const toast = useToast();

    const {
        removeTask,
        toggleTaskComplete,
        openEditModal,
    } = useTaskStore(useShallow(state => ({
        removeTask: state.removeTask,
        toggleTaskComplete: state.toggleTaskComplete,
        openEditModal: state.openEditModal,
    })));

    const handleToggle = React.useCallback(async () => {
        try {
            await toggleTaskComplete(task.id, !task.completed);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Please try again.';
            toast({
                title: "Failed to update task status",
                description: message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    }, [task.id, task.completed, toggleTaskComplete, toast]);

    const handleDelete = React.useCallback(async () => {
        try {
            await removeTask(task.id);
            toast({ title: "Task deleted", status: "info", duration: 2000, isClosable: true });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Please try again.';
            toast({
                title: "Failed to delete task",
                description: message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    }, [task.id, removeTask, toast]);

    const handleEdit = React.useCallback(() => {
        openEditModal(task);
    }, [task, openEditModal]);

    return (
        <Flex align="center" px={4} py={2} borderBottomWidth="1px" borderColor="border.subtle" gap={3} minH="56px">
            <Tooltip label={task.completed ? "Mark as incomplete" : "Mark as complete"} placement="top" openDelay={300}>
                <Checkbox
                    isChecked={task.completed}
                    onChange={handleToggle}
                    colorScheme="green"
                    size="lg"
                    aria-label="Toggle task completion"
                    onClick={e => e.stopPropagation()}
                />
            </Tooltip>
            <VStack alignItems="flex-start" spacing={0} flex={1} minW={0}>
                <Text
                    fontSize="md"
                    fontWeight="medium"
                    color={task.completed ? "text.disabled" : "text.default"}
                    textDecoration={task.completed ? 'line-through' : 'none'}
                    isTruncated
                >
                    {task.title}
                </Text>
                <HStack spacing={2} mt={1}>
                    {task.project?.name && (
                        <Badge variant="subtle" colorScheme="purple" fontSize="0.7em">{task.project.name}</Badge>
                    )}
                    {task.agent?.name && (
                        <Tag size="sm" colorScheme="blue" variant="subtle">
                            <ChatIcon mr={1.5} /> {task.agent.name}
                        </Tag>
                    )}
                </HStack>
            </VStack>
            <VStack alignItems="flex-end" spacing={0} minW="120px">
                <Text fontSize="xs" color="text.muted">
                    {new Date(task.created_at).toLocaleDateString()} {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {task.updated_at && (
                    <Text fontSize="xs" color="text.muted">
                        Updated: {new Date(task.updated_at).toLocaleDateString()} {new Date(task.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                )}
            </VStack>
            <HStack spacing={2} ml={2}>
                <Tooltip label="Edit task" placement="top">
                    <IconButton
                        aria-label="Edit task"
                        icon={<EditIcon />}
                        onClick={e => { e.stopPropagation(); handleEdit(); }}
                        size="sm"
                        variant="outline"
                        colorScheme="gray"
                        isDisabled={task.completed}
                    />
                </Tooltip>
                <Tooltip label="Delete task" placement="top">
                    <IconButton
                        aria-label="Delete task"
                        icon={<DeleteIcon />}
                        onClick={e => { e.stopPropagation(); handleDelete(); }}
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                    />
                </Tooltip>
            </HStack>
        </Flex>
    );
};

export default React.memo(TaskItem);
