import { authApi } from './api'
import type { User, AuthTokens } from '@/types'

export interface LoginDto {
  email: string
  password: string
  totpCode?: string
}

export interface RegisterDto {
  email: string
  username: string
  firstName: string
  lastName: string
  password: string
}

export const authService = {
  login: (dto: LoginDto) =>
    authApi.post<{ data: { user: User; tokens: AuthTokens } }>('/login', dto),

  register: (dto: RegisterDto) =>
    authApi.post<{ data: { user: User; tokens: AuthTokens } }>('/register', dto),

  logout: (refreshToken: string) =>
    authApi.post('/logout', { refreshToken }),

  me: () =>
    authApi.get<{ data: User }>('/me'),

  setup2fa: () =>
    authApi.post<{ data: { secret: string; qrCode: string } }>('/2fa/setup'),

  verify2fa: (code: string) =>
    authApi.post('/2fa/verify', { code }),

  disable2fa: (code: string) =>
    authApi.post('/2fa/disable', { code }),

  forgotPassword: (email: string) =>
    authApi.post('/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    authApi.post('/reset-password', { token, password }),
}
