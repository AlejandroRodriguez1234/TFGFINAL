import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeStore {
  theme: Theme
  setTheme: (t: Theme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.toggle('light', theme === 'light')
      },
    }),
    { name: 'fitforge-theme' },
  ),
)

export function initTheme() {
  const stored = localStorage.getItem('fitforge-theme')
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      if (state?.theme === 'light') document.documentElement.classList.add('light')
    } catch { /* ignore */ }
  }
}
