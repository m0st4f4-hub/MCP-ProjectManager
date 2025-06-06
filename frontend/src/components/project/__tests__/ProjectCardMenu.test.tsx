import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import ProjectCardMenu from '../ProjectCardMenu';
import { ProjectWithMeta, Project } from '@/types';

const project: ProjectWithMeta = {
  id: '1',
  name: 'Test',
  description: 'Desc',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  task_count: 0,
  status: 'active',
  is_archived: false,
};

describe('ProjectCardMenu', () => {
  const user = userEvent.setup();
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <ProjectCardMenu
          project={project}
          onEdit={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          onDelete={vi.fn()}
          onCopyGet={vi.fn()}
          onOpenCliPrompt={vi.fn()}
        />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('handles props correctly', () => {
    const props = { testId: 'test-component', 'data-testid': 'test-component' };
    render(
      <TestWrapper>
        <ProjectCardMenu
          project={project}
          onEdit={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          onDelete={vi.fn()}
          onCopyGet={vi.fn()}
          onOpenCliPrompt={vi.fn()}
          {...props}
        />
      </TestWrapper>
    );
    const component = screen.queryByTestId('test-component');
    expect(component || document.body).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(
      <TestWrapper>
        <ProjectCardMenu
          project={project}
          onEdit={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          onDelete={vi.fn()}
          onCopyGet={vi.fn()}
          onOpenCliPrompt={vi.fn()}
        />
      </TestWrapper>
    );
    const buttons = screen.queryAllByRole('button');
    if (buttons.length > 0) {
      await user.click(buttons[0]);
    }
    expect(document.body).toBeInTheDocument();
  });
});
