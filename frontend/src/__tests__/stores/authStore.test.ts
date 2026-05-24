import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@store/authStore'

const MOCK_USER = {
  id: 'user-1',
  email: 'test@fitforge.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: 'CLIENT' as const,
  level: 5,
  xp: 1200,
  streakDays: 7,
  createdAt: '2024-01-01T00:00:00Z',
}

const MOCK_TOKENS = {
  accessToken: 'access.token.here',
  refreshToken: 'refresh.token.here',
  expiresIn: 3600,
}

beforeEach(() => {
  useAuthStore.setState({ user: null, tokens: null, isAuthenticated: false, isLoading: false })
})

describe('authStore — setAuth', () => {
  it('sets user, tokens and isAuthenticated', () => {
    useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKENS)
    const state = useAuthStore.getState()
    expect(state.user).toEqual(MOCK_USER)
    expect(state.tokens).toEqual(MOCK_TOKENS)
    expect(state.isAuthenticated).toBe(true)
  })
})

describe('authStore — setUser', () => {
  it('updates user fields', () => {
    useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKENS)
    useAuthStore.getState().setUser({ ...MOCK_USER, firstName: 'Alex', level: 6 })
    expect(useAuthStore.getState().user?.firstName).toBe('Alex')
    expect(useAuthStore.getState().user?.level).toBe(6)
  })

  it('does not change tokens', () => {
    useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKENS)
    useAuthStore.getState().setUser({ ...MOCK_USER, firstName: 'Alex' })
    expect(useAuthStore.getState().tokens).toEqual(MOCK_TOKENS)
  })
})

describe('authStore — updateTokens', () => {
  it('replaces tokens', () => {
    useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKENS)
    const newTokens = { accessToken: 'new.access', refreshToken: 'new.refresh', expiresIn: 7200 }
    useAuthStore.getState().updateTokens(newTokens)
    expect(useAuthStore.getState().tokens).toEqual(newTokens)
  })

  it('does not change user', () => {
    useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKENS)
    useAuthStore.getState().updateTokens({ accessToken: 'x', refreshToken: 'y', expiresIn: 3600 })
    expect(useAuthStore.getState().user).toEqual(MOCK_USER)
  })
})

describe('authStore — logout', () => {
  it('clears user, tokens and isAuthenticated', () => {
    useAuthStore.getState().setAuth(MOCK_USER, MOCK_TOKENS)
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.tokens).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})

describe('authStore — setLoading', () => {
  it('sets isLoading to true', () => {
    useAuthStore.getState().setLoading(true)
    expect(useAuthStore.getState().isLoading).toBe(true)
  })

  it('sets isLoading to false', () => {
    useAuthStore.getState().setLoading(true)
    useAuthStore.getState().setLoading(false)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})

describe('authStore — initial state', () => {
  it('starts unauthenticated', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.tokens).toBeNull()
    expect(state.isLoading).toBe(false)
  })
})
