import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface DailyStats {
  date: string
  calories: number
  caloriesTarget: number
  waterMl: number
  waterTargetMl: number
  workoutMinutes: number
  exercisesCompleted: number
}

interface DailyState {
  today: DailyStats
  weekHistory: DailyStats[]
  setCalories: (val: number) => void
  setWater: (ml: number) => void
  addWorkout: (minutes: number, exercises: number) => void
  resetIfNewDay: () => void
}

const makeToday = (): DailyStats => ({
  date: new Date().toISOString().split('T')[0],
  calories: 1840,
  caloriesTarget: 2200,
  waterMl: 1750,
  waterTargetMl: 2500,
  workoutMinutes: 0,
  exercisesCompleted: 0,
})

const WEEK_SEED: DailyStats[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (6 - i))
  return {
    date: d.toISOString().split('T')[0],
    calories: [2100, 1950, 2300, 2050, 2400, 1800, 2150][i],
    caloriesTarget: 2200,
    waterMl: [2200, 1800, 2500, 2100, 2300, 1600, 2000][i],
    waterTargetMl: 2500,
    workoutMinutes: [55, 0, 70, 45, 65, 0, 50][i],
    exercisesCompleted: [4, 0, 4, 3, 4, 0, 3][i],
  }
})

export const useDailyStore = create<DailyState>()(
  persist(
    (set) => ({
      today: makeToday(),
      weekHistory: WEEK_SEED,

      setCalories: (val) => set((s) => ({ today: { ...s.today, calories: val } })),
      setWater: (ml) => set((s) => ({ today: { ...s.today, waterMl: ml } })),
      addWorkout: (minutes, exercises) =>
        set((s) => ({
          today: {
            ...s.today,
            workoutMinutes: s.today.workoutMinutes + minutes,
            exercisesCompleted: s.today.exercisesCompleted + exercises,
          },
        })),

      resetIfNewDay: () =>
        set((s) => {
          const todayStr = new Date().toISOString().split('T')[0]
          if (s.today.date === todayStr) return {}
          return {
            weekHistory: [...s.weekHistory.slice(-6), s.today],
            today: makeToday(),
          }
        }),
    }),
    {
      name: 'fitforge-daily',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
