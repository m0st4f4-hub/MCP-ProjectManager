// D:\mcp\task-manager\frontend\src\components\TaskList.tsx
'use client';

import React from 'react';
import { Task } from '@/services/api';
import TaskItem from './TaskItem';
import {
    Box,
    Text,
    VStack,
    Spinner,
    Heading,
    Accordion
} from '@chakra-ui/react';
import { FixedSizeList as List } from 'react-window';
import EditTaskModal from '@/components/EditTaskModal';

interface TaskListProps {
  tasks: Task[];
}

const ROW_HEIGHT = 72; // px, adjust as needed for your TaskItem summary

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const isEditModalOpen = !!selectedTask;
  const closeEditModal = () => setSelectedTask(null);

  if (tasks.length === 0) {
    return (
      <Box p={4} bg="bg.surface" borderRadius="lg" borderWidth="1px" borderColor="border.default" textAlign="center">
        <Heading size="md" mb={2} color="text.default">No Tasks Found</Heading>
        <Text color="text.secondary">Add a new task or adjust filters.</Text>
      </Box>
    );
  }

  // react-window row renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const task = tasks[index];
    return (
      <Box style={style} key={task.id} onClick={() => setSelectedTask(task)} cursor="pointer">
        <TaskItem task={task} />
      </Box>
    );
  };

  return (
    <>
      <List
        height={Math.min(tasks.length, 8) * ROW_HEIGHT} // Show up to 8 rows at once, scroll for more
        itemCount={tasks.length}
        itemSize={ROW_HEIGHT}
        width="100%"
      >
        {Row}
      </List>
      {selectedTask && (
        <EditTaskModal
          task={selectedTask}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onUpdate={closeEditModal} // Optionally refetch tasks after update
        />
      )}
    </>
  );
};

export default TaskList;
