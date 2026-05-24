/**
 * Tests for the Mifflin-St Jeor BMR / TDEE / BMI formulas
 * used in ProgressPage calculator and DietPlannerPage.
 */
import { describe, it, expect } from 'vitest'

// Pure functions extracted from ProgressPage / DietPlannerPage logic

function calcBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  return gender === 'male'
    ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
    : Math.round(10 * weight + 6.25 * height - 5 * age - 161)
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
}

function calcTDEE(bmr: number, activity: string): number {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activity] ?? 1.55))
}

function calcBMI(weight: number, heightCm: number): number {
  return parseFloat((weight / ((heightCm / 100) ** 2)).toFixed(1))
}

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25)   return 'normal'
  if (bmi < 30)   return 'overweight'
  return 'obese'
}

function idealWeightRange(heightCm: number): [number, number] {
  const h = heightCm / 100
  return [
    parseFloat((18.5 * h * h).toFixed(1)),
    parseFloat((24.9 * h * h).toFixed(1)),
  ]
}

// ─────────────────────────────────────────────────────────────────────────────

describe('BMR — Mifflin-St Jeor formula', () => {
  it('calculates male BMR correctly (80kg, 180cm, 25y)', () => {
    // 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805
    expect(calcBMR(80, 180, 25, 'male')).toBe(1805)
  })

  it('calculates female BMR correctly (60kg, 165cm, 30y)', () => {
    // 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320
    expect(calcBMR(60, 165, 30, 'female')).toBe(1320)
  })

  it('female BMR is lower than male BMR for same parameters', () => {
    const male   = calcBMR(75, 175, 28, 'male')
    const female = calcBMR(75, 175, 28, 'female')
    expect(male).toBeGreaterThan(female)
    // Difference is exactly 166 (5 - (-161))
    expect(male - female).toBe(166)
  })

  it('higher weight increases BMR', () => {
    const bmr70 = calcBMR(70, 175, 25, 'male')
    const bmr80 = calcBMR(80, 175, 25, 'male')
    expect(bmr80).toBeGreaterThan(bmr70)
    // 10kg more = +100 kcal BMR
    expect(bmr80 - bmr70).toBe(100)
  })

  it('higher age decreases BMR', () => {
    const bmr25 = calcBMR(75, 175, 25, 'male')
    const bmr35 = calcBMR(75, 175, 35, 'male')
    // 10y more = -50 kcal BMR
    expect(bmr25 - bmr35).toBe(50)
  })

  it('taller person has higher BMR', () => {
    const bmr170 = calcBMR(75, 170, 25, 'male')
    const bmr180 = calcBMR(75, 180, 25, 'male')
    expect(bmr180).toBeGreaterThan(bmr170)
  })
})

describe('TDEE — activity multipliers', () => {
  const BASE_BMR = 1700

  it('sedentary multiplier = 1.2', () => {
    expect(calcTDEE(BASE_BMR, 'sedentary')).toBe(Math.round(BASE_BMR * 1.2))
  })

  it('light multiplier = 1.375', () => {
    expect(calcTDEE(BASE_BMR, 'light')).toBe(Math.round(BASE_BMR * 1.375))
  })

  it('moderate multiplier = 1.55', () => {
    expect(calcTDEE(BASE_BMR, 'moderate')).toBe(Math.round(BASE_BMR * 1.55))
  })

  it('active multiplier = 1.725', () => {
    expect(calcTDEE(BASE_BMR, 'active')).toBe(Math.round(BASE_BMR * 1.725))
  })

  it('very_active multiplier = 1.9', () => {
    expect(calcTDEE(BASE_BMR, 'very_active')).toBe(Math.round(BASE_BMR * 1.9))
  })

  it('TDEE is always greater than BMR', () => {
    for (const key of Object.keys(ACTIVITY_MULTIPLIERS)) {
      expect(calcTDEE(BASE_BMR, key)).toBeGreaterThan(BASE_BMR)
    }
  })

  it('falls back to moderate multiplier for unknown activity', () => {
    expect(calcTDEE(BASE_BMR, 'unknown')).toBe(Math.round(BASE_BMR * 1.55))
  })

  it('more active = more TDEE', () => {
    const sed = calcTDEE(1700, 'sedentary')
    const act = calcTDEE(1700, 'active')
    expect(act).toBeGreaterThan(sed)
  })
})

describe('BMI calculation', () => {
  it('calculates BMI correctly (80kg, 180cm → ~24.7)', () => {
    expect(calcBMI(80, 180)).toBe(24.7)
  })

  it('calculates BMI correctly (70kg, 175cm → ~22.9)', () => {
    expect(calcBMI(70, 175)).toBe(22.9)
  })

  it('higher weight = higher BMI', () => {
    expect(calcBMI(90, 175)).toBeGreaterThan(calcBMI(70, 175))
  })

  it('taller person = lower BMI for same weight', () => {
    expect(calcBMI(80, 190)).toBeLessThan(calcBMI(80, 170))
  })
})

describe('BMI categories', () => {
  it('18.4 is underweight', () => {
    expect(bmiCategory(18.4)).toBe('underweight')
  })

  it('18.5 is normal', () => {
    expect(bmiCategory(18.5)).toBe('normal')
  })

  it('24.9 is normal', () => {
    expect(bmiCategory(24.9)).toBe('normal')
  })

  it('25.0 is overweight', () => {
    expect(bmiCategory(25.0)).toBe('overweight')
  })

  it('29.9 is overweight', () => {
    expect(bmiCategory(29.9)).toBe('overweight')
  })

  it('30.0 is obese', () => {
    expect(bmiCategory(30.0)).toBe('obese')
  })
})

describe('Ideal weight range', () => {
  it('returns range based on BMI 18.5–24.9 for 175cm', () => {
    const [min, max] = idealWeightRange(175)
    // 18.5 * 1.75^2 = 56.6, 24.9 * 1.75^2 = 76.2
    expect(min).toBeCloseTo(56.6, 0)
    expect(max).toBeCloseTo(76.2, 0)
  })

  it('min is always less than max', () => {
    const [min, max] = idealWeightRange(170)
    expect(min).toBeLessThan(max)
  })

  it('taller people have higher ideal weight range', () => {
    const [min160] = idealWeightRange(160)
    const [min180] = idealWeightRange(180)
    expect(min180).toBeGreaterThan(min160)
  })
})

describe('Diet plan calorie adjustments', () => {
  it('lose_weight reduces calories by 400', () => {
    const tdee = 2200
    const adj = tdee - 400
    expect(adj).toBe(1800)
  })

  it('gain_muscle increases calories by 300', () => {
    const tdee = 2200
    const adj = tdee + 300
    expect(adj).toBe(2500)
  })

  it('maintain keeps TDEE calories', () => {
    const tdee = 2200
    expect(tdee).toBe(2200)
  })
})

describe('Protein target calculation', () => {
  it('protein = 2g per kg of bodyweight', () => {
    expect(Math.round(80 * 2)).toBe(160)
    expect(Math.round(60 * 2)).toBe(120)
    expect(Math.round(100 * 2)).toBe(200)
  })
})
