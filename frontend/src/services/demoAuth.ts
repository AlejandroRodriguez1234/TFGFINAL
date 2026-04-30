import type { User, AuthTokens } from '@/types'

const DEMO_USERS: Array<{ email: string; password: string; user: User; tokens: AuthTokens }> = [
  {
    email: 'admin@fitforge.app',
    password: 'admin123',
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@fitforge.app',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'FitForge',
      role: 'ADMIN',
      level: 10,
      xp: 9500,
      streakDays: 30,
      createdAt: new Date().toISOString(),
    },
    tokens: {
      accessToken: 'demo-token-admin',
      refreshToken: 'demo-refresh-admin',
      expiresIn: 86400000,
    },
  },
  {
    email: 'demo@fitforge.app',
    password: 'demo123',
    user: {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'demo@fitforge.app',
      username: 'demo_user',
      firstName: 'Usuario',
      lastName: 'Demo',
      role: 'CLIENT',
      level: 5,
      xp: 3200,
      streakDays: 7,
      createdAt: new Date().toISOString(),
    },
    tokens: {
      accessToken: 'demo-token-user',
      refreshToken: 'demo-refresh-user',
      expiresIn: 86400000,
    },
  },
]

const SOCIAL_DEMO_USERS: Record<string, { user: User; tokens: AuthTokens }> = {
  Google: {
    user: {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'google.user@gmail.com',
      username: 'google_user',
      firstName: 'Alex',
      lastName: 'Google',
      role: 'CLIENT',
      level: 3,
      xp: 1800,
      streakDays: 5,
      createdAt: new Date().toISOString(),
    },
    tokens: {
      accessToken: 'demo-token-google',
      refreshToken: 'demo-refresh-google',
      expiresIn: 86400000,
    },
  },
  GitHub: {
    user: {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'github.user@github.com',
      username: 'github_user',
      firstName: 'Alex',
      lastName: 'GitHub',
      role: 'CLIENT',
      level: 4,
      xp: 2500,
      streakDays: 12,
      createdAt: new Date().toISOString(),
    },
    tokens: {
      accessToken: 'demo-token-github',
      refreshToken: 'demo-refresh-github',
      expiresIn: 86400000,
    },
  },
}

export function tryDemoLogin(email: string, password: string) {
  return DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  ) ?? null
}

export function socialDemoLogin(provider: string) {
  return SOCIAL_DEMO_USERS[provider] ?? null
}

export function tryDemoRegister(email: string, username: string, firstName: string, lastName: string) {
  const user: User = {
    id: crypto.randomUUID(),
    email,
    username,
    firstName,
    lastName,
    role: 'CLIENT',
    level: 1,
    xp: 0,
    streakDays: 0,
    createdAt: new Date().toISOString(),
  }
  const tokens: AuthTokens = {
    accessToken: 'demo-token-' + username,
    refreshToken: 'demo-refresh-' + username,
    expiresIn: 86400000,
  }
  return { user, tokens }
}
