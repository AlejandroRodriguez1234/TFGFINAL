import { describe, it, expect } from 'vitest'
import { tryDemoLogin, tryDemoRegister, socialDemoLogin } from '../../services/demoAuth'

describe('tryDemoLogin — valid credentials', () => {
  it('returns user for admin@fitforge.app / admin123', () => {
    const result = tryDemoLogin('admin@fitforge.app', 'admin123')
    expect(result).not.toBeNull()
    expect(result!.user.role).toBe('ADMIN')
    expect(result!.user.email).toBe('admin@fitforge.app')
  })

  it('returns user for demo@fitforge.app / demo123', () => {
    const result = tryDemoLogin('demo@fitforge.app', 'demo123')
    expect(result).not.toBeNull()
    expect(result!.user.role).toBe('CLIENT')
  })

  it('returns user for trainer@fitforge.app / trainer123', () => {
    const result = tryDemoLogin('trainer@fitforge.app', 'trainer123')
    expect(result).not.toBeNull()
    expect(result!.user.role).toBe('TRAINER')
  })

  it('email match is case-insensitive', () => {
    const result = tryDemoLogin('ADMIN@FITFORGE.APP', 'admin123')
    expect(result).not.toBeNull()
    expect(result!.user.role).toBe('ADMIN')
  })
})

describe('tryDemoLogin — invalid credentials', () => {
  it('returns null for unknown email', () => {
    expect(tryDemoLogin('unknown@test.com', 'admin123')).toBeNull()
  })

  it('returns null for wrong password', () => {
    expect(tryDemoLogin('admin@fitforge.app', 'wrongpass')).toBeNull()
  })

  it('returns null for empty credentials', () => {
    expect(tryDemoLogin('', '')).toBeNull()
  })

  it('does not accept partial password match', () => {
    expect(tryDemoLogin('admin@fitforge.app', 'admin')).toBeNull()
  })
})

describe('tryDemoLogin — token shape', () => {
  it('returns accessToken and refreshToken', () => {
    const result = tryDemoLogin('demo@fitforge.app', 'demo123')
    expect(result!.tokens.accessToken).toBeTruthy()
    expect(result!.tokens.refreshToken).toBeTruthy()
    expect(result!.tokens.expiresIn).toBeGreaterThan(0)
  })
})

describe('tryDemoRegister', () => {
  it('creates a CLIENT user with the provided data', () => {
    const result = tryDemoRegister('new@test.com', 'newuser', 'John', 'Doe')
    expect(result.user.email).toBe('new@test.com')
    expect(result.user.username).toBe('newuser')
    expect(result.user.firstName).toBe('John')
    expect(result.user.lastName).toBe('Doe')
    expect(result.user.role).toBe('CLIENT')
  })

  it('starts at level 1 with 0 XP', () => {
    const result = tryDemoRegister('a@b.com', 'abc', 'A', 'B')
    expect(result.user.level).toBe(1)
    expect(result.user.xp).toBe(0)
    expect(result.user.streakDays).toBe(0)
  })

  it('generates a unique id each time', () => {
    const r1 = tryDemoRegister('a@a.com', 'u1', 'A', 'B')
    const r2 = tryDemoRegister('b@b.com', 'u2', 'C', 'D')
    expect(r1.user.id).not.toBe(r2.user.id)
  })

  it('returns tokens with accessToken containing the username', () => {
    const result = tryDemoRegister('x@x.com', 'myuser', 'X', 'Y')
    expect(result.tokens.accessToken).toContain('myuser')
    expect(result.tokens.refreshToken).toContain('myuser')
  })
})

describe('socialDemoLogin', () => {
  it('returns Google user', () => {
    const result = socialDemoLogin('Google')
    expect(result).not.toBeNull()
    expect(result!.user.email).toContain('gmail')
  })

  it('returns GitHub user', () => {
    const result = socialDemoLogin('GitHub')
    expect(result).not.toBeNull()
    expect(result!.user.email).toContain('github')
  })

  it('returns null for unknown provider', () => {
    expect(socialDemoLogin('Facebook')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(socialDemoLogin('')).toBeNull()
  })

  it('Google and GitHub users have different ids', () => {
    const google = socialDemoLogin('Google')
    const github = socialDemoLogin('GitHub')
    expect(google!.user.id).not.toBe(github!.user.id)
  })
})
