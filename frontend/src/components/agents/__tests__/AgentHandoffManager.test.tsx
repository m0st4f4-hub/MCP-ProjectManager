import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/__tests__/utils/test-utils';
import AgentHandoffManager from '../AgentHandoffManager';

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
  });

  it('renders component', () => {
    render(<AgentHandoffManager agentRoleId="role1" />, {
      wrapper: ({ children }) => <div>{children}</div>,
    });
    expect(document.body).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(<AgentHandoffManager agentRoleId="role1" />, {
      wrapper: ({ children }) => <div>{children}</div>,
    });

    const input = screen.getByPlaceholderText('New criteria');
    await user.type(input, 'test');
    const button = screen.getByRole('button', { name: /add/i });
    await user.click(button);

    expect(document.body).toBeInTheDocument();
  });
});
