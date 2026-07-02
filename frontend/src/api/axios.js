import axios from 'axios'
import { API_BASE_URL } from '../utils/constants.js'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API error]', err?.response?.status, err?.message)
    return Promise.reject(err)
  }
)
