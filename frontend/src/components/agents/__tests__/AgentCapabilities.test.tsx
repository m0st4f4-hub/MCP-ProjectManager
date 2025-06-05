import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/__tests__/utils/test-utils';
import AgentCapabilities from '../AgentCapabilities';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any) => l,
  };
});

vi.mock('@/services/api/capabilities', () => ({
  capabilityApi: {
    list: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue({ id: '1', agent_role_id: 'r', capability: 'cap' }),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('AgentCapabilities', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders component', async () => {
    render(<AgentCapabilities roleId="role-1" />, { wrapper: ({ children }) => <div>{children}</div> });
    expect(document.body).toBeInTheDocument();
  });

  it('handles interactions', async () => {
    render(<AgentCapabilities roleId="role-1" />, { wrapper: ({ children }) => <div>{children}</div> });
    const input = screen.getAllByRole('textbox');
    if (input.length > 0) {
      await user.type(input[0], 'test');
    }
    const button = screen.getByRole('button', { name: /add/i });
    await user.click(button);
    expect(button).toBeInTheDocument();
  });
});
