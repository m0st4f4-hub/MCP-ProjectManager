import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import AgentForbiddenActions from '../AgentForbiddenActions';
import { forbiddenActionsApi } from '@/services/api';

// Mock the API module
vi.mock('@/services/api');

const mockedApi = vi.mocked(forbiddenActionsApi);

// Mock Chakra UI components
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
  };
});

describe('AgentForbiddenActions', () => {
  const user = userEvent.setup();
  const mockActions = [
    { id: '1', action: 'test_action_1', reason: 'reason1', agent_role_id: 'role1', is_active: true, created_at: new Date().toISOString() },
    { id: '2', action: 'test_action_2', reason: 'reason2', agent_role_id: 'role1', is_active: true, created_at: new Date().toISOString() },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    mockedApi.list.mockResolvedValue(mockActions);
    mockedApi.create.mockResolvedValue(mockActions[0]);
    mockedApi.delete.mockResolvedValue({ message: 'Deleted' });
  });

  it('fetches and renders forbidden actions on mount', async () => {
    render(
      <TestWrapper>
        <AgentForbiddenActions agentRoleId="role1" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockedApi.list).toHaveBeenCalledWith('role1');
      expect(screen.getByText('test_action_1')).toBeInTheDocument();
      expect(screen.getByText('test_action_2')).toBeInTheDocument();
    });
  });

  it('allows adding a new forbidden action', async () => {
    render(
      <TestWrapper>
        <AgentForbiddenActions agentRoleId="role1" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('test_action_1')).toBeInTheDocument();
    });

    const actionInput = screen.getByPlaceholderText('Forbidden action pattern (e.g., shell_exec:*)');
    const reasonInput = screen.getByPlaceholderText('Reason (optional)');
    const addButton = screen.getByRole('button', { name: /add action/i });

    await user.type(actionInput, 'new_action');
    await user.type(reasonInput, 'new_reason');
    await user.click(addButton);

    await waitFor(() => {
      expect(mockedApi.create).toHaveBeenCalledWith('role1', {
        action: 'new_action',
        reason: 'new_reason',
      });
    });
  });

  it('allows deleting a forbidden action', async () => {
    render(
      <TestWrapper>
        <AgentForbiddenActions agentRoleId="role1" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('test_action_1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledWith('1');
    });
  });
});
