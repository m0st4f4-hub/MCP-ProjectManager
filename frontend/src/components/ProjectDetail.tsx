import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useProjectData } from '../hooks/useProjectData';
import { useFilteredTasks } from '../hooks/useFilteredTasks';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { ProjectSettings } from './ProjectSettings';
import { Task } from '../types';

interface ProjectDetailProps {
  projectId?: string;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId: propProjectId }) => {
  const { id: paramProjectId } = useParams<{ id: string }>();
  const projectId = propProjectId || paramProjectId;
  
  const {
    project,
    tasks,
    loading,
    error,
    refresh,
    createTask,
    updateTask,
    deleteTask
  } = useProjectData(projectId);
  
  const [taskFilters, setTaskFilters] = useState({});
  const { filteredTasks, taskCounts } = useFilteredTasks(tasks, taskFilters);
  
  const { isOpen: isTaskFormOpen, onOpen: onTaskFormOpen, onClose: onTaskFormClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createTask(taskData);
      onTaskFormClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };
  
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };
  
  const completionPercentage = taskCounts.total > 0 
    ? Math.round((taskCounts.completed / taskCounts.total) * 100)
    : 0;
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <Spinner size="lg" />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }
  
  if (!project) {
    return (
      <Alert status="warning">
        <AlertIcon />
        Project not found
      </Alert>
    );
  }
  
  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        {/* Project Header */}
        <Box>
          <HStack justify="space-between" align="start" mb={4}>
            <VStack align="start" spacing={2}>
              <Heading size="lg">{project.name}</Heading>
              <Text color="gray.600">{project.description}</Text>
              <HStack>
                <Badge colorScheme={project.is_archived ? 'gray' : 'green'}>
                  {project.is_archived ? 'Archived' : 'Active'}
                </Badge>
                <Badge variant="outline">
                  {taskCounts.total} tasks
                </Badge>
              </HStack>
            </VStack>
            
            <HStack>
              <Button onClick={onTaskFormOpen} colorScheme="blue">
                Add Task
              </Button>
              <Button onClick={onSettingsOpen} variant="outline">
                Settings
              </Button>
            </HStack>
          </HStack>
          
          {/* Project Stats */}
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
            <GridItem>
              <Stat>
                <StatLabel>Completion</StatLabel>
                <StatNumber>{completionPercentage}%</StatNumber>
                <StatHelpText>
                  {taskCounts.completed} of {taskCounts.total} tasks
                </StatHelpText>
                <Progress value={completionPercentage} colorScheme="green" size="sm" mt={2} />
              </Stat>
            </GridItem>
            
            <GridItem>
              <Stat>
                <StatLabel>In Progress</StatLabel>
                <StatNumber>{taskCounts.inProgress}</StatNumber>
                <StatHelpText>Active tasks</StatHelpText>
              </Stat>
            </GridItem>
            
            <GridItem>
              <Stat>
                <StatLabel>Pending</StatLabel>
                <StatNumber>{taskCounts.pending}</StatNumber>
                <StatHelpText>Awaiting start</StatHelpText>
              </Stat>
            </GridItem>
          </Grid>
        </Box>
        
        {/* Project Content */}
        <Tabs>
          <TabList>
            <Tab>Tasks</Tab>
            <Tab>Timeline</Tab>
            <Tab>Files</Tab>
            <Tab>Activity</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              <TaskList
                tasks={filteredTasks}
                onTaskUpdate={handleUpdateTask}
                onTaskDelete={handleDeleteTask}
                onTaskEdit={setEditingTask}
                filters={taskFilters}
                onFiltersChange={setTaskFilters}
              />
            </TabPanel>
            
            <TabPanel>
              <Text>Timeline view coming soon...</Text>
            </TabPanel>
            
            <TabPanel>
              <Text>File management coming soon...</Text>
            </TabPanel>
            
            <TabPanel>
              <Text>Activity feed coming soon...</Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
      
      {/* Task Form Modal */}
      <TaskForm
        isOpen={isTaskFormOpen || !!editingTask}
        onClose={() => {
          onTaskFormClose();
          setEditingTask(null);
        }}
        onSubmit={editingTask ? 
          (data) => handleUpdateTask(editingTask.id, data) :
          handleCreateTask
        }
        initialData={editingTask || undefined}
        projectId={projectId!}
      />
      
      {/* Project Settings Modal */}
      <ProjectSettings
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
        project={project}
        onUpdate={refresh}
      />
    </Box>
  );
};