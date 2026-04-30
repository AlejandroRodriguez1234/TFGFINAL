import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@store/authStore'
import { useAppStore } from '@store/appStore'
import { authService } from '@services/authService'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Search, LogOut, User, Settings, Globe, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@utils/cn'
import toast from 'react-hot-toast'

const LANGS = [
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'en', label: 'English', short: 'EN' },
]

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { user, tokens, logout } = useAuthStore()
  const { toggleSidebar, unreadCount } = useAppStore()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

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
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder={t('common:search')}
            className="pl-9 pr-4 py-2 rounded-lg bg-surface-100 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-500/50 w-52 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
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
                    onClick={() => {
                      i18n.changeLanguage(code)
                      setLangOpen(false)
                      toast.success(`Idioma: ${label}`)
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left',
                      i18n.language === code
                        ? 'text-brand-300 bg-brand-500/10'
                        : 'text-white/70 hover:bg-white/10',
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

        {/* Notifications */}
        <button className="btn-ghost p-2 relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

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
