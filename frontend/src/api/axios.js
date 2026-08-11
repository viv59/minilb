import axios from 'axios'
import { API_BASE_URL } from '../utils/constants.js'
import { useAuthStore } from '../store/authStore.js'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API error]', error?.response?.status, error?.message)

    // token is expired/invalid - every subsequent authenticated call would
    // keep failing the same way, so log out immediately rather than
    // leaving the UI in a broken half-logged-in state
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }

    return Promise.reject(error)
  }
)