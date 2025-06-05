import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, TestWrapper } from '@/__tests__/utils/test-utils';
import { createMockTask } from '@/__tests__/factories';
import TaskItem from '../task/TaskItem';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<typeof import('@chakra-ui/react')>('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

describe('TaskItem snapshot', () => {
  it('renders consistently', () => {
    const task = createMockTask({
      project_id: 'project-id',
      task_number: 1,
      title: 'Snapshot Task',
      description: 'Snapshot description',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      agent_id: null,
    });
    const { asFragment } = render(
      <TestWrapper>
        <TaskItem task={task} projectName="Project" onDeleteInitiate={() => {}} />
      </TestWrapper>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
