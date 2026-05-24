import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import i18n from '../../i18n/config'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn().mockRejectedValue({ message: 'Network Error' }),
  },
}))

import LoginPage from '../../pages/Auth/LoginPage'
import toast from 'react-hot-toast'

beforeAll(async () => {
  if (!i18n.isInitialized) {
    await new Promise<void>((resolve) => { i18n.on('initialized', resolve) })
  }
  i18n.changeLanguage('es')
})

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('LoginPage — renders', () => {
  it('shows email and password fields', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('tu@email.com')).toBeTruthy()
    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy()
  })

  it('shows the submit button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /iniciar sesión|iniciar session|login/i })).toBeTruthy()
  })

  it('shows link to register page', () => {
    const { container } = renderLogin()
    const link = container.querySelector('a[href="/register"]')
    expect(link).not.toBeNull()
  })

  it('shows forgot password link', () => {
    const { container } = renderLogin()
    const link = container.querySelector('a[href="/forgot-password"]')
    expect(link).not.toBeNull()
  })

  it('shows Google and GitHub social buttons', () => {
    renderLogin()
    expect(screen.getByText('Google')).toBeTruthy()
    expect(screen.getByText('GitHub')).toBeTruthy()
  })
})

describe('LoginPage — form validation', () => {
  it('shows error for invalid email format', async () => {
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'notanemail')
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión|iniciar session|login/i }).closest('form')!)
    await waitFor(() => expect(screen.getByText('Email inválido')).toBeTruthy())
  })

  it('shows error for password shorter than 6 characters', async () => {
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), '123')
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión|iniciar session|login/i }).closest('form')!)
    await waitFor(() => expect(screen.getByText('Mínimo 6 caracteres')).toBeTruthy())
  })

  it('does not show errors when fields are empty and untouched', () => {
    renderLogin()
    expect(screen.queryByText('Email inválido')).toBeNull()
    expect(screen.queryByText('Mínimo 6 caracteres')).toBeNull()
  })
})

describe('LoginPage — demo login', () => {
  it('navigates to /dashboard with demo admin credentials', async () => {
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'admin@fitforge.app')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'admin123')
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión|iniciar session|login/i }).closest('form')!)
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('navigates to /dashboard with demo user credentials', async () => {
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'demo@fitforge.app')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'demo123')
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión|iniciar session|login/i }).closest('form')!)
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('navigates to /dashboard with demo trainer credentials', async () => {
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'trainer@fitforge.app')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'trainer123')
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión|iniciar session|login/i }).closest('form')!)
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('shows error toast for wrong credentials', async () => {
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'wrong@test.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión|iniciar session|login/i }).closest('form')!)
    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('LoginPage — password visibility toggle', () => {
  it('toggles password field type between password and text', async () => {
    renderLogin()
    const input = screen.getByPlaceholderText('••••••••') as HTMLInputElement
    expect(input.type).toBe('password')
    const toggleBtn = input.parentElement!.querySelector('button')!
    await userEvent.click(toggleBtn)
    expect(input.type).toBe('text')
    await userEvent.click(toggleBtn)
    expect(input.type).toBe('password')
  })
})
