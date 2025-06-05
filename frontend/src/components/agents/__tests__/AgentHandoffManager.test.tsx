import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import {
  render,
  screen,
  waitFor,
  TestWrapper,
} from '@/__tests__/utils/test-utils';
import AgentHandoffManager from '../AgentHandoffManager';
import { handoffApi } from '@/services/api/handoff';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

vi.mock('@/services/api/handoff', () => ({
  handoffApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const { list, create, update, delete: del } = handoffApi as any;

describe('AgentHandoffManager', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    list.mockResolvedValue([]);
    create.mockResolvedValue({});
    update.mockResolvedValue({});
    del.mockResolvedValue(undefined);
  });

  it('triggers API calls on CRUD actions', async () => {
    render(
      <TestWrapper>
        <AgentHandoffManager agentRoleId="r1" />
      </TestWrapper>
    );

    await waitFor(() => expect(list).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/new criteria/i), 'crit');
    await user.click(screen.getByRole('button', { name: /add/i }));
    await waitFor(() => expect(create).toHaveBeenCalled());

    list.mockResolvedValueOnce([
      {
        id: '1',
        agent_role_id: 'r1',
        criteria: 'crit',
        description: '',
        target_agent_role: '',
        is_active: true,
        created_at: '',
      },
    ]);
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));

    await user.type(screen.getByLabelText(/criteria/i), 'updated');
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(update).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => expect(del).toHaveBeenCalled());
  });
});
