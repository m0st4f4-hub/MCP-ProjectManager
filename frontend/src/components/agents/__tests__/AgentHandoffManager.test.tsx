import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import AgentHandoffManager from '../AgentHandoffManager';
import { mockFetchResponse } from '@/__tests__/utils/test-utils';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

vi.mock('@/services/api/agent_handoff_criteria', () => ({
  createAgentHandoffCriteria: vi.fn().mockResolvedValue({}),
  listAgentHandoffCriteria: vi.fn().mockResolvedValue([]),
  deleteAgentHandoffCriteria: vi.fn().mockResolvedValue(undefined),
}));

describe('AgentHandoffManager', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchResponse({ success: true, criteria: [] });
  });

  it('renders component', () => {
    render(<AgentHandoffManager agentRoleId="role1" />, {
      wrapper: TestWrapper,
    });
    expect(document.body).toBeInTheDocument();
  });

  it('handles user interactions and creates criteria', async () => {
    render(<AgentHandoffManager agentRoleId="role1" />, {
      wrapper: TestWrapper,
    });

    const input = screen.getByPlaceholderText('New criteria');
    await user.type(input, 'test');
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    expect(document.body).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalled(); // initial list

    await user.type(screen.getByPlaceholderText('Criteria'), 'demo');
    mockFetchResponse({
      success: true,
      criteria: {
        id: '1',
        agent_role_id: 'role1',
        criteria: 'demo',
        description: '',
        target_agent_role: '',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
      },
    });
    const addNewHandoffButton = screen.getByRole('button', { name: /add new handoff/i });
    await user.click(addNewHandoffButton);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
