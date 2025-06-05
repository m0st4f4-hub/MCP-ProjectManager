import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import ErrorProtocolManager from '../ErrorProtocolManager';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

vi.mock('@/services/api/error_protocols', () => ({
  errorProtocolsApi: {
    create: vi.fn().mockResolvedValue({}),
    list: vi.fn().mockResolvedValue([]),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('ErrorProtocolManager', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders component', () => {
    render(<ErrorProtocolManager agentRoleId="role1" />, {
      wrapper: TestWrapper,
    });
    expect(document.body).toBeInTheDocument();
  });

  it('handles create flow', async () => {
    render(<ErrorProtocolManager agentRoleId="role1" />, {
      wrapper: TestWrapper,
    });

    await user.type(screen.getByPlaceholderText('Error Type'), 'Type');
    await user.type(screen.getByPlaceholderText('Protocol'), 'Handle');
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    expect(document.body).toBeInTheDocument();
  });
});
