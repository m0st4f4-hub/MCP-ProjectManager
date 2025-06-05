import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import ErrorProtocolManager from '../ErrorProtocolManager';
import { errorProtocolsApi } from '@/services/api/error_protocols';

vi.mock('@/services/api/error_protocols');

const mockApi = vi.mocked(errorProtocolsApi);

describe('ErrorProtocolManager', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.list.mockResolvedValue([
      {
        id: '1',
        agent_role_id: 'role1',
        error_type: 'TypeA',
        protocol: 'Do something',
        created_at: '2024-01-01T00:00:00Z',
        is_active: true,
      },
    ]);
  });

  it('loads and displays protocols', async () => {
    render(
      <ErrorProtocolManager agentRoleId="role1" />,
      { wrapper: ({ children }) => <div>{children}</div> }
    );

    await waitFor(() => expect(mockApi.list).toHaveBeenCalled());
    expect(screen.getByText('TypeA')).toBeInTheDocument();
  });

  it('submits new protocol and updates table', async () => {
    mockApi.create.mockResolvedValue({
      id: '2',
      agent_role_id: 'role1',
      error_type: 'TypeB',
      protocol: 'Fix it',
      created_at: '2024-01-02T00:00:00Z',
      is_active: true,
    });

    mockApi.list.mockResolvedValueOnce([]); // initial load
    mockApi.list.mockResolvedValueOnce([
      {
        id: '1',
        agent_role_id: 'role1',
        error_type: 'TypeA',
        protocol: 'Do something',
        created_at: '2024-01-01T00:00:00Z',
        is_active: true,
      },
      {
        id: '2',
        agent_role_id: 'role1',
        error_type: 'TypeB',
        protocol: 'Fix it',
        created_at: '2024-01-02T00:00:00Z',
        is_active: true,
      },
    ]);

    render(
      <ErrorProtocolManager agentRoleId="role1" />,
      { wrapper: ({ children }) => <div>{children}</div> }
    );

    const userInputType = screen.getByLabelText('Error Type');
    const userInputProtocol = screen.getByLabelText('Protocol');
    const addButton = screen.getByRole('button', { name: /add/i });

    await user.type(userInputType, 'TypeB');
    await user.type(userInputProtocol, 'Fix it');
    await user.click(addButton);

    await waitFor(() => expect(mockApi.create).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('TypeB')).toBeInTheDocument());
  });
});
