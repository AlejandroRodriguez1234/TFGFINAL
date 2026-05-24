import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

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
    register: vi.fn().mockRejectedValue({ message: 'Network Error' }),
  },
}))

import RegisterPage from '../../pages/Auth/RegisterPage'
import toast from 'react-hot-toast'

function renderRegister() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  )
}

async function fillStep1(firstName = 'Ana', lastName = 'García', username = 'ana_garcia', email = 'ana@test.com') {
  await userEvent.type(screen.getByPlaceholderText('Ana'), firstName)
  await userEvent.type(screen.getByPlaceholderText('García'), lastName)
  await userEvent.type(screen.getByPlaceholderText('ana_garcia'), username)
  await userEvent.type(screen.getByPlaceholderText('ana@email.com'), email)
}

afterEach(() => vi.clearAllMocks())

describe('RegisterPage — step 1 renders', () => {
  it('shows first name, last name, username and email fields', () => {
    renderRegister()
    expect(screen.getByPlaceholderText('Ana')).toBeTruthy()
    expect(screen.getByPlaceholderText('García')).toBeTruthy()
    expect(screen.getByPlaceholderText('ana_garcia')).toBeTruthy()
    expect(screen.getByPlaceholderText('ana@email.com')).toBeTruthy()
  })

  it('shows step indicator 1/2', () => {
    renderRegister()
    expect(screen.getByText('1/2')).toBeTruthy()
  })

  it('shows "Siguiente" button on step 1', () => {
    renderRegister()
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeTruthy()
  })

  it('shows link to login page', () => {
    const { container } = renderRegister()
    expect(container.querySelector('a[href="/login"]')).not.toBeNull()
  })
})

describe('RegisterPage — step 1 validation', () => {
  it('shows error for firstName shorter than 2 chars', async () => {
    renderRegister()
    await userEvent.type(screen.getByPlaceholderText('Ana'), 'A')
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => expect(screen.getAllByText('Mínimo 2 caracteres').length).toBeGreaterThan(0))
  })

  it('shows error for username shorter than 3 chars', async () => {
    renderRegister()
    await userEvent.type(screen.getByPlaceholderText('Ana'), 'Ana')
    await userEvent.type(screen.getByPlaceholderText('García'), 'García')
    await userEvent.type(screen.getByPlaceholderText('ana_garcia'), 'ab')
    await userEvent.type(screen.getByPlaceholderText('ana@email.com'), 'ana@test.com')
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => expect(screen.getByText('Mínimo 3 caracteres')).toBeTruthy())
  })

  it('shows error for username with invalid chars', async () => {
    renderRegister()
    await userEvent.type(screen.getByPlaceholderText('Ana'), 'Ana')
    await userEvent.type(screen.getByPlaceholderText('García'), 'García')
    await userEvent.type(screen.getByPlaceholderText('ana_garcia'), 'Ana García')
    await userEvent.type(screen.getByPlaceholderText('ana@email.com'), 'ana@test.com')
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => expect(screen.getByText('Solo letras, números y _')).toBeTruthy())
  })

  it('shows error for invalid email', async () => {
    renderRegister()
    await userEvent.type(screen.getByPlaceholderText('Ana'), 'Ana')
    await userEvent.type(screen.getByPlaceholderText('García'), 'García')
    await userEvent.type(screen.getByPlaceholderText('ana_garcia'), 'ana_garcia')
    await userEvent.type(screen.getByPlaceholderText('ana@email.com'), 'notanemail')
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => expect(screen.getByText('Email inválido')).toBeTruthy())
  })
})

describe('RegisterPage — step 2', () => {
  it('advances to step 2 with valid step 1 data', async () => {
    renderRegister()
    await fillStep1()
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => expect(screen.getByText('2/2')).toBeTruthy())
  })

  it('shows password and confirm fields on step 2', async () => {
    renderRegister()
    await fillStep1()
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText('••••••••')
      expect(inputs.length).toBe(2)
    })
  })

  it('shows "Crear cuenta" submit button on step 2', async () => {
    renderRegister()
    await fillStep1()
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeTruthy())
  })

  it('"Atrás" button returns to step 1', async () => {
    renderRegister()
    await fillStep1()
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => screen.getByText('2/2'))
    await userEvent.click(screen.getByRole('button', { name: /atrás/i }))
    await waitFor(() => expect(screen.getByText('1/2')).toBeTruthy())
  })
})

describe('RegisterPage — step 2 validation', () => {
  async function goToStep2() {
    renderRegister()
    await fillStep1()
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => screen.getByText('2/2'))
  }

  it('shows error for password shorter than 8 chars', async () => {
    await goToStep2()
    const [passInput] = screen.getAllByPlaceholderText('••••••••')
    await userEvent.type(passInput, 'Short1')
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }).closest('form')!)
    // "Mínimo 8 caracteres" appears in both PasswordStrength checklist and validation error
    await waitFor(() => expect(screen.getAllByText('Mínimo 8 caracteres').length).toBeGreaterThanOrEqual(2))
  })

  it('shows error when passwords do not match', async () => {
    await goToStep2()
    const [passInput, confirmInput] = screen.getAllByPlaceholderText('••••••••')
    await userEvent.type(passInput, 'Password1')
    await userEvent.type(confirmInput, 'Different1')
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }).closest('form')!)
    await waitFor(() => expect(screen.getByText('Las contraseñas no coinciden')).toBeTruthy())
  })
})

describe('RegisterPage — password strength', () => {
  async function goToStep2() {
    renderRegister()
    await fillStep1()
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => screen.getByText('2/2'))
  }

  it('shows "Muy débil" for password with only length check passing', async () => {
    await goToStep2()
    const [passInput] = screen.getAllByPlaceholderText('••••••••')
    await userEvent.type(passInput, 'abcdefgh') // length >= 8 only → score 1 → Muy débil
    await waitFor(() => expect(screen.getByText('Muy débil')).toBeTruthy())
  })

  it('shows "Fuerte" for strong password', async () => {
    await goToStep2()
    const [passInput] = screen.getAllByPlaceholderText('••••••••')
    await userEvent.type(passInput, 'StrongPass1!')
    await waitFor(() => expect(screen.getByText('Fuerte')).toBeTruthy())
  })

  it('strength checks reflect password content', async () => {
    await goToStep2()
    const [passInput] = screen.getAllByPlaceholderText('••••••••')
    await userEvent.type(passInput, 'longpassword1')
    await waitFor(() => expect(screen.getByText('Una mayúscula')).toBeTruthy())
  })
})

describe('RegisterPage — demo registration flow', () => {
  it('navigates to /dashboard after successful demo registration', async () => {
    renderRegister()
    await fillStep1('John', 'Doe', 'john_doe', 'john@test.com')
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => screen.getByText('2/2'))
    const [passInput, confirmInput] = screen.getAllByPlaceholderText('••••••••')
    await userEvent.type(passInput, 'Password123')
    await userEvent.type(confirmInput, 'Password123')
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }).closest('form')!)
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('shows success toast after demo registration', async () => {
    renderRegister()
    await fillStep1('Jane', 'Doe', 'jane_doe', 'jane@test.com')
    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await waitFor(() => screen.getByText('2/2'))
    const [passInput, confirmInput] = screen.getAllByPlaceholderText('••••••••')
    await userEvent.type(passInput, 'Password123')
    await userEvent.type(confirmInput, 'Password123')
    fireEvent.submit(screen.getByRole('button', { name: /crear cuenta/i }).closest('form')!)
    await waitFor(() => expect(toast.success).toHaveBeenCalled())
  })
})
