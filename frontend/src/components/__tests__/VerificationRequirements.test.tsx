import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, TestWrapper } from '@/__tests__/utils/test-utils';
import VerificationRequirements from '../agents/VerificationRequirements';

vi.mock('@/services/api', () => ({
  verificationRequirementsApi: {
    list: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

const { verificationRequirementsApi } = await import('@/services/api');

describe('VerificationRequirements component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays requirements', async () => {
    (verificationRequirementsApi.list as any).mockResolvedValue([
      { id: '1', agent_role_id: 'role1', requirement: 'req', is_mandatory: true, created_at: '2024' },
    ]);

    render(
      <TestWrapper>
        <VerificationRequirements agentRoleId="role1" />
      </TestWrapper>,
    );

    await waitFor(() => expect(verificationRequirementsApi.list).toHaveBeenCalled());
    expect(screen.getByText('req')).toBeInTheDocument();
  });

  it('creates a requirement', async () => {
    (verificationRequirementsApi.list as any).mockResolvedValue([]);
    (verificationRequirementsApi.create as any).mockResolvedValue({});

    render(
      <TestWrapper>
        <VerificationRequirements agentRoleId="role1" />
      </TestWrapper>,
    );

    const input = screen.getByPlaceholderText('New requirement');
    await user.type(input, 'new');
    await user.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => expect(verificationRequirementsApi.create).toHaveBeenCalled());
  });
});
