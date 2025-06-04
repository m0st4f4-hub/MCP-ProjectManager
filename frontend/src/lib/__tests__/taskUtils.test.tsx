import { describe, it, expect, vi } from 'vitest';
import { getTaskCategory } from '../taskUtils';
import type { Task } from '@/types/task';

vi.mock('@/lib/utils', () => ({
  mapStatusToStatusID: vi.fn()
}));

vi.mock('@/lib/statusUtils', () => ({
  getStatusAttributes: vi.fn()
}));

import { mapStatusToStatusID } from '@/lib/utils';
import { getStatusAttributes } from '@/lib/statusUtils';

const mockMapStatusToStatusID = vi.mocked(mapStatusToStatusID);
const mockGetStatusAttributes = vi.mocked(getStatusAttributes);

describe('taskUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTaskCategory', () => {
    it('should return correct category for valid status', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Test Task',
        status: 'todo',
        priority: 'medium',
        project_id: 'project-1',
        assigned_agent_id: null,
        dependencies: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      } as Task;

      mockMapStatusToStatusID.mockReturnValue('TO_DO');
      mockGetStatusAttributes.mockReturnValue({ 
        category: 'todo', 
        displayName: 'To Do',
        color: '#gray' 
      });

      const result = getTaskCategory(task);

      expect(mockMapStatusToStatusID).toHaveBeenCalledWith('todo');
      expect(result).toBe('todo');
    });

    it('should return default category for undefined status', () => {
      const task = { status: undefined } as Task;
      const result = getTaskCategory(task);
      expect(result).toBe('todo');
    });

    it('should return default category when attributes not found', () => {
      const task = { status: 'unknown' } as Task;
      mockMapStatusToStatusID.mockReturnValue('UNKNOWN' as any);
      mockGetStatusAttributes.mockReturnValue(null);

      const result = getTaskCategory(task);
      expect(result).toBe('todo');
    });
  });
});
