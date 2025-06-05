import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  TestWrapper,
} from '@/__tests__/utils/test-utils'
import AuditLogViewer from '../AuditLogViewer'
import { getAuditLogs } from '@/services/api/audit_logs'

vi.mock('@/services/api/audit_logs', () => ({
  getAuditLogs: vi.fn(),
}))

describe('AuditLogViewer', () => {
  const logs = [
    { id: '1', action: 'CREATE', user_id: 'u1', timestamp: '2024-01-01T00:00:00Z' },
    { id: '2', action: 'UPDATE', user_id: 'u2', timestamp: '2024-01-02T00:00:00Z' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(getAuditLogs as jest.Mock).mockResolvedValue(logs)
  })

  it('fetches logs on mount and displays them', async () => {
    render(<AuditLogViewer />, { wrapper: TestWrapper })
    expect(getAuditLogs).toHaveBeenCalledTimes(1)
    await screen.findByText('CREATE')
    expect(screen.getByText('UPDATE')).toBeInTheDocument()
  })

  it('applies filters and refetches logs', async () => {
    render(<AuditLogViewer />, { wrapper: TestWrapper })

    ;(getAuditLogs as jest.Mock).mockClear()
    ;(getAuditLogs as jest.Mock).mockResolvedValue([logs[0]])

    fireEvent.change(screen.getByPlaceholderText('Project ID'), {
      target: { value: 'proj1' },
    })
    fireEvent.change(screen.getByPlaceholderText('User ID'), {
      target: { value: 'user1' },
    })

    fireEvent.click(screen.getByRole('button', { name: /apply/i }))

    await waitFor(() => expect(getAuditLogs).toHaveBeenCalledTimes(1))
    expect(getAuditLogs).toHaveBeenCalledWith({
      project_id: 'proj1',
      user_id: 'user1',
      skip: 0,
      limit: 100,
    })
    await screen.findByText('CREATE')
    expect(screen.queryByText('UPDATE')).not.toBeInTheDocument()
  })
})
