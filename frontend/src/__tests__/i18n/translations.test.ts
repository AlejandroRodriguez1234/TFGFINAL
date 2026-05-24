/**
 * Ensures every translation key defined in Spanish also exists in English,
 * and that no key resolves to undefined/empty in either language.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import i18n from '../../i18n/config'

const NS_LIST = [
  'common', 'auth', 'dashboard', 'gym', 'diet',
  'habits', 'social', 'admin', 'landing', 'progress', 'trainer', 'profile',
]

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const full = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      return getAllKeys(v as Record<string, unknown>, full)
    }
    return [full]
  })
}

beforeAll(async () => {
  if (!i18n.isInitialized) {
    await new Promise<void>((resolve) => {
      i18n.on('initialized', resolve)
    })
  }
})

describe('i18n — namespace completeness', () => {
  for (const ns of NS_LIST) {
    it(`namespace "${ns}" is loaded in both ES and EN`, () => {
      const es = i18n.getResourceBundle('es', ns)
      const en = i18n.getResourceBundle('en', ns)
      expect(es, `ES bundle "${ns}" missing`).toBeTruthy()
      expect(en, `EN bundle "${ns}" missing`).toBeTruthy()
    })
  }
})

describe('i18n — key parity (ES keys exist in EN)', () => {
  for (const ns of NS_LIST) {
    it(`all keys in ES "${ns}" exist in EN`, () => {
      const es = i18n.getResourceBundle('es', ns)
      const en = i18n.getResourceBundle('en', ns)
      if (!es || !en) return

      const esKeys = getAllKeys(es)
      const enKeys = new Set(getAllKeys(en))
      const missing = esKeys.filter((k) => !enKeys.has(k))
      expect(missing, `Missing EN keys in "${ns}": ${missing.join(', ')}`).toHaveLength(0)
    })
  }
})

describe('i18n — key parity (EN keys exist in ES)', () => {
  for (const ns of NS_LIST) {
    it(`all keys in EN "${ns}" exist in ES`, () => {
      const es = i18n.getResourceBundle('es', ns)
      const en = i18n.getResourceBundle('en', ns)
      if (!es || !en) return

      const enKeys = getAllKeys(en)
      const esKeys = new Set(getAllKeys(es))
      const missing = enKeys.filter((k) => !esKeys.has(k))
      expect(missing, `Missing ES keys in "${ns}": ${missing.join(', ')}`).toHaveLength(0)
    })
  }
})

describe('i18n — no empty string values', () => {
  for (const ns of NS_LIST) {
    it(`no empty strings in ES "${ns}"`, () => {
      const es = i18n.getResourceBundle('es', ns)
      if (!es) return
      const keys = getAllKeys(es)
      const empty = keys.filter((k) => {
        const parts = k.split('.')
        let v: unknown = es
        for (const p of parts) v = (v as Record<string, unknown>)[p]
        return typeof v === 'string' && v.trim() === ''
      })
      expect(empty, `Empty ES values in "${ns}": ${empty.join(', ')}`).toHaveLength(0)
    })

    it(`no empty strings in EN "${ns}"`, () => {
      const en = i18n.getResourceBundle('en', ns)
      if (!en) return
      const keys = getAllKeys(en)
      const empty = keys.filter((k) => {
        const parts = k.split('.')
        let v: unknown = en
        for (const p of parts) v = (v as Record<string, unknown>)[p]
        return typeof v === 'string' && v.trim() === ''
      })
      expect(empty, `Empty EN values in "${ns}": ${empty.join(', ')}`).toHaveLength(0)
    })
  }
})

describe('i18n — language switching', () => {
  it('defaults to Spanish', () => {
    expect(i18n.language).toMatch(/^es/)
  })

  it('translates common:save correctly in ES', () => {
    i18n.changeLanguage('es')
    expect(i18n.t('common:save')).toBe('Guardar')
  })

  it('translates common:save correctly in EN', () => {
    i18n.changeLanguage('en')
    expect(i18n.t('common:save')).toBe('Save')
  })

  it('translates habits:title in ES', () => {
    i18n.changeLanguage('es')
    expect(i18n.t('habits:title')).toBe('Hábitos')
  })

  it('translates habits:title in EN', () => {
    i18n.changeLanguage('en')
    expect(i18n.t('habits:title')).toBe('Habits')
  })

  it('translates gym:restLabel in ES', () => {
    i18n.changeLanguage('es')
    expect(i18n.t('gym:restLabel')).toBe('Descanso')
  })

  it('translates gym:restLabel in EN', () => {
    i18n.changeLanguage('en')
    expect(i18n.t('gym:restLabel')).toBe('Rest')
  })

  it('translates profile:editProfile in ES', () => {
    i18n.changeLanguage('es')
    expect(i18n.t('profile:editProfile')).toBe('Editar perfil')
  })

  it('translates profile:editProfile in EN', () => {
    i18n.changeLanguage('en')
    expect(i18n.t('profile:editProfile')).toBe('Edit profile')
  })

  it('translates progress:tabCalculator in ES', () => {
    i18n.changeLanguage('es')
    expect(i18n.t('progress:tabCalculator')).toBe('Calculadora')
  })

  it('translates progress:tabCalculator in EN', () => {
    i18n.changeLanguage('en')
    expect(i18n.t('progress:tabCalculator')).toBe('Calculator')
  })

  it('interpolates streakDays correctly in ES', () => {
    i18n.changeLanguage('es')
    expect(i18n.t('habits:streakDays', { n: 7 })).toBe('7 días seguidos')
  })

  it('interpolates streakDays correctly in EN', () => {
    i18n.changeLanguage('en')
    expect(i18n.t('habits:streakDays', { n: 7 })).toBe('7 days in a row')
  })

  it('restores to Spanish after test', () => {
    i18n.changeLanguage('es')
    expect(i18n.language).toBe('es')
  })
})

describe('i18n — landing namespace keys (ES)', () => {
  beforeAll(() => i18n.changeLanguage('es'))

  it('navFeatures', () => expect(i18n.t('landing:navFeatures')).toBe('Funciones'))
  it('navPricing',  () => expect(i18n.t('landing:navPricing')).toBe('Precios'))
  it('navAbout',    () => expect(i18n.t('landing:navAbout')).toBe('Nosotros'))
  it('signIn',      () => expect(i18n.t('landing:signIn')).toBe('Entrar'))
  it('startFree',   () => expect(i18n.t('landing:startFree')).toBe('Empezar gratis'))
  it('heroTitle1',  () => expect(i18n.t('landing:heroTitle1')).toBe('Forja tu'))
  it('heroTitle2',  () => expect(i18n.t('landing:heroTitle2')).toBe('mejor versión'))
  it('heroTitle3',  () => expect(i18n.t('landing:heroTitle3')).toBe('con IA'))
  it('startFreeBtn',() => expect(i18n.t('landing:startFreeBtn')).toBe('Empieza gratis'))
  it('watchDemo',   () => expect(i18n.t('landing:watchDemo')).toBe('Ver demo'))
  it('mostPopular', () => expect(i18n.t('landing:mostPopular')).toBe('Más popular'))
  it('planStarterCta', () => expect(i18n.t('landing:planStarterCta')).toBe('Empezar gratis'))
  it('planProCta',     () => expect(i18n.t('landing:planProCta')).toBe('Empezar Pro'))
  it('planTrainerCta', () => expect(i18n.t('landing:planTrainerCta')).toBe('Contactar'))
  it('pricingTitle1',  () => expect(i18n.t('landing:pricingTitle1')).toBe('Precios'))
  it('pricingTitle2',  () => expect(i18n.t('landing:pricingTitle2')).toBe('transparentes'))
  it('createFreeAccount', () => expect(i18n.t('landing:createFreeAccount')).toBe('Crear cuenta gratis'))
  it('noCreditCard',  () => expect(i18n.t('landing:noCreditCard')).toBe('Sin tarjeta de crédito'))
  it('privacy',       () => expect(i18n.t('landing:privacy')).toBe('Privacidad'))
  it('terms',         () => expect(i18n.t('landing:terms')).toBe('Términos'))
  it('weekDaysShort is array with 7 items', () => {
    const days = i18n.t('landing:weekDaysShort', { returnObjects: true })
    expect(Array.isArray(days)).toBe(true)
    expect((days as string[]).length).toBe(7)
  })
})

describe('i18n — landing namespace keys (EN)', () => {
  beforeAll(() => i18n.changeLanguage('en'))

  it('navFeatures', () => expect(i18n.t('landing:navFeatures')).toBe('Features'))
  it('navPricing',  () => expect(i18n.t('landing:navPricing')).toBe('Pricing'))
  it('navAbout',    () => expect(i18n.t('landing:navAbout')).toBe('About'))
  it('signIn',      () => expect(i18n.t('landing:signIn')).toBe('Sign in'))
  it('startFree',   () => expect(i18n.t('landing:startFree')).toBe('Get started free'))
  it('heroTitle1',  () => expect(i18n.t('landing:heroTitle1')).toBe('Forge your'))
  it('heroTitle2',  () => expect(i18n.t('landing:heroTitle2')).toBe('best self'))
  it('heroTitle3',  () => expect(i18n.t('landing:heroTitle3')).toBe('with AI'))
  it('startFreeBtn',() => expect(i18n.t('landing:startFreeBtn')).toBe('Start free'))
  it('watchDemo',   () => expect(i18n.t('landing:watchDemo')).toBe('Watch demo'))
  it('mostPopular', () => expect(i18n.t('landing:mostPopular')).toBe('Most popular'))
  it('planStarterCta', () => expect(i18n.t('landing:planStarterCta')).toBe('Get started free'))
  it('planProCta',     () => expect(i18n.t('landing:planProCta')).toBe('Start Pro'))
  it('planTrainerCta', () => expect(i18n.t('landing:planTrainerCta')).toBe('Contact'))
  it('pricingTitle1',  () => expect(i18n.t('landing:pricingTitle1')).toBe('Transparent'))
  it('pricingTitle2',  () => expect(i18n.t('landing:pricingTitle2')).toBe('pricing'))
  it('createFreeAccount', () => expect(i18n.t('landing:createFreeAccount')).toBe('Create free account'))
  it('noCreditCard',  () => expect(i18n.t('landing:noCreditCard')).toBe('No credit card required'))
  it('privacy',       () => expect(i18n.t('landing:privacy')).toBe('Privacy'))
  it('terms',         () => expect(i18n.t('landing:terms')).toBe('Terms'))
  it('weekDaysShort is array with 7 items', () => {
    const days = i18n.t('landing:weekDaysShort', { returnObjects: true })
    expect(Array.isArray(days)).toBe(true)
    expect((days as string[]).length).toBe(7)
  })
})

describe('i18n — landing language switch produces different text', () => {
  it('navFeatures differs between ES and EN', () => {
    i18n.changeLanguage('es')
    const es = i18n.t('landing:navFeatures')
    i18n.changeLanguage('en')
    const en = i18n.t('landing:navFeatures')
    expect(es).not.toBe(en)
  })

  it('heroTitle2 differs between ES and EN', () => {
    i18n.changeLanguage('es')
    const es = i18n.t('landing:heroTitle2')
    i18n.changeLanguage('en')
    const en = i18n.t('landing:heroTitle2')
    expect(es).not.toBe(en)
  })

  it('planProCta differs between ES and EN', () => {
    i18n.changeLanguage('es')
    const es = i18n.t('landing:planProCta')
    i18n.changeLanguage('en')
    const en = i18n.t('landing:planProCta')
    expect(es).not.toBe(en)
  })

  afterAll(() => i18n.changeLanguage('es'))
})
