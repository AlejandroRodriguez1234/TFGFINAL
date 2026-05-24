import { describe, it, expect, beforeEach } from 'vitest'
import { useDailyStore } from '@store/dailyStore'

const TODAY = new Date().toISOString().split('T')[0]

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

const FRESH_TODAY = {
  date: TODAY,
  calories: 0,
  caloriesTarget: 2200,
  waterMl: 0,
  waterTargetMl: 2500,
  workoutMinutes: 0,
  exercisesCompleted: 0,
}

beforeEach(() => {
  useDailyStore.setState({ today: { ...FRESH_TODAY }, weekHistory: [] })
})

describe('dailyStore — setCalories', () => {
  it('sets calories for today', () => {
    useDailyStore.getState().setCalories(1800)
    expect(useDailyStore.getState().today.calories).toBe(1800)
  })

  it('overwrites previous value', () => {
    useDailyStore.getState().setCalories(1000)
    useDailyStore.getState().setCalories(2000)
    expect(useDailyStore.getState().today.calories).toBe(2000)
  })

  it('accepts 0', () => {
    useDailyStore.getState().setCalories(500)
    useDailyStore.getState().setCalories(0)
    expect(useDailyStore.getState().today.calories).toBe(0)
  })

  it('does not change other fields', () => {
    const before = { ...useDailyStore.getState().today }
    useDailyStore.getState().setCalories(1500)
    const after = useDailyStore.getState().today
    expect(after.waterMl).toBe(before.waterMl)
    expect(after.workoutMinutes).toBe(before.workoutMinutes)
  })
})

describe('dailyStore — setWater', () => {
  it('sets water in ml', () => {
    useDailyStore.getState().setWater(2000)
    expect(useDailyStore.getState().today.waterMl).toBe(2000)
  })

  it('overwrites previous value', () => {
    useDailyStore.getState().setWater(500)
    useDailyStore.getState().setWater(1500)
    expect(useDailyStore.getState().today.waterMl).toBe(1500)
  })

  it('does not change other fields', () => {
    useDailyStore.getState().setCalories(2000)
    useDailyStore.getState().setWater(1000)
    expect(useDailyStore.getState().today.calories).toBe(2000)
  })
})

describe('dailyStore — addWorkout', () => {
  it('increments workoutMinutes', () => {
    useDailyStore.getState().addWorkout(45, 4)
    expect(useDailyStore.getState().today.workoutMinutes).toBe(45)
  })

  it('increments exercisesCompleted', () => {
    useDailyStore.getState().addWorkout(45, 4)
    expect(useDailyStore.getState().today.exercisesCompleted).toBe(4)
  })

  it('accumulates multiple workouts', () => {
    useDailyStore.getState().addWorkout(30, 3)
    useDailyStore.getState().addWorkout(20, 2)
    expect(useDailyStore.getState().today.workoutMinutes).toBe(50)
    expect(useDailyStore.getState().today.exercisesCompleted).toBe(5)
  })

  it('handles 0 minutes (skipped workout)', () => {
    useDailyStore.getState().addWorkout(0, 0)
    expect(useDailyStore.getState().today.workoutMinutes).toBe(0)
    expect(useDailyStore.getState().today.exercisesCompleted).toBe(0)
  })
})

describe('dailyStore — resetIfNewDay', () => {
  it('does nothing when already today', () => {
    useDailyStore.setState({ today: { ...FRESH_TODAY, calories: 1500 }, weekHistory: [] })
    useDailyStore.getState().resetIfNewDay()
    expect(useDailyStore.getState().today.calories).toBe(1500)
  })

  it('moves old day to weekHistory', () => {
    const oldDay = { ...FRESH_TODAY, date: yesterday(), calories: 1800 }
    useDailyStore.setState({ today: oldDay, weekHistory: [] })
    useDailyStore.getState().resetIfNewDay()
    const { weekHistory } = useDailyStore.getState()
    expect(weekHistory).toHaveLength(1)
    expect(weekHistory[0].date).toBe(yesterday())
    expect(weekHistory[0].calories).toBe(1800)
  })

  it('resets today stats when day changes', () => {
    const oldDay = { ...FRESH_TODAY, date: yesterday(), calories: 1800, waterMl: 2000, workoutMinutes: 60 }
    useDailyStore.setState({ today: oldDay, weekHistory: [] })
    useDailyStore.getState().resetIfNewDay()
    const { today } = useDailyStore.getState()
    expect(today.date).toBe(TODAY)
    expect(today.workoutMinutes).toBe(0)
    expect(today.exercisesCompleted).toBe(0)
  })

  it('keeps only last 6 days + old day in weekHistory', () => {
    const oldHistory = Array.from({ length: 6 }, (_, i) => ({
      ...FRESH_TODAY,
      date: `2024-01-0${i + 1}`,
      calories: 2000,
    }))
    const oldDay = { ...FRESH_TODAY, date: yesterday(), calories: 1800 }
    useDailyStore.setState({ today: oldDay, weekHistory: oldHistory })
    useDailyStore.getState().resetIfNewDay()
    expect(useDailyStore.getState().weekHistory).toHaveLength(7)
  })
})
