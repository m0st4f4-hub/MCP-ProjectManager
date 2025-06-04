import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectProvider, useProjectContext } from '../ProjectContext';
import { createMockProject } from '@/__tests__/factories/project.factory';

const TestComponent = () => {
  const { selectedProject, setSelectedProject } = useProjectContext();
  const mock = createMockProject();
  return (
    <div>
      <span data-testid="project-name">{selectedProject?.name || 'none'}</span>
      <button onClick={() => setSelectedProject(mock)}>set</button>
    </div>
  );
};

describe('ProjectContext', () => {
  it('provides and updates selected project', async () => {
    const user = userEvent.setup();
    render(
      <ProjectProvider>
        <TestComponent />
      </ProjectProvider>
    );

    expect(screen.getByTestId('project-name').textContent).toBe('none');
    await user.click(screen.getByRole('button'));
    expect(screen.getByTestId('project-name').textContent).not.toBe('none');
  });
});
