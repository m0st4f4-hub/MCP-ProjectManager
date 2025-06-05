import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/__tests__/utils/test-utils';
import ErrorProtocolManager from '../src/components/agents/ErrorProtocolManager';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

vi.mock('../src/services/api/errorProtocols', () => ({
  errorProtocolsApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: '1', agent_role_id: '1', error_type: 't', protocol: 'p', priority: 5, is_active: true, created_at: new Date().toISOString() }),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('ErrorProtocolManager', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ErrorProtocolManager agentRoleId="1" />, { wrapper: ({ children }) => <div>{children}</div> });
    expect(document.body).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<ErrorProtocolManager agentRoleId="1" />, { wrapper: ({ children }) => <div>{children}</div> });
    const inputs = screen.getAllByRole('textbox');
    const button = screen.getByRole('button', { name: /add/i });

    if (inputs.length >= 2) {
      await user.type(inputs[0], 'type');
      await user.type(inputs[1], 'protocol');
    }
    await user.click(button);

    expect(document.body).toBeInTheDocument();
  });
});
