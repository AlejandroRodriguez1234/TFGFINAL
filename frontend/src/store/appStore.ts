import { create } from 'zustand'
import type { Notification } from '@/types'

interface AppState {
  sidebarOpen: boolean
  theme: 'dark' | 'light'
  language: 'es' | 'en'
  notifications: Notification[]
  unreadCount: number
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'dark' | 'light') => void
  setLanguage: (lang: 'es' | 'en') => void
  addNotification: (n: Notification) => void
  markAllRead: () => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  language: 'es',
  notifications: [],
  unreadCount: 0,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount: s.unreadCount + (n.isRead ? 0 : 1),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}))
