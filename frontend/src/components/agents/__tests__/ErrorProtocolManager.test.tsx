import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/__tests__/utils/test-utils';
import ErrorProtocolManager from '../ErrorProtocolManager';
import type { ErrorProtocol } from '@/types/error_protocol';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

const mockProtocols: ErrorProtocol[] = [
  {
    id: '1',
    agent_role_id: 'default',
    error_type: 'TypeError',
    protocol: 'Handle type error',
    priority: 5,
    is_active: true,
    created_at: '',
    updated_at: '',
  },
];

vi.mock('@/services/api/error_protocols', () => ({
  errorProtocolsApi: {
    list: vi.fn(async () => mockProtocols),
    create: vi.fn(async (data) => ({ id: '2', created_at: '', updated_at: '', is_active: true, ...data })),
    remove: vi.fn(async () => {}),
    update: vi.fn(),
  },
}));

describe('ErrorProtocolManager', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders protocols and handles form submission', async () => {
    render(<ErrorProtocolManager />, { wrapper: ({ children }) => <div>{children}</div> });

    // existing row
    expect(await screen.findByText('TypeError')).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    const button = screen.getByRole('button', { name: /add protocol/i });

    if (inputs.length >= 2) {
      await user.type(inputs[0], 'ValueError');
      await user.type(inputs[1], 'Handle value error');
    }
    await user.click(button);

    expect(screen.getAllByTestId('protocol-row').length).toBeGreaterThan(1);
  });
});
