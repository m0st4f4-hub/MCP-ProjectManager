import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as tasksApi from '../api/tasks';
import { request } from '../api/request';
import { buildApiUrl } from '../api/config';
import { TaskStatus } from '@/types/task';

// Mock the dependencies
vi.mock('../api/request');
vi.mock('../api/config');

const mockRequest = vi.mocked(request);
const mockBuildApiUrl = vi.mocked(buildApiUrl);

describe('Tasks API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildApiUrl.mockReturnValue('http://localhost:8000/api/test');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockRawTasks = [
        {
          project_id: 'project-1',
          task_number: 1,
          title: 'Test Task',
          description: 'Test description',
          status: TaskStatus.TO_DO,
          completed: false,
          agent_id: 'agent-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          is_archived: false,
          subtasks: [],
          dependencies: [],
        }
      ];

      mockRequest.mockResolvedValue(mockRawTasks);

      const result = await tasksApi.getTasks('project-1');

      expect(mockBuildApiUrl).toHaveBeenCalledWith(
        expect.any(String),
        '/project-1/tasks?skip=0&limit=100'
      );
      expect(mockRequest).toHaveBeenCalledWith('http://localhost:8000/api/test');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'project-1-1',
        project_id: 'project-1',
        task_number: 1,
        title: 'Test Task',
        description: 'Test description',
        agent_id: 'agent-1',
        is_archived: false,
      });
    });

    it('should handle filters correctly', async () => {
      mockRequest.mockResolvedValue([]);

      const filters = {
        agentId: 'agent-1',
        status: 'todo',
        search: 'test search',
        is_archived: false,
      };

      await tasksApi.getTasks('project-1', filters, undefined, 1, 10);

      expect(mockBuildApiUrl).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('agent_id=agent-1')
      );
      expect(mockBuildApiUrl).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('skip=10')
      );
    });
  });

  describe('getAllTasks', () => {
    it('builds pagination query params', async () => {
      mockRequest.mockResolvedValue([]);

      await tasksApi.getAllTasks(undefined, undefined, 2, 5);

      expect(mockBuildApiUrl).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('skip=10'),
      );
      expect(mockBuildApiUrl).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('limit=5'),
      );
    });
  });

  describe('getTaskById', () => {
    it('should fetch single task successfully', async () => {
      const mockRawTask = {
        project_id: 'project-1',
        task_number: 1,
        title: 'Test Task',
        status: TaskStatus.TO_DO,
        completed: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        subtasks: [],
        dependencies: [],
      };

      mockRequest.mockResolvedValue(mockRawTask);

      const result = await tasksApi.getTaskById('project-1', 1);

      expect(result).toMatchObject({
        id: 'project-1-1',
        project_id: 'project-1',
        task_number: 1,
        title: 'Test Task',
      });
    });
  });
});
