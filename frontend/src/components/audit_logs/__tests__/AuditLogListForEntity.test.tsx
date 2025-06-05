import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestWrapper } from '@/__tests__/utils/test-utils';
import AuditLogListForEntity from '../AuditLogListForEntity';
import { getAuditLogsByEntity, deleteLog } from '@/services/api/audit_logs';

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
    useColorModeValue: (light: any, dark: any) => light,
  };
});

vi.mock('@/services/api/audit_logs', () => ({
  getAuditLogsByEntity: vi.fn(),
  deleteLog: vi.fn(),
}));

const getAuditLogsByEntityMock = getAuditLogsByEntity as unknown as vi.Mock;
const deleteLogMock = deleteLog as unknown as vi.Mock;

describe('AuditLogListForEntity', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes log on button click', async () => {
    const logs = [
      {
        id: '1',
        action: 'A',
        user_id: 'u1',
        timestamp: new Date().toISOString(),
        details: {},
      },
    ];
    getAuditLogsByEntityMock.mockResolvedValueOnce(logs);

    render(
      <TestWrapper>
        <AuditLogListForEntity entityType="task" entityId="1" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(deleteLogMock).toHaveBeenCalledWith('1');
    });
  });
});
