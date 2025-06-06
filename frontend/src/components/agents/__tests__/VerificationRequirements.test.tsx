import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> origin/3kceht-codex/create-verificationrequirements-component
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import VerificationRequirements from '../VerificationRequirements';
import { verificationRequirementsApi } from '@/services/api/verificationRequirements';

vi.mock('@/services/api/verificationRequirements', () => ({
  verificationRequirementsApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockedApi = vi.mocked(verificationRequirementsApi);

describe('VerificationRequirements', () => {
  const user = userEvent.setup();
  const roleId = 'role1';

  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.list.mockResolvedValue([]);
  });

  it('fetches requirements on mount', async () => {
    render(<VerificationRequirements agentRoleId={roleId} />, { wrapper: TestWrapper });
    await waitFor(() => {
      expect(mockedApi.list).toHaveBeenCalledWith(roleId);
    });
  });

  it('creates requirement through API', async () => {
    mockedApi.create.mockResolvedValue({
      id: '1',
      agent_role_id: roleId,
      requirement: 'Check',
      description: '',
      is_mandatory: true,
    });
    render(<VerificationRequirements agentRoleId={roleId} />, { wrapper: TestWrapper });
    await user.click(screen.getByText(/add requirement/i));
    await user.type(screen.getByLabelText(/requirement/i), 'Check');
    await user.click(screen.getByText(/create/i));
    await waitFor(() => {
      expect(mockedApi.create).toHaveBeenCalledWith(roleId, {
        requirement: 'Check',
        description: '',
        is_mandatory: true,
      });
    });
  });

  it('deletes requirement through API', async () => {
    mockedApi.list.mockResolvedValueOnce([
      { id: '1', agent_role_id: roleId, requirement: 'Test', description: '', is_mandatory: true },
    ]);
    mockedApi.remove.mockResolvedValue();
    render(<VerificationRequirements agentRoleId={roleId} />, { wrapper: TestWrapper });
    const deleteBtn = await screen.findByRole('button', { name: /delete/i });
    await user.click(deleteBtn);
    await waitFor(() => {
      expect(mockedApi.remove).toHaveBeenCalledWith('1');
    });
<<<<<<< HEAD
>>>>>>> origin/3kceht-codex/create-verificationrequirements-component
=======
>>>>>>> origin/3kceht-codex/create-verificationrequirements-component
  });
});
