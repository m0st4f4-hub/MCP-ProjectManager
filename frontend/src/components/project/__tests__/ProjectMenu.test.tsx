import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import ProjectMenu from '../ProjectMenu';
import { ProjectWithMeta } from '@/types';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

const mockProject: ProjectWithMeta = {
  id: '1',
  name: 'Test',
  description: 'desc',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_archived: false,
  status: 'not_started',
  task_count: 0,
  completed_task_count: 0,
};

describe('ProjectMenu', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <ProjectMenu
          project={mockProject}
          onEdit={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          onDelete={vi.fn()}
          onCopyGet={vi.fn()}
          onOpenCliPrompt={vi.fn()}
          disableActions={false}
        />
      </TestWrapper>
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should handle user interactions', async () => {
    render(
      <TestWrapper>
        <ProjectMenu
          project={mockProject}
          onEdit={vi.fn()}
          onArchive={vi.fn()}
          onUnarchive={vi.fn()}
          onDelete={vi.fn()}
          onCopyGet={vi.fn()}
          onOpenCliPrompt={vi.fn()}
          disableActions={false}
        />
      </TestWrapper>
    );

    const button = screen.getByRole('button');
    await user.click(button);
    expect(button).toBeInTheDocument();
  });
});
