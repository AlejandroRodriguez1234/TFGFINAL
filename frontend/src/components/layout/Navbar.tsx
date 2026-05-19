import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@store/authStore'
import { useAppStore } from '@store/appStore'
import { authService } from '@services/authService'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Search, LogOut, User, Settings, Globe, Check, X, Dumbbell, Apple, Trophy, Flame } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@utils/cn'
import toast from 'react-hot-toast'

const LANGS = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'en', label: 'English', short: 'EN' },
]

const DEMO_NOTIFICATIONS = [
  { id: '1', icon: Dumbbell, color: 'text-brand-400', bg: 'bg-brand-500/15', title: 'Entreno completado', desc: 'Push Day A — 45 min · 8 series', time: 'hace 2h', read: false },
  { id: '2', icon: Trophy,   color: 'text-yellow-400', bg: 'bg-yellow-500/15', title: 'Nuevo logro: Racha 7 días', desc: '¡7 días consecutivos entrenando!', time: 'hace 5h', read: false },
  { id: '3', icon: Apple,    color: 'text-green-400',  bg: 'bg-green-500/15',  title: 'Objetivo nutricional',   desc: 'Alcanzaste 2.100 kcal hoy', time: 'ayer', read: true },
  { id: '4', icon: Flame,    color: 'text-orange-400', bg: 'bg-orange-500/15', title: 'Racha en peligro',        desc: 'Completa al menos 1 hábito hoy', time: 'ayer', read: true },
]

const SEARCH_ROUTES = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Gimnasio', path: '/gym' },
  { label: 'Dieta', path: '/diet' },
  { label: 'Planificador', path: '/diet/planner' },
  { label: 'Hábitos', path: '/habits' },
  { label: 'Progreso', path: '/progress' },
  { label: 'Social', path: '/social' },
  { label: 'Perfil', path: '/profile' },
  { label: 'Ajustes', path: '/settings' },
]

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { user, tokens, logout } = useAuthStore()
  const { toggleSidebar, unreadCount, markAllRead } = useAppStore()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen]   = useState(false)
  const [langOpen, setLangOpen]         = useState(false)
  const [notifOpen, setNotifOpen]       = useState(false)
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)
  const [searchVal, setSearchVal]       = useState('')
  const [searchOpen, setSearchOpen]     = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const unread = notifications.filter((n) => !n.read).length

  const filteredSearch = searchVal.trim().length > 0
    ? SEARCH_ROUTES.filter((r) => r.label.toLowerCase().includes(searchVal.toLowerCase()))
    : []

  const handleNotifOpen = () => {
    setNotifOpen(v => !v)
    setProfileOpen(false)
    setLangOpen(false)
  }

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllReadLocal = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    markAllRead()
  }

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleLogout = async () => {
    try {
      if (tokens?.refreshToken) await authService.logout(tokens.refreshToken)
    } finally {
      logout()
      navigate('/login')
      toast.success('Sesión cerrada correctamente')
    }
  }

  const currentLang = LANGS.find((l) => l.code === i18n.language) ?? LANGS[0]

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-surface-50/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="btn-ghost p-2">
          <Menu size={20} />
        </button>
        {/* Buscador con resultados */}
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            placeholder={t('common:search')}
            className="pl-9 pr-4 py-2 rounded-lg bg-surface-100 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-500/50 w-52 transition-all"
          />
          {searchOpen && filteredSearch.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-52 rounded-xl glass border border-white/10 shadow-xl z-30 py-1 overflow-hidden">
              {filteredSearch.map((r) => (
                <button
                  key={r.path}
                  onMouseDown={() => { navigate(r.path); setSearchVal(''); setSearchOpen(false) }}
                  className="w-full px-3 py-2 text-sm text-left text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Selector de idioma */}
        <div className="relative">
          <button
            onClick={() => { setLangOpen(!langOpen); setNotifOpen(false); setProfileOpen(false) }}
            className="btn-ghost px-2.5 py-2 flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white"
          >
            <Globe size={16} />
            <span className="hidden md:block">{currentLang.short}</span>
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-36 rounded-xl glass border border-white/10 shadow-xl z-20 py-1 overflow-hidden">
                {LANGS.map(({ code, label, short }) => (
                  <button
                    key={code}
                    onClick={() => { i18n.changeLanguage(code); setLangOpen(false); toast.success(`Idioma: ${label}`) }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left',
                      i18n.language === code ? 'text-brand-300 bg-brand-500/10' : 'text-white/70 hover:bg-white/10',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-surface-200 rounded px-1 py-0.5">{short}</span>
                      {label}
                    </div>
                    {i18n.language === code && <Check size={13} className="text-brand-400" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notificaciones */}
        <div className="relative">
          <button onClick={handleNotifOpen} className="btn-ghost p-2 relative">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-80 rounded-xl glass border border-white/10 shadow-xl z-20 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="font-semibold text-sm">Notificaciones</span>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
                      <button onClick={markAllReadLocal} className="text-xs text-brand-400 hover:text-brand-300">
                        Marcar todo leído
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="btn-ghost p-1"><X size={14} /></button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-white/30 text-sm py-8">Sin notificaciones</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={cn(
                          'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0',
                          !n.read && 'bg-brand-500/5',
                        )}
                      >
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', n.bg)}>
                          <n.icon size={15} className={n.color} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn('text-xs font-semibold truncate', !n.read ? 'text-white' : 'text-white/60')}>{n.title}</p>
                          <p className="text-xs text-white/40 truncate mt-0.5">{n.desc}</p>
                          <p className="text-[10px] text-white/25 mt-1">{n.time}</p>
                        </div>
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* XP Level pill */}
        {user && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            <span className="text-brand-400 text-xs font-bold">Nv.{user.level}</span>
            <div className="w-20 h-1.5 rounded-full bg-surface-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
                style={{ width: `${(user.xp % 1000) / 10}%` }}
              />
            </div>
          </div>
        )}

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <span className="text-sm font-medium hidden md:block">{user?.firstName}</span>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 rounded-xl glass border border-white/10 shadow-xl z-20 py-1">
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-white/40">{user?.email}</p>
                  {user?.role === 'ADMIN' && <span className="badge badge-brand mt-1">Admin</span>}
                </div>
                <button onClick={() => { navigate('/profile'); setProfileOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors text-left">
                  <User size={15} /> Perfil
                </button>
                <button onClick={() => { navigate('/settings'); setProfileOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors text-left">
                  <Settings size={15} /> Ajustes
                </button>
                <div className="border-t border-white/5 mt-1" />
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left">
                  <LogOut size={15} /> {t('auth:logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
