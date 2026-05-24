/**
 * Tests for workout logic: set completion, progress calculation,
 * calorie estimation, and time formatting.
 */
import { describe, it, expect } from 'vitest'

// ── Helpers matching WorkoutPage logic ──────────────────────────────────────

function fmt(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

interface WorkoutSet { reps: number; weight: number; completed: boolean }
interface Exercise    { id: string; name: string; sets: WorkoutSet[]; restSeconds: number }

function calcProgress(exercises: Exercise[]): number {
  const total = exercises.reduce((a, e) => a + e.sets.length, 0)
  const done  = exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0)
  return total > 0 ? (done / total) * 100 : 0
}

function estimateCalories(doneSets: number): number {
  return Math.round(doneSets * 12)
}

function adjustField(value: number, delta: number): number {
  return Math.max(0, value + delta)
}

// ─────────────────────────────────────────────────────────────────────────────

describe('fmt — time formatter', () => {
  it('formats 0 as 00:00', () => {
    expect(fmt(0)).toBe('00:00')
  })

  it('formats 60 as 01:00', () => {
    expect(fmt(60)).toBe('01:00')
  })

  it('formats 90 as 01:30', () => {
    expect(fmt(90)).toBe('01:30')
  })

  it('formats 3661 as 61:01', () => {
    expect(fmt(3661)).toBe('61:01')
  })

  it('pads seconds with leading zero', () => {
    expect(fmt(65)).toBe('01:05')
  })
})

describe('calcProgress — workout completion percentage', () => {
  const exercises: Exercise[] = [
    { id: 'e1', name: 'Press', sets: [
      { reps: 8, weight: 70, completed: false },
      { reps: 8, weight: 70, completed: false },
    ], restSeconds: 90 },
    { id: 'e2', name: 'Curl', sets: [
      { reps: 12, weight: 20, completed: false },
      { reps: 12, weight: 20, completed: false },
    ], restSeconds: 60 },
  ]

  it('returns 0 when no sets completed', () => {
    expect(calcProgress(exercises)).toBe(0)
  })

  it('returns 50 when half the sets are done', () => {
    const half = structuredClone(exercises)
    half[0].sets[0].completed = true
    half[0].sets[1].completed = true
    expect(calcProgress(half)).toBe(50)
  })

  it('returns 100 when all sets are done', () => {
    const all = structuredClone(exercises)
    all.forEach((ex) => ex.sets.forEach((s) => (s.completed = true)))
    expect(calcProgress(all)).toBe(100)
  })

  it('returns 0 for empty exercise list', () => {
    expect(calcProgress([])).toBe(0)
  })

  it('returns 25 when 1 of 4 sets done', () => {
    const ex = structuredClone(exercises)
    ex[0].sets[0].completed = true
    expect(calcProgress(ex)).toBe(25)
  })
})

describe('estimateCalories — kcal per set', () => {
  it('0 sets = 0 kcal', () => {
    expect(estimateCalories(0)).toBe(0)
  })

  it('1 set = 12 kcal', () => {
    expect(estimateCalories(1)).toBe(12)
  })

  it('10 sets = 120 kcal', () => {
    expect(estimateCalories(10)).toBe(120)
  })

  it('scales linearly', () => {
    expect(estimateCalories(5)).toBe(estimateCalories(3) + estimateCalories(2))
  })
})

describe('adjustField — reps/weight adjuster', () => {
  it('increments correctly', () => {
    expect(adjustField(8, 1)).toBe(9)
    expect(adjustField(70, 2.5)).toBe(72.5)
  })

  it('decrements correctly', () => {
    expect(adjustField(8, -1)).toBe(7)
    expect(adjustField(70, -2.5)).toBe(67.5)
  })

  it('does not go below 0', () => {
    expect(adjustField(0, -1)).toBe(0)
    expect(adjustField(1, -5)).toBe(0)
  })
})

describe('workout finish — minutes calculation', () => {
  it('rounds seconds to nearest minute (minimum 1)', () => {
    const elapsed = 2700 // 45 minutes
    const mins = Math.max(1, Math.round(elapsed / 60))
    expect(mins).toBe(45)
  })

  it('very short workout is at least 1 minute', () => {
    const elapsed = 30 // 30 seconds
    const mins = Math.max(1, Math.round(elapsed / 60))
    expect(mins).toBe(1)
  })

  it('exactly 60 seconds = 1 minute', () => {
    const elapsed = 60
    const mins = Math.max(1, Math.round(elapsed / 60))
    expect(mins).toBe(1)
  })

  it('3600 seconds = 60 minutes', () => {
    const elapsed = 3600
    const mins = Math.max(1, Math.round(elapsed / 60))
    expect(mins).toBe(60)
  })
})

describe('rest timer — urgency threshold', () => {
  it('is urgent at 5 seconds', () => {
    const isUrgent = (left: number) => left <= 5
    expect(isUrgent(5)).toBe(true)
  })

  it('is urgent at 0 seconds', () => {
    const isUrgent = (left: number) => left <= 5
    expect(isUrgent(0)).toBe(true)
  })

  it('is not urgent at 6 seconds', () => {
    const isUrgent = (left: number) => left <= 5
    expect(isUrgent(6)).toBe(false)
  })

  it('percentage is 100% at start', () => {
    const pct = (left: number, total: number) => (left / total) * 100
    expect(pct(90, 90)).toBe(100)
  })

  it('percentage is 0% at end', () => {
    const pct = (left: number, total: number) => (left / total) * 100
    expect(pct(0, 90)).toBe(0)
  })

  it('percentage is 50% halfway through', () => {
    const pct = (left: number, total: number) => (left / total) * 100
    expect(pct(45, 90)).toBe(50)
  })
})
