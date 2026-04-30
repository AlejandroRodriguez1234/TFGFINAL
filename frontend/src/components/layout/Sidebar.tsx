import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@store/appStore'
import { useAuthStore } from '@store/authStore'
import { cn } from '@utils/cn'
import {
  LayoutDashboard, Dumbbell, Apple, Target, Users,
  TrendingUp, Settings, Shield, X, ChevronLeft, Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard:title', roles: ['ADMIN', 'TRAINER', 'CLIENT'] },
  { to: '/habits',    icon: Target,          labelKey: 'habits:title',    roles: ['ADMIN', 'TRAINER', 'CLIENT'] },
  { to: '/gym',       icon: Dumbbell,        labelKey: 'gym:title',       roles: ['ADMIN', 'TRAINER', 'CLIENT'] },
  { to: '/diet',      icon: Apple,           labelKey: 'diet:title',      roles: ['ADMIN', 'TRAINER', 'CLIENT'] },
  { to: '/progress',  icon: TrendingUp,      labelKey: 'common:progress', roles: ['ADMIN', 'TRAINER', 'CLIENT'] },
  { to: '/social',    icon: Users,           labelKey: 'social:title',    roles: ['ADMIN', 'TRAINER', 'CLIENT'] },
  { to: '/settings',  icon: Settings,        labelKey: 'common:settings', roles: ['ADMIN', 'TRAINER', 'CLIENT'] },
  { to: '/admin',     icon: Shield,          labelKey: 'admin:title',     roles: ['ADMIN'] },
] as const

export default function Sidebar() {
  const { t } = useTranslation()
  const { sidebarOpen, toggleSidebar } = useAppStore()
  const { user } = useAuthStore()
  const location = useLocation()

  const visible = navItems.filter((item) => item.roles.includes(user?.role ?? 'CLIENT'))

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 64 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 h-full z-30 flex flex-col',
          'bg-surface-50 border-r border-white/5',
          'md:translate-x-0',
          !sidebarOpen && 'md:block hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
                <span className="font-display font-bold text-lg text-gradient">FitForge</span>
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center"
              >
                <Zap size={16} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarOpen && (
            <button onClick={toggleSidebar} className="btn-ghost p-1 md:flex hidden">
              <ChevronLeft size={18} />
            </button>
          )}
          <button onClick={toggleSidebar} className="btn-ghost p-1 md:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
          <ul className="space-y-1 px-2">
            {visible.map(({ to, icon: Icon, labelKey }) => {
              const isActive = location.pathname.startsWith(to)
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      'text-white/60 hover:text-white hover:bg-white/10',
                      isActive && 'text-white bg-brand-500/20 border border-brand-500/30',
                    )}
                  >
                    <Icon size={18} className={cn(isActive && 'text-brand-400')} />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                          {t(labelKey)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User info */}
        {user && sidebarOpen && (
          <div className="p-3 border-t border-white/5">
            <NavLink to="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
            </NavLink>
          </div>
        )}
      </motion.aside>
    </>
  )
}
