import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
<<<<<<< HEAD
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import AgentForbiddenActions from '../AgentForbiddenActions';
import { forbiddenActionsApi } from '@/services/api';
=======
import { render, screen } from '@/__tests__/utils/test-utils';
import AgentForbiddenActions from '../AgentForbiddenActions';
>>>>>>> origin/6iktiw-codex/build-agentforbiddenactions-component

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

<<<<<<< HEAD
vi.mock('@/services/api');

const mockedApi = vi.mocked(forbiddenActionsApi);

describe('AgentForbiddenActions', () => {
  const user = userEvent.setup();
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.list.mockResolvedValue([]);
    mockedApi.create.mockResolvedValue({} as any);
    mockedApi.delete.mockResolvedValue({ message: 'ok' });
  });

  it('fetches actions on mount', async () => {
    render(
      <AgentForbiddenActions agentRoleId="role1" />,
      { wrapper: ({ children }) => <div>{children}</div> }
    );
    await waitFor(() => {
      expect(mockedApi.list).toHaveBeenCalledWith('role1');
    });
  });

  it('calls create API when adding an action', async () => {
    render(
      <AgentForbiddenActions agentRoleId="role1" />,
      { wrapper: ({ children }) => <div>{children}</div> }
    );

    await waitFor(() => expect(mockedApi.list).toHaveBeenCalled());

    await user.type(screen.getByPlaceholderText('Forbidden action'), 'test');
    await user.type(screen.getByPlaceholderText('Reason (optional)'), 'because');
    await user.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(mockedApi.create).toHaveBeenCalledWith('role1', {
        action: 'test',
        reason: 'because',
      });
    });
  });

  it('calls delete API when deleting an action', async () => {
    mockedApi.list.mockResolvedValue([{ id: '1', agent_role_id: 'role1', action: 'A', reason: null, is_active: true, created_at: '' }]);
    render(
      <AgentForbiddenActions agentRoleId="role1" />,
      { wrapper: ({ children }) => <div>{children}</div> }
    );

    await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument());

    await user.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockedApi.delete).toHaveBeenCalledWith('1');
    });
=======
describe('AgentForbiddenActions', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<AgentForbiddenActions />, {
      wrapper: ({ children }) => <div>{children}</div>,
    });
    expect(document.body).toBeInTheDocument();
  });

  it('should allow adding and removing actions', async () => {
    render(<AgentForbiddenActions />, {
      wrapper: ({ children }) => <div>{children}</div>,
    });

    const input = screen.getByPlaceholderText('Enter action');
    await user.type(input, 'test-action');
    await user.click(screen.getByRole('button', { name: /add action/i }));

    expect(screen.getAllByTestId('forbidden-action-row')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(screen.queryAllByTestId('forbidden-action-row')).toHaveLength(0);
>>>>>>> origin/6iktiw-codex/build-agentforbiddenactions-component
  });
});
