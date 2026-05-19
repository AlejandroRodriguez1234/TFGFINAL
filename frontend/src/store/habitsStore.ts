import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type HabitIconName =
  | 'Dumbbell' | 'Droplets' | 'Brain' | 'BookOpen' | 'Apple' | 'Moon'
  | 'Footprints' | 'Target' | 'Music' | 'Leaf' | 'Sun' | 'Heart'

export interface Habit {
  id: string
  name: string
  iconName: HabitIconName
  color: string
  streak: number
  completedToday: boolean
  completedDates: string[]
}

interface HabitsState {
  habits: Habit[]
  lastResetDate: string
  toggleHabit: (id: string) => void
  addHabit: (name: string, iconName: HabitIconName) => void
  deleteHabit: (id: string) => void
  resetIfNewDay: () => void
}

const todayStr = () => new Date().toISOString().split('T')[0]

const seedDates = (daysBack: number): string[] => {
  const dates: string[] = []
  for (let i = 1; i <= daysBack; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Entrenar',        iconName: 'Dumbbell',  color: 'from-brand-500 to-cyan-400',    streak: 7,  completedToday: false, completedDates: seedDates(7)  },
  { id: '2', name: 'Beber agua',      iconName: 'Droplets',  color: 'from-cyan-500 to-blue-400',     streak: 14, completedToday: false, completedDates: seedDates(14) },
  { id: '3', name: 'Meditar',         iconName: 'Brain',     color: 'from-purple-500 to-pink-400',   streak: 3,  completedToday: false, completedDates: seedDates(3)  },
  { id: '4', name: 'Leer 30 min',     iconName: 'BookOpen',  color: 'from-yellow-500 to-orange-400', streak: 5,  completedToday: false, completedDates: seedDates(5)  },
  { id: '5', name: 'Registro comida', iconName: 'Apple',     color: 'from-green-500 to-emerald-400', streak: 10, completedToday: false, completedDates: seedDates(10) },
  { id: '6', name: 'Dormir 8h',       iconName: 'Moon',      color: 'from-indigo-500 to-violet-400', streak: 2,  completedToday: false, completedDates: seedDates(2)  },
]

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set) => ({
      habits: DEFAULT_HABITS,
      lastResetDate: todayStr(),

      toggleHabit: (id) => set((state) => {
        const today = todayStr()
        return {
          habits: state.habits.map((h) => {
            if (h.id !== id) return h
            const wasDone = h.completedToday
            const newDates = wasDone
              ? h.completedDates.filter((d) => d !== today)
              : [...h.completedDates.filter((d) => d !== today), today]
            return {
              ...h,
              completedToday: !wasDone,
              streak: wasDone ? Math.max(0, h.streak - 1) : h.streak + 1,
              completedDates: newDates,
            }
          }),
        }
      }),

      addHabit: (name, iconName) => set((state) => ({
        habits: [
          ...state.habits,
          {
            id: Date.now().toString(),
            name,
            iconName,
            color: 'from-brand-500 to-cyan-400',
            streak: 0,
            completedToday: false,
            completedDates: [],
          },
        ],
      })),

      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      })),

      resetIfNewDay: () => set((state) => {
        const today = todayStr()
        if (state.lastResetDate === today) return {}
        return {
          lastResetDate: today,
          habits: state.habits.map((h) => ({
            ...h,
            completedToday: false,
            streak: h.completedToday ? h.streak : Math.max(0, h.streak - 1),
          })),
        }
      }),
    }),
    {
      name: 'fitforge-habits',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
