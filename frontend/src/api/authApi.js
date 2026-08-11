import axios from 'axios'
import { API_BASE_URL } from '../utils/constants.js'
import { api } from './axios.js'

export const authApi = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),

  login: (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email) // backend's OAuth2PasswordRequestForm expects `username`, even though it's an email
    form.append('password', password)

    // deliberately NOT using the shared `api` instance - its default
    // Content-Type is application/json, and relying on a per-call header
    // override to fight that default is fragile. A separate axios call
    // for this one endpoint avoids depending on header-merge behavior.
    return axios
      .post(`${API_BASE_URL}/auth/login`, form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then((r) => r.data)
  },

  me: () => api.get('/auth/me').then((r) => r.data),
}