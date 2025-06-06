import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, TestWrapper } from '@/__tests__/utils/test-utils';
import VerificationRequirements from '../VerificationRequirements';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (l: any, d: any) => l,
  };
});

vi.mock('@/services/api', () => ({
  verificationRequirementsApi: {
    list: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

const { verificationRequirementsApi } = await import('@/services/api');

const listMock = verificationRequirementsApi.list as unknown as vi.Mock;
const createMock = verificationRequirementsApi.create as unknown as vi.Mock;
const deleteMock = verificationRequirementsApi.delete as unknown as vi.Mock;

const requirement = {
  id: '1',
  agent_role_id: 'role1',
  requirement: 'req',
  is_mandatory: true,
  created_at: '',
};

describe('VerificationRequirements', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refreshes list after creation', async () => {
    listMock.mockResolvedValueOnce([]).mockResolvedValueOnce([requirement]);
    createMock.mockResolvedValueOnce(requirement);

    render(
      <TestWrapper>
        <VerificationRequirements agentRoleId="role1" />
      </TestWrapper>
    );

    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));

    await user.type(screen.getByPlaceholderText(/new requirement/i), 'req');
    await user.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() =>
      expect(createMock).toHaveBeenCalledWith({ agent_role_id: 'role1', requirement: 'req' })
    );
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
  });

  it('refreshes list after deletion', async () => {
    listMock.mockResolvedValueOnce([requirement]).mockResolvedValueOnce([]);
    deleteMock.mockResolvedValueOnce(undefined);

    render(
      <TestWrapper>
        <VerificationRequirements agentRoleId="role1" />
      </TestWrapper>
    );

    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith('1'));
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
  });
});
