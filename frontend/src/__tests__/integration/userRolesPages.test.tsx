import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import UserRolesPage from '@/app/user-roles/page'
import { getUsers } from '@/services/api/users'
import { assignRole, removeRole } from '@/services/api/userRoles'
import { UserRole } from '@/types/user'

vi.mock('@/services/api/users', () => ({
  getUsers: vi.fn(),
}))

vi.mock('@/services/api/userRoles', () => ({
  assignRole: vi.fn(),
  removeRole: vi.fn(),
}))

describe('UserRolesPage', () => {
  const user = userEvent.setup()
  const getUsersMock = getUsers as unknown as vi.Mock
  const assignRoleMock = assignRole as unknown as vi.Mock
  const removeRoleMock = removeRole as unknown as vi.Mock

  beforeEach(() => {
    vi.clearAllMocks()
    getUsersMock.mockResolvedValue([
      {
        id: 'u1',
        username: 'alice',
        email: '',
        full_name: null,
        disabled: false,
        created_at: '',
        updated_at: '',
        user_roles: [],
      },
    ])
    assignRoleMock.mockResolvedValue({ user_id: 'u1', role_name: UserRole.ADMIN })
    removeRoleMock.mockResolvedValue(undefined)
  })

  it('renders user table', async () => {
    render(<UserRolesPage />)

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument()
    })
  })

  it('assigns and removes role', async () => {
    render(<UserRolesPage />)

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByRole('combobox'), UserRole.ADMIN)
    await user.click(screen.getByRole('button', { name: /assign/i }))

    await waitFor(() =>
      expect(assignRoleMock).toHaveBeenCalledWith('u1', UserRole.ADMIN),
    )

    await user.click(screen.getByRole('button', { name: /admin/i }))

    await waitFor(() =>
      expect(removeRoleMock).toHaveBeenCalledWith('u1', UserRole.ADMIN),
    )
  })
})
