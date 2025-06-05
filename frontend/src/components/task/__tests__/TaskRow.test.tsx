import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/__tests__/utils/test-utils';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import { createMockTask } from '@/__tests__/factories';
import TaskRow from '../TaskRow';

describe('TaskRow', () => {
  it('renders task and handles selection', () => {
    const task = createMockTask({ title: 'My Task' });
    const onSelect = vi.fn();
    render(
      <TestWrapper>
        <TaskRow
          task={task}
          selected={false}
          onSelect={onSelect}
          onAssignAgent={vi.fn()}
          onDelete={vi.fn()}
          onClick={vi.fn()}
          onCopyGetCommand={vi.fn()}
        />
      </TestWrapper>
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onSelect).toHaveBeenCalled();
    expect(screen.getByText('My Task')).toBeInTheDocument();
  });
});
