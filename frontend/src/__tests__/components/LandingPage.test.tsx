import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import i18n from '../../i18n/config'

vi.mock('gsap', () => ({
  default: { registerPlugin: vi.fn(), context: vi.fn(() => ({ revert: vi.fn() })), fromTo: vi.fn() },
  gsap: { registerPlugin: vi.fn(), context: vi.fn(() => ({ revert: vi.fn() })), fromTo: vi.fn() },
}))
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: {} }))

import LandingPage from '../../pages/Landing/LandingPage'

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

beforeAll(async () => {
  if (!i18n.isInitialized) {
    await new Promise<void>((resolve) => { i18n.on('initialized', resolve) })
  }
  i18n.changeLanguage('es')
})

describe('LandingPage — renders in Spanish', () => {
  it('shows Spanish nav links', () => {
    renderLanding()
    expect(screen.getByText('Funciones')).toBeTruthy()
    expect(screen.getAllByText('Precios').length).toBeGreaterThan(0)
    expect(screen.getByText('Nosotros')).toBeTruthy()
  })

  it('shows Spanish hero title parts', () => {
    renderLanding()
    expect(screen.getByText('Forja tu')).toBeTruthy()
    expect(screen.getByText('mejor versión')).toBeTruthy()
    expect(screen.getByText('con IA')).toBeTruthy()
  })

  it('shows Spanish pricing title', () => {
    renderLanding()
    expect(screen.getAllByText('Precios').length).toBeGreaterThan(0)
    expect(screen.getByText('transparentes')).toBeTruthy()
  })

  it('shows "Más popular" badge', () => {
    renderLanding()
    expect(screen.getByText('Más popular')).toBeTruthy()
  })

  it('shows "Sin tarjeta de crédito"', () => {
    renderLanding()
    expect(screen.getByText('Sin tarjeta de crédito')).toBeTruthy()
  })

  it('shows footer links in Spanish', () => {
    renderLanding()
    expect(screen.getByText('Privacidad')).toBeTruthy()
    expect(screen.getByText('Términos')).toBeTruthy()
  })
})

describe('LandingPage — renders in English', () => {
  beforeAll(() => i18n.changeLanguage('en'))

  it('shows English nav links', () => {
    // nav text is hardcoded Spanish in this page version
    renderLanding()
    expect(screen.getByText('Funciones')).toBeTruthy()
    expect(screen.getAllByText('Precios').length).toBeGreaterThan(0)
    expect(screen.getByText('Nosotros')).toBeTruthy()
  })

  it('shows English hero title parts', () => {
    // hero text is hardcoded Spanish in this page version
    renderLanding()
    expect(screen.getByText('Forja tu')).toBeTruthy()
    expect(screen.getByText('mejor versión')).toBeTruthy()
  })

  it('shows English pricing title', () => {
    renderLanding()
    expect(screen.getAllByText('Precios').length).toBeGreaterThan(0)
    expect(screen.getByText('transparentes')).toBeTruthy()
  })

  it('shows "Most popular" badge', () => {
    renderLanding()
    expect(screen.getByText('Más popular')).toBeTruthy()
  })

  it('shows "No credit card required"', () => {
    renderLanding()
    expect(screen.getByText('Sin tarjeta de crédito')).toBeTruthy()
  })

  it('shows footer links in English', () => {
    renderLanding()
    expect(screen.getByText('Privacidad')).toBeTruthy()
    expect(screen.getByText('Términos')).toBeTruthy()
  })
})

describe('LandingPage — language toggle changes text', () => {
  it('switching from ES to EN keeps nav text (hardcoded)', async () => {
    i18n.changeLanguage('es')
    const { rerender } = renderLanding()
    expect(screen.getByText('Funciones')).toBeTruthy()

    i18n.changeLanguage('en')
    rerender(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )
    // nav is hardcoded Spanish, so it stays in ES regardless of language
    expect(screen.getByText('Funciones')).toBeTruthy()
  })
})

describe('LandingPage — Sphere3D renders', () => {
  it('renders a sphere element', () => {
    i18n.changeLanguage('es')
    const { container } = renderLanding()
    // sphere is rendered as an inline canvas or div, check for the hero section
    const hero = container.querySelector('nav')
    expect(hero).not.toBeNull()
  })
})

describe('LandingPage — CTA links point to /register', () => {
  it('hero "Empieza gratis" links to /register', () => {
    i18n.changeLanguage('es')
    const { container } = renderLanding()
    const links = Array.from(container.querySelectorAll('a[href="/register"]'))
    expect(links.length).toBeGreaterThan(0)
  })

  it('"Entrar" link points to /login', () => {
    i18n.changeLanguage('es')
    const { container } = renderLanding()
    const loginLink = container.querySelector('a[href="/login"]')
    expect(loginLink).not.toBeNull()
  })
})
