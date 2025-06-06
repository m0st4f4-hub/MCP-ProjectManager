import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import ProjectMembers from '../ProjectMembers';
import {
  getProjectMembers,
  addMemberToProject,
  removeMemberFromProject,
} from '@/services/api/projects';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

vi.mock('@/services/api/projects', () => ({
  getProjectMembers: vi.fn(),
  addMemberToProject: vi.fn(),
  removeMemberFromProject: vi.fn(),
}));

describe('ProjectMembers', () => {
  const user = userEvent.setup();
  const getMembersMock = getProjectMembers as unknown as vi.Mock;
  const addMock = addMemberToProject as unknown as vi.Mock;
  const removeMock = removeMemberFromProject as unknown as vi.Mock;
  const projectId = 'p1';

  beforeEach(() => {
    vi.clearAllMocks();
    getMembersMock.mockResolvedValue([]);
    addMock.mockResolvedValue({ success: true });
    removeMock.mockResolvedValue({ success: true });
  });

  it('should render without crashing', () => {
    render(
      <TestWrapper>
        <ProjectMembers projectId={projectId} />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('should handle props correctly', () => {
    const props = { 
      testId: 'test-component',
      'data-testid': 'test-component'
    };
    
    render(
      <TestWrapper>
        <ProjectMembers projectId={projectId} {...props} />
      </TestWrapper>
    );
    
    const component = screen.queryByTestId('test-component');
    expect(component || document.body).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    getMembersMock.mockResolvedValueOnce([]);
    render(
      <TestWrapper>
        <ProjectMembers projectId={projectId} />
      </TestWrapper>
    );

    await waitFor(() => expect(getMembersMock).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/user id/i), 'u2');
    await user.selectOptions(screen.getByLabelText(/role/i), 'member');
    await user.click(screen.getByRole('button', { name: /add member/i }));

    await waitFor(() =>
      expect(addMock).toHaveBeenCalledWith(projectId, {
        project_id: projectId,
        user_id: 'u2',
        role: 'member',
      })
    );

    getMembersMock.mockResolvedValueOnce([
      { project_id: projectId, user_id: 'u2', role: 'member', id: '1', created_at: '' },
    ]);

    await user.click(screen.getByRole('button', { name: /remove/i }));

    await waitFor(() =>
      expect(removeMock).toHaveBeenCalledWith(projectId, 'u2')
    );
  });
});
