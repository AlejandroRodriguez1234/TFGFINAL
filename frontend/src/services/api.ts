import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@store/authStore'

function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({ baseURL, timeout: 15000 })

  client.interceptors.request.use((config) => {
    const { tokens } = useAuthStore.getState()
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`
    }
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config as AxiosRequestConfig & { _retry?: boolean }
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true
        const { tokens, updateTokens, logout } = useAuthStore.getState()
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_AUTH_URL || '/auth'}/refresh`, {
            refreshToken: tokens?.refreshToken,
          })
          updateTokens(data.data)
          return client(original)
        } catch {
          logout()
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    },
  )

  return client
}

export const authApi  = createClient(import.meta.env.VITE_AUTH_URL  || '/auth')
export const apiClient = createClient(import.meta.env.VITE_API_URL   || '/api')
export const dietApi  = createClient(import.meta.env.VITE_DIET_URL  || '/diet')
export const aiApi    = createClient(import.meta.env.VITE_AI_URL    || '/ai')
