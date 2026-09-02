import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../api/authApi.js'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      error: null,
      initializing: true, // true until a persisted token has been checked against the backend

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const { access_token } = await authApi.login(email, password)
          set({ token: access_token })

          const user = await authApi.me()
          set({ user, loading: false })
          return user
        } catch (err) {
          set({
            error: err.response?.data?.detail ?? 'Login failed',
            loading: false,
            token: null,
            user: null,
          })
          throw err
        }
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null })
        try {
          await authApi.register({ name, email, password })
          return await get().login(email, password)
        } catch (err) {
          set({
            error: err.response?.data?.detail ?? 'Registration failed',
            loading: false,
          })
          throw err
        }
      },

      logout: () => set({ token: null, user: null, error: null }),

      // called once on app startup. A persisted token alone proves
      // nothing - it could be expired or the account deactivated since -
      // so this confirms it against /auth/me before trusting the session.
      initialize: async () => {
        const token = get().token
        if (!token) {
          set({ initializing: false })
          return
        }
        try {
          const user = await authApi.me()
          set({ user, initializing: false })
        } catch {
          set({ token: null, user: null, initializing: false })
        }
      },

      isAdmin: () => get().user?.role === 'admin',
      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }), // only the token is persisted - user is always re-fetched fresh
    }
  )
)