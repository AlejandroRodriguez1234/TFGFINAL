/**
 * Verifies that every main app page renders the correct language when ES/EN is set,
 * and that switching languages updates the displayed text.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import i18n from '../../i18n/config'

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: any) => <div {...p}>{children}</div>,
    button: ({ children, ...p }: any) => <button {...p}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('recharts', () => ({
  AreaChart: ({ children }: any) => <svg>{children}</svg>,
  Area: () => null,
  BarChart: ({ children }: any) => <svg>{children}</svg>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: ({ children }: any) => <svg>{children}</svg>,
  Line: () => null,
  RadarChart: ({ children }: any) => <svg>{children}</svg>,
  Radar: () => null,
  PolarGrid: () => null,
  PolarAngleAxis: () => null,
  PieChart: ({ children }: any) => <svg>{children}</svg>,
  Pie: () => null,
  Cell: () => null,
  Legend: () => null,
  RadialBarChart: ({ children }: any) => <svg>{children}</svg>,
  RadialBar: () => null,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

// Stub Zustand stores so pages don't crash without a real store
vi.mock('@store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', firstName: 'Test', lastName: 'User', email: 't@t.com', role: 'CLIENT', level: 1, xp: 0, streakDays: 0, username: 'test' },
    tokens: null,
    logout: vi.fn(),
    setUser: vi.fn(),
    setTokens: vi.fn(),
  }),
}))

vi.mock('@store/appStore', () => ({
  useAppStore: () => ({
    sidebarOpen: false,
    toggleSidebar: vi.fn(),
    unreadCount: 0,
    markAllRead: vi.fn(),
  }),
}))

vi.mock('@store/dailyStore', () => ({
  useDailyStore: () => ({
    today: { calories: 0, water: 0, meals: [], caloriesTarget: 2000, waterTarget: 2000, protein: 0, carbs: 0, fat: 0, proteinTarget: 150, carbsTarget: 250, fatTarget: 65 },
    weekHistory: Array.from({ length: 7 }, (_, i) => ({ date: String(i), calories: 0, caloriesTarget: 2000 })),
    setCalories: vi.fn(),
    setWater: vi.fn(),
    resetIfNewDay: vi.fn(),
  }),
}))

vi.mock('@store/habitsStore', () => ({
  useHabitsStore: () => ({
    habits: [],
    addHabit: vi.fn(),
    toggleHabit: vi.fn(),
    deleteHabit: vi.fn(),
    resetIfNewDay: vi.fn(),
  }),
}))

vi.mock('@services/api', () => {
  const stub = {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    put: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
  }
  return { apiClient: stub, dietApi: stub, gymApi: stub }
})

vi.mock('@services/n8nApi', () => ({
  n8nApi: { analyzeFood: vi.fn().mockResolvedValue({ items: [] }) },
}))

// Lazy import pages after mocks are registered
import DashboardPage from '../../pages/Dashboard/DashboardPage'
import GymPage from '../../pages/Gym/GymPage'
import DietPage from '../../pages/Diet/DietPage'
import HabitsPage from '../../pages/Habits/HabitsPage'
import SocialPage from '../../pages/Social/SocialPage'
import ProgressPage from '../../pages/Progress/ProgressPage'
import ProfilePage from '../../pages/Profile/ProfilePage'
import TrainerPage from '../../pages/Trainer/TrainerPage'
import AdminPage from '../../pages/Admin/AdminPage'

function wrap(component: React.ReactElement) {
  return render(<MemoryRouter>{component}</MemoryRouter>)
}

beforeAll(async () => {
  if (!i18n.isInitialized) {
    await new Promise<void>((resolve) => { i18n.on('initialized', resolve) })
  }
})

// ── Dashboard ─────────────────────────────────────────────────────────────────
describe('DashboardPage — i18n', () => {
  it('shows greeting in ES', () => {
    i18n.changeLanguage('es')
    wrap(<DashboardPage />)
    const greet = screen.queryAllByText(/Buenos días|Buenas tardes|Buenas noches/i)
    expect(greet.length).toBeGreaterThan(0)
  })

  it('shows greeting in EN', () => {
    i18n.changeLanguage('en')
    wrap(<DashboardPage />)
    const greet = screen.queryAllByText(/Good morning|Good afternoon|Good evening/i)
    expect(greet.length).toBeGreaterThan(0)
  })

  it('greeting differs between ES and EN', () => {
    i18n.changeLanguage('es')
    const { unmount } = wrap(<DashboardPage />)
    const esGreet = screen.queryAllByText(/Buenos días|Buenas tardes|Buenas noches/i).length
    unmount()
    i18n.changeLanguage('en')
    wrap(<DashboardPage />)
    const enGreet = screen.queryAllByText(/Good morning|Good afternoon|Good evening/i).length
    expect(esGreet).toBeGreaterThan(0)
    expect(enGreet).toBeGreaterThan(0)
  })
})

// ── Gym ───────────────────────────────────────────────────────────────────────
describe('GymPage — i18n', () => {
  it('renders title in ES', () => {
    i18n.changeLanguage('es')
    wrap(<GymPage />)
    expect(screen.queryAllByText(/Gimnasio|Gym/i).length).toBeGreaterThan(0)
  })

  it('renders title in EN', () => {
    i18n.changeLanguage('en')
    wrap(<GymPage />)
    expect(screen.queryAllByText(/Gym/i).length).toBeGreaterThan(0)
  })

  it('shows tab labels in ES', () => {
    i18n.changeLanguage('es')
    wrap(<GymPage />)
    expect(screen.queryAllByText(/Rutinas|Ejercicios/i).length).toBeGreaterThan(0)
  })

  it('shows tab labels in EN', () => {
    i18n.changeLanguage('en')
    wrap(<GymPage />)
    expect(screen.queryAllByText(/Routines|Exercises/i).length).toBeGreaterThan(0)
  })

  it('tab text differs between ES and EN', () => {
    i18n.changeLanguage('es')
    const { unmount } = wrap(<GymPage />)
    const esText = screen.queryAllByText(/Rutinas/i).length
    unmount()
    i18n.changeLanguage('en')
    wrap(<GymPage />)
    const enText = screen.queryAllByText(/Routines/i).length
    expect(esText).toBeGreaterThan(0)
    expect(enText).toBeGreaterThan(0)
  })
})

// ── Diet ──────────────────────────────────────────────────────────────────────
describe('DietPage — i18n', () => {
  it('renders title in ES', () => {
    i18n.changeLanguage('es')
    wrap(<DietPage />)
    expect(screen.queryAllByText(/Nutrición|Dieta/i).length).toBeGreaterThan(0)
  })

  it('renders title in EN', () => {
    i18n.changeLanguage('en')
    wrap(<DietPage />)
    expect(screen.queryAllByText(/Nutrition/i).length).toBeGreaterThan(0)
  })

  it('shows Calories label in ES', () => {
    i18n.changeLanguage('es')
    wrap(<DietPage />)
    expect(screen.queryAllByText(/Calorías|Kcal/i).length).toBeGreaterThan(0)
  })

  it('shows Calories label in EN', () => {
    i18n.changeLanguage('en')
    wrap(<DietPage />)
    expect(screen.queryAllByText(/Calories|kcal/i).length).toBeGreaterThan(0)
  })
})

// ── Habits ────────────────────────────────────────────────────────────────────
describe('HabitsPage — i18n', () => {
  it('renders title in ES', () => {
    i18n.changeLanguage('es')
    wrap(<HabitsPage />)
    expect(screen.getAllByText('Hábitos').length).toBeGreaterThan(0)
  })

  it('renders title in EN', () => {
    i18n.changeLanguage('en')
    wrap(<HabitsPage />)
    expect(screen.getAllByText('Habits').length).toBeGreaterThan(0)
  })

  it('title differs between ES and EN', () => {
    i18n.changeLanguage('es')
    const { unmount } = wrap(<HabitsPage />)
    const esEl = screen.queryAllByText('Hábitos')
    unmount()
    i18n.changeLanguage('en')
    wrap(<HabitsPage />)
    const enEl = screen.queryAllByText('Habits')
    expect(esEl.length).toBeGreaterThan(0)
    expect(enEl.length).toBeGreaterThan(0)
  })

  it('add habit button in ES', () => {
    i18n.changeLanguage('es')
    wrap(<HabitsPage />)
    expect(screen.queryAllByText(/Nuevo hábito|Añadir/i).length).toBeGreaterThan(0)
  })

  it('add habit button in EN', () => {
    i18n.changeLanguage('en')
    wrap(<HabitsPage />)
    expect(screen.queryAllByText(/New habit|Add/i).length).toBeGreaterThan(0)
  })
})

// ── Social ────────────────────────────────────────────────────────────────────
describe('SocialPage — i18n', () => {
  it('renders title in ES', () => {
    i18n.changeLanguage('es')
    wrap(<SocialPage />)
    expect(screen.getAllByText('Social').length).toBeGreaterThan(0)
  })

  it('renders title in EN', () => {
    i18n.changeLanguage('en')
    wrap(<SocialPage />)
    expect(screen.getAllByText('Social').length).toBeGreaterThan(0)
  })

  it('shows tab labels in ES', () => {
    i18n.changeLanguage('es')
    wrap(<SocialPage />)
    expect(screen.queryAllByText(/Feed|Retos|Clasificación/i).length).toBeGreaterThan(0)
  })

  it('shows tab labels in EN', () => {
    i18n.changeLanguage('en')
    wrap(<SocialPage />)
    expect(screen.queryAllByText(/Feed|Challenges|Leaderboard/i).length).toBeGreaterThan(0)
  })
})

// ── Progress ──────────────────────────────────────────────────────────────────
describe('ProgressPage — i18n', () => {
  it('renders title in ES', () => {
    i18n.changeLanguage('es')
    wrap(<ProgressPage />)
    expect(screen.queryAllByText(/Progreso/i).length).toBeGreaterThan(0)
  })

  it('renders title in EN', () => {
    i18n.changeLanguage('en')
    wrap(<ProgressPage />)
    expect(screen.queryAllByText(/Progress/i).length).toBeGreaterThan(0)
  })

  it('shows calculator tab in ES', () => {
    i18n.changeLanguage('es')
    wrap(<ProgressPage />)
    expect(screen.queryAllByText(/Calculadora/i).length).toBeGreaterThan(0)
  })

  it('shows calculator tab in EN', () => {
    i18n.changeLanguage('en')
    wrap(<ProgressPage />)
    expect(screen.queryAllByText(/Calculator/i).length).toBeGreaterThan(0)
  })
})

// ── Profile ───────────────────────────────────────────────────────────────────
describe('ProfilePage — i18n', () => {
  it('shows edit profile in ES', () => {
    i18n.changeLanguage('es')
    wrap(<ProfilePage />)
    expect(screen.queryAllByText(/Editar perfil/i).length).toBeGreaterThan(0)
  })

  it('shows edit profile in EN', () => {
    i18n.changeLanguage('en')
    wrap(<ProfilePage />)
    expect(screen.queryAllByText(/Edit profile/i).length).toBeGreaterThan(0)
  })

  it('profile text differs between ES and EN', () => {
    i18n.changeLanguage('es')
    const { unmount } = wrap(<ProfilePage />)
    const es = screen.queryAllByText('Editar perfil').length
    unmount()
    i18n.changeLanguage('en')
    wrap(<ProfilePage />)
    const en = screen.queryAllByText('Edit profile').length
    expect(es).toBeGreaterThan(0)
    expect(en).toBeGreaterThan(0)
  })
})

// ── Trainer ───────────────────────────────────────────────────────────────────
describe('TrainerPage — i18n', () => {
  it('renders Spanish panel title in ES', () => {
    i18n.changeLanguage('es')
    wrap(<TrainerPage />)
    expect(screen.getByText('Panel de Entrenador')).toBeTruthy()
  })

  it('renders English panel title in EN', () => {
    i18n.changeLanguage('en')
    wrap(<TrainerPage />)
    expect(screen.getByText('Trainer Dashboard')).toBeTruthy()
  })

  it('shows Spanish tabs in ES', () => {
    i18n.changeLanguage('es')
    wrap(<TrainerPage />)
    expect(screen.getByText('Resumen')).toBeTruthy()
    expect(screen.getByText('Clientes')).toBeTruthy()
    expect(screen.getByText('Planes')).toBeTruthy()
    expect(screen.getByText('Sesiones')).toBeTruthy()
  })

  it('shows English tabs in EN', () => {
    i18n.changeLanguage('en')
    wrap(<TrainerPage />)
    expect(screen.getByText('Overview')).toBeTruthy()
    expect(screen.getByText('Clients')).toBeTruthy()
    expect(screen.getByText('Plans')).toBeTruthy()
    expect(screen.getByText('Sessions')).toBeTruthy()
  })

  it('add client button differs between ES and EN', () => {
    i18n.changeLanguage('es')
    const { unmount } = wrap(<TrainerPage />)
    expect(screen.getByText('Añadir cliente')).toBeTruthy()
    unmount()
    i18n.changeLanguage('en')
    wrap(<TrainerPage />)
    expect(screen.getByText('Add client')).toBeTruthy()
  })
})

// ── Admin ─────────────────────────────────────────────────────────────────────
describe('AdminPage — i18n', () => {
  it('renders Spanish panel title in ES', () => {
    i18n.changeLanguage('es')
    wrap(<AdminPage />)
    expect(screen.getByText('Panel de administración')).toBeTruthy()
  })

  it('renders English panel title in EN', () => {
    i18n.changeLanguage('en')
    wrap(<AdminPage />)
    expect(screen.getByText('Admin Dashboard')).toBeTruthy()
  })

  it('shows KPI labels in ES', () => {
    i18n.changeLanguage('es')
    wrap(<AdminPage />)
    expect(screen.getByText('Usuarios totales')).toBeTruthy()
    expect(screen.getByText('Activos hoy')).toBeTruthy()
  })

  it('shows KPI labels in EN', () => {
    i18n.changeLanguage('en')
    wrap(<AdminPage />)
    expect(screen.getByText('Total users')).toBeTruthy()
    expect(screen.getByText('Active today')).toBeTruthy()
  })

  it('service status label differs between ES and EN', () => {
    i18n.changeLanguage('es')
    const { unmount } = wrap(<AdminPage />)
    expect(screen.getByText('Estado de servicios')).toBeTruthy()
    unmount()
    i18n.changeLanguage('en')
    wrap(<AdminPage />)
    expect(screen.getByText('Service status')).toBeTruthy()
  })

  it('admin access badge differs between ES and EN', () => {
    i18n.changeLanguage('es')
    const { unmount } = wrap(<AdminPage />)
    expect(screen.getByText('Acceso Admin')).toBeTruthy()
    unmount()
    i18n.changeLanguage('en')
    wrap(<AdminPage />)
    expect(screen.getByText('Admin Access')).toBeTruthy()
  })
})
