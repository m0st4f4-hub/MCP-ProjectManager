import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, waitFor } from '@/__tests__/utils/test-utils'
import { useAuthStore } from '@/store/authStore'
import LogoutPage from '@/app/logout/page'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

describe('LogoutPage', () => {
  beforeEach(() => {
    pushMock.mockReset()
    useAuthStore.setState({
      token: 'abc',
      logout: useAuthStore.getState().logout,
    } as any)
    localStorage.setItem('token', 'abc')
  })

  it('clears token and redirects to login', async () => {
    render(<LogoutPage />)

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/login'))
    expect(localStorage.getItem('token')).toBeNull()
    expect(useAuthStore.getState().token).toBeNull()
  })
})
