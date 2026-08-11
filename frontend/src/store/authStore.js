import { create } from 'zustand'
import { authApi } from '../api/authApi.js'

export const useAuthStore = create((set, get) => ({
  token: null,   // in-memory only - intentionally not persisted, lost on page refresh
  user: null,    // { id, name, email, role }
  loading: false,
  error: null,

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
      return await get().login(email, password) // auto-login after successful signup
    } catch (err) {
      set({
        error: err.response?.data?.detail ?? 'Registration failed',
        loading: false,
      })
      throw err
    }
  },

  logout: () => set({ token: null, user: null, error: null }),

  isAdmin: () => get().user?.role === 'admin',
  isAuthenticated: () => Boolean(get().token),
}))