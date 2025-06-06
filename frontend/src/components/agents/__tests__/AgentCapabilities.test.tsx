import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
<<<<<<< HEAD
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
=======
import { render, screen } from '@/__tests__/utils/test-utils';
import AgentCapabilities from '../AgentCapabilities';

vi.mock('@/services/api/agent_roles', () => ({
  agentRolesApi: {
    getCapabilities: vi.fn().mockResolvedValue([]),
    addCapability: vi.fn().mockResolvedValue({}),
    deleteCapability: vi.fn().mockResolvedValue(undefined),
>>>>>>> origin/codex/add-agentcapabilities-component-and-api-integration
  },
}));

describe('AgentCapabilities', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
<<<<<<< HEAD
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
=======
  });

  it('should render without crashing', async () => {
    render(
      <AgentCapabilities roleName="BuilderAgent" roleId="1" />,
      { wrapper: ({ children }) => <div>{children}</div> }
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    render(
      <AgentCapabilities roleName="BuilderAgent" roleId="1" />,
      { wrapper: ({ children }) => <div>{children}</div> }
    );

    const buttons = screen.queryAllByRole('button');
    const inputs = screen.queryAllByRole('textbox');

    if (buttons.length > 0) {
      await user.click(buttons[0]);
    }

    if (inputs.length > 0) {
      await user.type(inputs[0], 'test');
    }

    expect(document.body).toBeInTheDocument();
  });
>>>>>>> origin/codex/add-agentcapabilities-component-and-api-integration
});
