import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Bell, Globe, Palette, User, Key, Smartphone, LogOut, ChevronRight, Check } from 'lucide-react'
import { cn } from '@utils/cn'
import { useAuthStore } from '@store/authStore'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode.react'

type Section = 'profile' | 'security' | 'notifications' | 'language' | 'appearance'

const sections = [
  { key: 'profile'       as Section, icon: User,         label: 'Perfil' },
  { key: 'security'      as Section, icon: Shield,        label: 'Seguridad' },
  { key: 'notifications' as Section, icon: Bell,          label: 'Notificaciones' },
  { key: 'language'      as Section, icon: Globe,         label: 'Idioma' },
  { key: 'appearance'    as Section, icon: Palette,       label: 'Apariencia' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={cn('w-11 h-6 rounded-full transition-all relative', checked ? 'bg-brand-500' : 'bg-surface-300')}>
      <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-all', checked ? 'left-6' : 'left-1')} />
    </button>
  )
}

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { i18n } = useTranslation()
  const [active, setActive]   = useState<Section>('profile')
  const [show2fa, setShow2fa] = useState(false)
  const [notifs, setNotifs]   = useState({ workout: true, diet: true, social: false, achievements: true, email: true })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Ajustes</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Nav */}
        <div className="md:col-span-1">
          <nav className="space-y-1">
            {sections.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left', active === key ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'text-white/60 hover:text-white hover:bg-white/10')}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="md:col-span-3 card space-y-6">
          {active === 'profile' && (
            <div className="space-y-5">
              <h2 className="font-semibold">Información personal</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <button className="btn-secondary text-sm px-3 py-2">Cambiar foto</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[['Nombre', user?.firstName], ['Apellidos', user?.lastName], ['Usuario', `@${user?.username}`], ['Email', user?.email]].map(([label, val]) => (
                  <div key={label as string}>
                    <label className="text-xs text-white/40 mb-1 block">{label as string}</label>
                    <input defaultValue={val as string} className="input text-sm" />
                  </div>
                ))}
              </div>
              <button className="btn-primary">Guardar cambios</button>
            </div>
          )}

          {active === 'security' && (
            <div className="space-y-5">
              <h2 className="font-semibold">Seguridad</h2>
              <div className="space-y-3">
                {[['Contraseña actual', 'current-password'], ['Nueva contraseña', 'new-password'], ['Confirmar', 'new-password']].map(([label, ac]) => (
                  <div key={label as string}>
                    <label className="text-xs text-white/40 mb-1 block">{label as string}</label>
                    <input type="password" autoComplete={ac as string} className="input text-sm" />
                  </div>
                ))}
                <button className="btn-primary text-sm">Actualizar contraseña</button>
              </div>
              <div className="section-divider" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Autenticación de dos factores</p>
                  <p className="text-xs text-white/40 mt-0.5">Añade una capa extra de seguridad con TOTP</p>
                </div>
                <button onClick={() => setShow2fa(!show2fa)} className={cn('btn-secondary text-sm px-3 py-2', show2fa && 'text-success border-success/30')}>
                  {show2fa ? <><Check size={14} /> Activado</> : <><Smartphone size={14} /> Activar</>}
                </button>
              </div>
              {show2fa && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass rounded-xl p-4 space-y-3">
                  <p className="text-sm text-white/60">Escanea este código QR con Google Authenticator o Authy:</p>
                  <div className="flex justify-center p-3 bg-white rounded-xl w-fit">
                    <QRCode value="otpauth://totp/FitForge:user@email.com?secret=JBSWY3DPEHPK3PXP&issuer=FitForge" size={128} />
                  </div>
                  <input placeholder="Introduce el código de 6 dígitos" className="input text-center tracking-widest font-mono" maxLength={6} inputMode="numeric" />
                  <button className="btn-primary text-sm w-full">Verificar y activar</button>
                </motion.div>
              )}
            </div>
          )}

          {active === 'notifications' && (
            <div className="space-y-5">
              <h2 className="font-semibold">Notificaciones</h2>
              {[
                { key: 'workout' as const,      label: 'Recordatorios de entrenamiento', desc: 'Recibe alertas antes de tu rutina' },
                { key: 'diet' as const,         label: 'Registro de dieta',              desc: 'Recuerda registrar tus comidas' },
                { key: 'social' as const,       label: 'Actividad social',               desc: 'Likes, comentarios y retos' },
                { key: 'achievements' as const, label: 'Logros y XP',                   desc: 'Notificaciones de progreso' },
                { key: 'email' as const,        label: 'Notificaciones por email',       desc: 'Resumen semanal y novedades' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-white/40">{desc}</p>
                  </div>
                  <Toggle checked={notifs[key]} onChange={(v) => setNotifs((p) => ({ ...p, [key]: v }))} />
                </div>
              ))}
            </div>
          )}

          {active === 'language' && (
            <div className="space-y-4">
              <h2 className="font-semibold">Idioma</h2>
              {[['es', '🇪🇸 Español'], ['en', '🇬🇧 English']].map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => i18n.changeLanguage(code as string)}
                  className={cn('w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left', i18n.language === code ? 'bg-brand-500/10 border-brand-500/30 text-brand-300' : 'glass border-white/10 text-white/70 hover:border-white/30')}
                >
                  <span className="text-sm font-medium">{label as string}</span>
                  {i18n.language === code && <Check size={16} className="text-brand-400" />}
                </button>
              ))}
            </div>
          )}

          {active === 'appearance' && (
            <div className="space-y-4">
              <h2 className="font-semibold">Apariencia</h2>
              <p className="text-sm text-white/50">Tema: Oscuro (por defecto — optimizado para mejor experiencia)</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 rounded-xl border border-brand-500/50 bg-surface text-center text-sm font-medium">
                  🌑 Oscuro
                </button>
                <button className="p-4 rounded-xl glass border border-white/10 text-center text-sm font-medium text-white/50 opacity-50 cursor-not-allowed" disabled>
                  ☀️ Claro (próximamente)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
