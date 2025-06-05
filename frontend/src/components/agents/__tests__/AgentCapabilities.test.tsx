import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, TestWrapper } from '@/__tests__/utils/test-utils';
import AgentCapabilities from '../AgentCapabilities';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

const listMock = vi.fn().mockResolvedValue([]);
const createMock = vi.fn().mockResolvedValue({});

vi.mock('@/services/api', () => ({
  agentCapabilitiesApi: {
    list: listMock,
    create: createMock,
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('AgentCapabilities', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    listMock.mockResolvedValue([]);
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <AgentCapabilities agentRoleId="role1" />
      </TestWrapper>
    );
    expect(document.body).toBeInTheDocument();
  });

  it('handles adding capability', async () => {
    render(
      <TestWrapper>
        <AgentCapabilities agentRoleId="role1" />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText('Capability');
    await user.type(input, 'demo');
    await user.click(screen.getByRole('button', { name: /add/i }));

    expect(createMock).toHaveBeenCalled();
  });
});
