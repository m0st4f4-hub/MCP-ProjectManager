import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const COOKIE_OPTIONS = 'path=/; secure; samesite=strict';

const setCookie = (token: string) => {
  document.cookie = `token=${token}; ${COOKIE_OPTIONS}`;
};

const clearCookie = () => {
  document.cookie = `token=; ${COOKIE_OPTIONS}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          setCookie(token);
        }
        set({ token });
      },
      clearToken: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          clearCookie();
        }
        set({ token: null });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          clearCookie();
        }
        set({ token: null });
      },
    }),
    { name: 'auth' }
  )
);
