import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
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
  });
});
