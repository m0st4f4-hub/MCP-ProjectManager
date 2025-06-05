'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function LogoutPage() {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    logout()
    router.push('/login')
  }, [logout, router])

  return null
}
