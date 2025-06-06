'use client';
<<<<<<< HEAD
import * as logger from '@/utils/logger';
=======
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getProjectById,
  deleteProject,
  archiveProject,
  unarchiveProject,
<<<<<<< HEAD
=======
  exportProject,
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
} from '@/services/api/projects';
import { Project } from '@/types/project';
import {
  generateProjectManagerPlanningPrompt,
  PlanningRequestData,
  PlanningResponseData,
} from '@/services/api/planning';
import ProjectMembers from './ProjectMembers';
import ProjectFileUpload from './ProjectFileUpload';
import { getAllTasksForProject } from '@/services/api/tasks';
import { Task } from '@/types/task';
import TaskItem from '@/components/task/TaskItem';
import { useToast } from '@chakra-ui/react';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planningGoal, setPlanningGoal] = useState('');
  const [planningPrompt, setPlanningPrompt] = useState<string | null>(null);
  const [planningLoading, setPlanningLoading] = useState(false);
  const [planningError, setPlanningError] = useState<string | null>(null);
  const toast = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      const data = await getProjectById(projectId);
      setProject(data);
    } catch (err) {
      setError('Failed to fetch project details');
      logger.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!projectId) return;
    try {
      const data = await getAllTasksForProject(
        projectId,
        undefined,
        undefined,
        0,
        100
      );
      setTasks(data);
    } catch (err) {
      setTasksError('Failed to fetch tasks');
      logger.error(err);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [projectId]);

  const handleDelete = async () => {
    if (!project) return;
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(project.id);
        toast({
          title: 'Project deleted',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/projects');
      } catch (err) {
        toast({
          title: 'Failed to delete project',
          description: err instanceof Error ? err.message : String(err),
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
<<<<<<< HEAD
        logger.error(err);
=======
        console.error(err);
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
      }
    }
  };

  const handleArchive = async () => {
    if (!project) return;
    try {
      await archiveProject(project.id);
      toast({ title: 'Project archived', status: 'success', duration: 3000, isClosable: true });
      fetchProject();
    } catch (err) {
      toast({ title: 'Failed to archive project', description: err instanceof Error ? err.message : String(err), status: 'error', duration: 5000, isClosable: true });
<<<<<<< HEAD
      logger.error(err);
=======
      console.error(err);
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
    }
  };

  const handleUnarchive = async () => {
    if (!project) return;
    try {
      await unarchiveProject(project.id);
      toast({ title: 'Project unarchived', status: 'success', duration: 3000, isClosable: true });
      fetchProject();
    } catch (err) {
      toast({ title: 'Failed to unarchive project', description: err instanceof Error ? err.message : String(err), status: 'error', duration: 5000, isClosable: true });
<<<<<<< HEAD
      logger.error(err);
=======
      console.error(err);
    }
  };

  const handleExport = async () => {
    if (!project) return;
    try {
      const data = await exportProject(project.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export project');
      console.error(err);
>>>>>>> d85857b55b813ed922e2182b4381bef011fd6a26
    }
  };

  const handleGeneratePlanningPrompt = async () => {
    if (!project || !planningGoal) return;
    setPlanningLoading(true);
    setPlanningError(null);
    try {
      const data: PlanningRequestData = { goal: planningGoal };
      const response: PlanningResponseData =
        await generateProjectManagerPlanningPrompt(data);
      setPlanningPrompt(response.prompt);
    } catch (err) {
      setPlanningError('Failed to generate planning prompt');
      logger.error(err);
    } finally {
      setPlanningLoading(false);
    }
  };

  if (loading) {
    return <div>Loading project details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div>
      <h1>Project: {project.name}</h1>
      <p>Tasks: {project.task_count}</p>
      <div>
        <button onClick={handleDelete}>Delete Project</button>
        <button onClick={handleArchive}>Archive Project</button>
        <button onClick={handleUnarchive}>Unarchive Project</button>
        <button onClick={handleExport}>Download JSON</button>
      </div>

      <ProjectMembers projectId={project.id} />

      <h2>Tasks</h2>
      {tasksLoading ? (
        <div>Loading tasks...</div>
      ) : tasksError ? (
        <div>Error: {tasksError}</div>
      ) : tasks.length === 0 ? (
        <p>No tasks found for this project.</p>
      ) : (
        <div>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              projectName={project.name}
              onDeleteInitiate={() => {}}
              onAssignAgent={() => {}}
              onCopyGetCommand={() => {}}
            />
          ))}
        </div>
      )}

      <ProjectFileUpload projectId={project.id} />

      <h2>Planning Prompt Generator</h2>
      <div>
        <label htmlFor="planningGoal">Goal:</label>
        <input
          id="planningGoal"
          type="text"
          value={planningGoal}
          onChange={(e) => setPlanningGoal(e.target.value)}
        />
        <button
          onClick={handleGeneratePlanningPrompt}
          disabled={planningLoading || !planningGoal}
        >
          {planningLoading ? 'Generating...' : 'Generate Prompt'}
        </button>
      </div>
      {planningError && <div>Error: {planningError}</div>}
      {planningPrompt && (
        <div>
          <h3>Generated Prompt:</h3>
          <p>{planningPrompt}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
