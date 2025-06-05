import { describe, it, expect } from 'vitest';
import {
  getCompletedTaskPrompt,
  getPendingTaskPrompt,
  getInProgressTaskPrompt,
  getBlockedTaskPrompt,
  getFailedTaskPrompt,
  getUnassignedTaskPrompt,
  STATUS_PROMPT_MAP,
} from '../promptUtils';
import { TaskStatus, Task } from '@/types/task';

const task: Task = { id: '1', title: 'Example Task' } as any;

describe('promptUtils', () => {
  it('generates completed task prompt', () => {
    const prompt = getCompletedTaskPrompt([task]);
    expect(prompt).toContain('review and verify');
  });

  it('generates pending task prompt', () => {
    const prompt = getPendingTaskPrompt([task]);
    expect(prompt).toContain('prioritize and work on');
  });

  it('generates in-progress task prompt', () => {
    const prompt = getInProgressTaskPrompt([task]);
    expect(prompt).toContain('tasks in progress');
  });

  it('generates blocked task prompt', () => {
    const prompt = getBlockedTaskPrompt([task]);
    expect(prompt).toContain('resolve blockers');
  });

  it('generates failed task prompt', () => {
    const prompt = getFailedTaskPrompt([task]);
    expect(prompt).toContain('attempt to recover');
  });

  it('generates unassigned task prompt', () => {
    const prompt = getUnassignedTaskPrompt([task]);
    expect(prompt).toContain('assign to available agents');
  });

  it('maps TaskStatus values to prompt generators', () => {
    const mappingPrompt = STATUS_PROMPT_MAP[TaskStatus.COMPLETED]([task]);
    expect(mappingPrompt).toBe(getCompletedTaskPrompt([task]));
  });
});
