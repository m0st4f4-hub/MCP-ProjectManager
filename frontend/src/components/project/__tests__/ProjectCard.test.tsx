import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import ProjectCard from '../ProjectCard';
import { ProjectWithMeta } from '@/types';

// Mock project data for testing
const mockProject: ProjectWithMeta = {
  id: 'proj_1',
  name: 'Autonomous Agent Platform',
  description: 'A platform for managing and orchestrating autonomous agents.',
  created_at: new Date('2023-10-01T10:00:00Z').toISOString(),
  updated_at: new Date('2023-10-26T14:30:00Z').toISOString(),
  is_archived: false,
  status: 'in_progress',
  task_count: 15,
  completed_task_count: 5,
};

const archivedProject: ProjectWithMeta = {
  ...mockProject,
  id: 'proj_2',
  name: 'Archived Initiative',
  is_archived: true,
  status: 'completed',
};

describe('ProjectCard', () => {
  // Mock handler functions
  const onEdit = vi.fn();
  const onArchive = vi.fn();
  const onUnarchive = vi.fn();
  const onDelete = vi.fn();
  const onCopyGet = vi.fn();
  const onOpenCliPrompt = vi.fn();

  const renderComponent = (project: ProjectWithMeta) => {
    return render(
      <TestWrapper>
        <ProjectCard
          project={project}
          onEdit={onEdit}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onDelete={onDelete}
          onCopyGet={onCopyGet}
          onOpenCliPrompt={onOpenCliPrompt}
        />
      </TestWrapper>
    );
  };

  it('renders project details correctly', () => {
    renderComponent(mockProject);
    expect(screen.getByText('Autonomous Agent Platform')).toBeInTheDocument();
    expect(screen.getByText('A platform for managing and orchestrating autonomous agents.')).toBeInTheDocument();
    expect(screen.getByText('5 / 15 Tasks')).toBeInTheDocument();
  });

  it('displays a link to the project detail page', () => {
    renderComponent(mockProject);
    const link = screen.getByRole('link', { name: /autonomous agent platform/i });
    expect(link).toHaveAttribute('href', '/projects/proj_1');
  });

  it('calls onArchive when archive button is clicked for an active project', () => {
    renderComponent(mockProject);
    const menuButton = screen.getByLabelText('Project Actions');
    fireEvent.click(menuButton);
    const archiveButton = screen.getByText('Archive');
    fireEvent.click(archiveButton);
    expect(onArchive).toHaveBeenCalledWith(mockProject.id);
  });

  it('calls onUnarchive when unarchive button is clicked for an archived project', () => {
    renderComponent(archivedProject);
    const menuButton = screen.getByLabelText('Project Actions');
    fireEvent.click(menuButton);
    const unarchiveButton = screen.getByText('Unarchive');
    fireEvent.click(unarchiveButton);
    expect(onUnarchive).toHaveBeenCalledWith(archivedProject.id);
  });

  it('calls onDelete when delete button is clicked', () => {
    renderComponent(mockProject);
    const menuButton = screen.getByLabelText('Project Actions');
    fireEvent.click(menuButton);
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(mockProject.id);
  });
});
